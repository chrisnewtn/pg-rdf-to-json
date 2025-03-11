import { relators } from './input-schemas/relators.js';
import { type FormattedRDFFile, type UnformattedRDFFile } from './types.js';

const sharedRelators: WeakMap<UnformattedRDFFile, any[]> = new WeakMap();
const sharedMarc: WeakMap<UnformattedRDFFile, Record<string, any>> = new WeakMap();

type Formatter = (
  key: string,
  val: any,
  path: string,
  original: UnformattedRDFFile
) => any;

function formatNumber(
  key: string,
  val: any,
  path: string,
  original: UnformattedRDFFile
) {
  const parsed = parseInt(val?.['#text'], 10);

  if (Number.isNaN(parsed)) {
    new TypeError(`Expected number at ${path}. Got ${val?.['#text']}`);
  }

  return parsed;
}

function formatInteger(
  key: string,
  val: any,
  path: string,
  original: UnformattedRDFFile
) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#integer') {
    throw new TypeError(`Expected integer datatype at ${path}.datatype`);
  }
  return formatNumber(key, val, path, original);
}

function formatDatetime(
  key: string,
  val: any,
  path: string
) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#dateTime') {
    throw new TypeError(`Expected dateTime datatype at ${path}.datatype`);
  }
  return new Date(val?.['#text']);
}

function formatDate(
  key: string,
  val: any,
  path: string
) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#date') {
    throw new TypeError(`Expected date datatype at ${path}.datatype`);
  }
  return val?.['#text'];
}

function formatDescription(
  key: string,
  val: any,
  path: string
) {
  const value = val?.description?.value?.['#text'];

  if (!value) {
    throw new TypeError(`Expected #text at ${path}.description.value.#text`);
  }

  return value;
}

function formatStandaloneText(
  key: string,
  val: any,
  path: string
) {
  if (typeof val !== 'object' ||
    Object.keys(val).length !== 1 ||
    typeof val?.['#text'] !== 'string'
  ) {
    throw new TypeError(`Expected single string value #text at ${path}`);
  }
  return val?.['#text'];
}

function formatStandaloneResource(
  key: string,
  val: any,
  path: string
) {
  if (typeof val !== 'object' ||
    Object.keys(val).length !== 1 ||
    typeof val?.resource !== 'string'
  ) {
    throw new TypeError(`Expected single string value at ${path}.resource`);
  }
  return val?.resource;
}

function hoistStandaloneObjectValue(
  key: string,
  value: any,
  path: string,
  original: UnformattedRDFFile
) {
  if (typeof value !== 'object') {
    throw new TypeError(`Expected object at ${path}`);
  }

  if (Object.keys(value).length !== 1) {
    throw new TypeError(`Expected single key at ${path}`);
  }

  const [onlyKey] = Object.keys(value);

  return formatValue(onlyKey, value[onlyKey], `${path}.${onlyKey}`, original);
}

function formatAgent(
  key: string,
  value: any,
  path: string,
  original: UnformattedRDFFile
) {
  if (typeof value !== 'object') {
    throw new TypeError(`Expected object at ${path}`);
  }

  const keys = Object.keys(value);
  let formattedRelator;

  if (keys[0] === 'agent') {
    formattedRelator = formatValue(
      keys[0],
      value[keys[0]],
      `${path}.${keys[0]}`,
      original
    );
  } else if (keys.includes('resource')) {
    formattedRelator = formatObject(key, value, path, original);
  } else {
    return formatObject(key, value, path, original);
  }

  if (relators.has(key)) {
    formattedRelator.code = key;
  }

  if (sharedRelators.has(original)) {
    sharedRelators.get(original)?.push(formattedRelator);
  } else {
    sharedRelators.set(original, [formattedRelator]);
  }

  return formattedRelator;
}

function formatLanguage(
  key: string,
  val: any,
  path: string
) {
  const value = val?.description?.value;

  if (value?.datatype !== 'http://purl.org/dc/terms/RFC4646') {
    throw new TypeError(`Expected RFC4646 datatype at ${path}.description.value.datatype`);
  }

  return value?.['#text'];
}

const marcMatcher = /^marc(?<id>\d{3})$/;

function mergeMarcField(
  key: string,
  value: any,
  path: string,
  original: UnformattedRDFFile
) {
  const matches = marcMatcher.exec(key);

  if (!matches || !matches.groups) {
    throw new Error(`Expected field to start with "marc". Got "${key}"`);
  }

  const marcFields = sharedMarc.get(original);

  if (!marcFields) {
    sharedMarc.set(original, { [matches.groups.id]: value });
  } else {
    marcFields[matches.groups.id] = value;
  }

  return value;
}

const formatters: Map<string,  Formatter | Formatter[]> = new Map([
  [
    'rdf.ebook.files',
    hoistStandaloneObjectValue
  ],
  [
    'rdf.ebook.files.file.format',
    formatDescription
  ],
  [
    'rdf.ebook.files.file.extent',
    formatInteger
  ],
  [
    'rdf.ebook.files.file.modified',
    formatDatetime
  ],
  [
    'rdf.ebook.bookshelf',
    formatDescription
  ],
  [
    'rdf.ebook.subject',
    formatDescription
  ],
  [
    'rdf.ebook.type',
    formatDescription
  ],
  [
    'rdf.ebook.language',
    formatLanguage
  ],
  [
    'rdf.ebook.alternative',
    formatStandaloneText
  ],
  [
    'rdf.ebook.downloads',
    formatInteger
  ],
  [
    'rdf.ebook.rights',
    formatStandaloneText
  ],
  [
    'rdf.ebook.license',
    formatStandaloneResource
  ],
  [
    'rdf.ebook.title',
    formatStandaloneText
  ],
  [
    'rdf.ebook.description',
    formatStandaloneText
  ],
  [
    'rdf.ebook.tableOfContents',
    formatStandaloneText
  ],
  [
    'rdf.ebook.publisher',
    formatStandaloneText
  ],
  [
    'rdf.ebook.issued',
    formatDate
  ],
  ...agentRules('rdf.ebook.creator'),
]);

