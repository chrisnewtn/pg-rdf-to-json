import { type FormattedRDFFile, type UnformattedRDFFile } from './types.js';

type Formatter = (key: string, val: any, path: string) => any;

function formatNumber(key: string, val: any, path: string) {
  const parsed = parseInt(val?.['#text'], 10);

  if (Number.isNaN(parsed)) {
    new TypeError(`Expected number at ${path}. Got ${val?.['#text']}`);
  }

  return parsed;
}

function formatInteger(key: string, val: any, path: string) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#integer') {
    throw new TypeError(`Expected integer datatype at ${path}.datatype`);
  }
  return formatNumber(key, val, path);
}

function formatDatetime(key: string, val: any, path: string) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#dateTime') {
    throw new TypeError(`Expected dateTime datatype at ${path}.datatype`);
  }
  return new Date(val?.['#text']);
}

function formatDate(key: string, val: any, path: string) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#date') {
    throw new TypeError(`Expected date datatype at ${path}.datatype`);
  }
  return val?.['#text'];
}

function formatDescription(key: string, val: any, path: string) {
  const value = val?.description?.value?.['#text'];

  if (!value) {
    throw new TypeError(`Expected #text at ${path}.description.value.#text`);
  }

  return value;
}

function formatStandaloneText(key: string, val: any, path: string) {
  if (typeof val !== 'object' ||
    Object.keys(val).length !== 1 ||
    typeof val?.['#text'] !== 'string'
  ) {
    throw new TypeError(`Expected single string value #text at ${path}`);
  }
  return val?.['#text'];
}

function formatStandaloneResource(key: string, val: any, path: string) {
  if (typeof val !== 'object' ||
    Object.keys(val).length !== 1 ||
    typeof val?.resource !== 'string'
  ) {
    throw new TypeError(`Expected single string value at ${path}.resource`);
  }
  return val?.resource;
}

function hoistStandaloneObjectValue(key: string, value: any, path: string) {
  if (typeof value !== 'object') {
    throw new TypeError(`Expected object at ${path}`);
  }

  if (Object.keys(value).length !== 1) {
    throw new TypeError(`Expected single key at ${path}`);
  }

  const [onlyKey] = Object.keys(value);

  return formatValue(onlyKey, value[onlyKey], `${path}.${onlyKey}`);
}

function hoistSpecificObjectValue(keyToHoist: string) {
  return function hoist(key: string, value: any, path: string) {
    if (typeof value !== 'object') {
      throw new TypeError(`Expected object at ${path}`);
    }

    if (Object.keys(value).length !== 1) {
      return formatObject(key, value, path);
      // throw new TypeError(`Expected single key at ${path}. Got: ${Object.keys(value).join(', ')}`);
    }

    const [onlyKey] = Object.keys(value);

    if (onlyKey !== keyToHoist) {
      return value;
    }
    return formatValue(onlyKey, value[onlyKey], `${path}.${onlyKey}`);
  }
}

function formatLanguage(key: string, val: any, path: string) {
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
    'rdf.ebook.marc901',
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
  ...agentRules('rdf.ebook.performer'),
  ...agentRules('rdf.ebook.composer'),
  ...agentRules('rdf.ebook.librettist'),
  ...agentRules('rdf.ebook.illustrator'),
  ...agentRules('rdf.ebook.contributor'),
  ...agentRules('rdf.ebook.translator'),
  ...agentRules('rdf.ebook.editor'),
  ...agentRules('rdf.ebook.creator'),
  ...agentRules('rdf.ebook.aui'),
  ...agentRules('rdf.ebook.arranger'),
  ...agentRules('rdf.ebook.unk'),
  ...agentRules('rdf.ebook.compiler'),
  ...agentRules('rdf.ebook.other'),
]);

function agentRules(path: string): [string, Formatter][] {
  return [
    [
      path,
      hoistSpecificObjectValue('agent')
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

function formatObject(key: string, value: object, path: string) {
  const rtn: { [key: string]: any } = {};

    for (const [skey, val] of Object.entries(value)) {
      rtn[skey] = formatValue(skey, val, `${path}.${skey}`);
    }

    return rtn;
}

function formatValue(key: string, value: any, path: string): any {
  if (Array.isArray(value)) {
    return value.map(val => formatValue(key, val, path))
  }

  const formatter = formatters.get(path);

  if (formatter) {
    return formatter(key, value, path);
  }

  if (typeof value === 'object') {
    return formatObject(key, value, path);
  }

  return value;
}

function postProccessObject(value: any) {
  // This fixes the extremely rare case of a book having multiple titles,
  // without those titles using the alternative element like they should.
  if (Array.isArray(value.rdf.ebook.title) &&
    Array.isArray(value.rdf.ebook.alternative)) {
    const moreAlternatives = value.rdf.ebook.title.slice(1);
    value.rdf.ebook.title = value.rdf.ebook.title[0];
    value.rdf.ebook.alternative =
      moreAlternatives.concat(value.rdf.ebook.alternative);
  }
  return value;
}

export function formatRDFFile(value: UnformattedRDFFile) {
  const rtn: { [key: string]: any } = {};

  for (const [key, val] of Object.entries(value)) {
    rtn[key] = formatValue(key, val, key);
  }

  return postProccessObject(rtn) as FormattedRDFFile;
}
