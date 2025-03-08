import { relators } from './input-schemas/relators.js';
import { type FormattedRDFFile, type UnformattedRDFFile } from './types.js';

const shared: WeakMap<UnformattedRDFFile, any[]> = new WeakMap();

type Formatter = (
  key: string,
  val: any,
  path: string,
  original: UnformattedRDFFile
) => any;

function formatNumber(
  key: string,
  val: any,
  path: string
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
  path: string
) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#integer') {
    throw new TypeError(`Expected integer datatype at ${path}.datatype`);
  }
  return formatNumber(key, val, path);
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

  if (Object.keys(value).length !== 1) {
    return formatObject(key, value, path, original);
  }

  const [onlyKey] = Object.keys(value);

  if (onlyKey !== 'agent') {
    return value;
  }

  const formattedAgent = formatValue(
    onlyKey,
    value[onlyKey],
    `${path}.${onlyKey}`,
    original
  );

  if (relators.has(key)) {
    formattedAgent.code = key;
  }

  if (shared.has(original)) {
    shared.get(original)?.push(formattedAgent);
  } else {
    shared.set(original, [formattedAgent]);
  }

  return formattedAgent;
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

const formatters: Map<string,  Formatter> = new Map([
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
    'rdf.ebook.marc010',
    formatNumber
  ],
  [
    'rdf.ebook.marc250',
    formatStandaloneText
  ],
  [
    'rdf.ebook.marc260',
    formatStandaloneText
  ],
  [
    'rdf.ebook.marc300',
    formatStandaloneText
  ],
  [
    'rdf.ebook.marc440',
    formatStandaloneText
  ],
  [
    'rdf.ebook.marc508',
    formatStandaloneText
  ],
  [
    'rdf.ebook.marc520',
    formatStandaloneText
  ],
  [
    'rdf.ebook.marc546',
    formatStandaloneText
  ],
  [
    'rdf.ebook.marc901',
    formatStandaloneText
  ],
  [
    'rdf.ebook.marc905',
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
    return formatter(key, value, path, original);
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
  if (Array.isArray(newObject.rdf.ebook.title) &&
    Array.isArray(newObject.rdf.ebook.alternative)) {
    const moreAlternatives = newObject.rdf.ebook.title.slice(1);
    newObject.rdf.ebook.title = newObject.rdf.ebook.title[0];
    newObject.rdf.ebook.alternative =
      moreAlternatives.concat(newObject.rdf.ebook.alternative);
  }

  // `subject` is a common enough field that I'd rather it always be set and
  // empty, than the field itself being conditional.
  if (!Object.hasOwn(newObject.rdf.ebook, 'subject')) {
    newObject.rdf.ebook.subject = [];
  }

  const relators = shared.get(original);

  if (Array.isArray(relators)) {
    for (const {code} of relators) {
      if (code) {
        delete newObject.rdf.ebook[code];
      }
    }
    newObject.rdf.ebook.relators = relators;
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