for (const [relator] of relators) {
  for (const [path, formatter] of agentRules(`rdf.ebook.${relator}`)) {
    formatters.set(path, formatter);
  }
}

function agentRules(path: string): [string, Formatter][] {
  return [
    [
      path,
      formatAgent,
    ],
    [
      `${path}.agent.name`,
      formatStandaloneText
    ],
    [
      `${path}.agent.birthdate`,
      formatInteger
    ],
    [
      `${path}.agent.deathdate`,
      formatInteger
    ],
    [
      `${path}.agent.alias`,
      formatStandaloneText
    ],
    [
      `${path}.agent.webpage`,
      formatStandaloneResource
    ]
  ];
}

const marcRanges = [
  [  1,   8], // 00X: Control Fields
  [ 10,  99], // 01X-09X: Numbers and Code Fields
  [100, 199], // 1XX: Main Entry Fields
  [200, 249], // 20X-24X: Title and Title-Related Fields
  [250, 289], // 25X-28X: Edition, Imprint, Etc. Fields
  [300, 399], // 3XX: Physical Description, Etc. Fields
  [400, 499], // 4XX: Series Statement Fields
  [500, 599], // 5XX: Note Fields
  [600, 699], // 6XX: Subject Access Fields
  [700, 759], // 70X-75X: Added Entry Fields
  [760, 789], // 76X-78X: Linking Entry and Description Fields
  [800, 839], // 80X-83X: Series Added Entry Fields
  [841, 889], // 841-88X: Holdings, Location, Alternate Graphics, Etc. Fields
  [900, 909], // Vendor specific fields.
];

for (const [start, end] of marcRanges) {
  for (let i = start; i <= end; i++) {
    formatters.set(
      `rdf.ebook.marc${i.toString().padStart(3, '0')}`,
      [formatStandaloneText, mergeMarcField]
    );
  }
}

function formatObject(
  key: string,
  value: object,
  path: string,
  original: UnformattedRDFFile
) {
  const rtn: { [key: string]: any } = {};

  for (const [skey, val] of Object.entries(value)) {
    rtn[skey] = formatValue(skey, val, `${path}.${skey}`, original);
  }

  return rtn;
}

function formatValue(
  key: string,
  value: any,
  path: string,
  original: UnformattedRDFFile
): any {
  if (Array.isArray(value)) {
    return value.map(val => formatValue(key, val, path, original))
  }

  const formatter = formatters.get(path);

  if (formatter) {
    if (!Array.isArray(formatter)) {
      return formatter(key, value, path, original);
    }
    return formatter.reduce((memo, f) => f(key, memo, path, original), value);
  }

  if (typeof value === 'object') {
    return formatObject(key, value, path, original);
  }

  return value;
}

function postProccessObject(
  newObject: any,
  original: UnformattedRDFFile
) {
  // This fixes the extremely rare case of a book having multiple titles,
  // without those titles using the alternative element like they should.
  if (Array.isArray(newObject.rdf.ebook.title)) {
    const moreAlternatives = newObject.rdf.ebook.title.slice(1);
    newObject.rdf.ebook.title = newObject.rdf.ebook.title[0];

    if (Array.isArray(newObject.rdf.ebook.alternative)) {
      newObject.rdf.ebook.alternative =
        moreAlternatives.concat(newObject.rdf.ebook.alternative);
    } else {
      newObject.rdf.ebook.alternative = moreAlternatives;
    }
  }

  // `subject` is a common enough field that I'd rather it always be set and
  // empty, than the field itself being conditional.
  if (!Object.hasOwn(newObject.rdf.ebook, 'subject')) {
    newObject.rdf.ebook.subject = [];
  }

  // `bookshelf` is a common enough field that I'd rather it always be set and
  // empty, than the field itself being conditional.
  if (!Object.hasOwn(newObject.rdf.ebook, 'bookshelf')) {
    newObject.rdf.ebook.bookshelf = [];
  }

  // `files` is extremely commonly set, so just guarantee it.
  if (!Object.hasOwn(newObject.rdf.ebook, 'files')) {
    newObject.rdf.ebook.files = [];
  }

  // Store all found relators on against a single array.
  const relators = sharedRelators.get(original);

  if (Array.isArray(relators)) {
    newObject.rdf.ebook.relators = [];

    for (const relator of relators) {
      if (relator.code) {
        newObject.rdf.ebook.relators.push(relator);
        delete newObject.rdf.ebook[relator.code];
      }
    }
  }

  // Store all found marc fields against a single object.
  const marcFields = sharedMarc.get(original);

  if (marcFields) {
    newObject.rdf.ebook.marc = marcFields;

    for (const key of Object.keys(marcFields)) {
      delete newObject.rdf.ebook[`marc${key}`];
    }
  } else {
    newObject.rdf.ebook.marc = {};
  }

  return newObject;
}

export function formatRDFFile(value: UnformattedRDFFile) {
  const newObject: { [key: string]: any } = {};

  for (const [key, val] of Object.entries(value)) {
    newObject[key] = formatValue(key, val, key, value);
  }

  return postProccessObject(newObject, value) as FormattedRDFFile;
}
