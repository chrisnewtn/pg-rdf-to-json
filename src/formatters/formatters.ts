import { relators } from '../input-schemas/relators.js';
import {
  type Formatter,
  type FormattedRDFFile,
  type UnformattedRDFFile,
} from '../types.js';
import formatDatetime from './formatDatetime.js';
import formatDate from './formatDate.js';
import formatDescription from './formatDescription.js';
import formatInteger from './formatInteger.js';
import formatLanguage from './formatLanguage.js';
import formatStandaloneText from './formatStandaloneText.js';
import formatStandaloneResource from './formatStandaloneResource.js';
import formatValue from './formatValue.js';
import hoistStandaloneObjectValue from './hoistStandaloneObjectValue.js';
import formatAgent, { postProcessRelators } from './formatAgent.js';
import mergeMarcField, { postProcessMarcFields } from './mergeMarcField.js';
import { marcRanges } from '../input-schemas/marc.js';
import decodeStandaloneText from './decodeStandaloneText.js';

type Rule = [string, Formatter | Formatter[]];

export const formatters: Map<Rule[0], Rule[1]> = new Map([
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
    decodeStandaloneText
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

/**
 * The rules necessary to produce a valid `TaggedAgent` at the passed `path`.
 * @param path the pass to the single agnet or array of agents.
 */
function agentRules(path: string): Rule[] {
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

for (const [relator] of relators) {
  for (const [path, formatter] of agentRules(`rdf.ebook.${relator}`)) {
    formatters.set(path, formatter);
  }
}

for (const [start, end] of marcRanges) {
  for (let i = start; i <= end; i++) {
    formatters.set(
      `rdf.ebook.marc${i.toString().padStart(3, '0')}`,
      [formatStandaloneText, mergeMarcField]
    );
  }
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
  postProcessRelators(newObject, original);

  // Store all found marc fields against a single object.
  postProcessMarcFields(newObject, original);

  return newObject;
}

/**
 * Accepts a parsed, but not formatted RDF file. It isn't possible _just_ using
 * `fast-xml-parser` to move keys and values around. This additional formatting
 * step reduces the complexity of the parsed XML object by:
 *
 *  * reducing the depth of unnecessesarily nested objects.
 *  * converting certain values into more suitable data types.
 *  * grouping similar fields like MARC fields.
 *  * enforcing structural rules e.g. `files` **must** be defined.
 *
 * This function recursively goes through the `original` object, returning a
 * deep clone of it, but with every single one of its values parsed where a
 * parser for the path has been defined.
 *
 * If the `original` object looks like this:
 *
 * ```json
 * {
 *   "title": "hello",
 *   "desciption": {
 *     "short": "a short description",
 *     "long": "a long description"
 *   }
 * }
 * ```
 *
 * And a formatter has been defined that applies to the path
 * `description.short`, but no others have been defined, then only that single
 * value will be parsed. Every other value will be added to the new object
 * without any changes.
 *
 * The formatters applied to the `original` object is defined at
 * {@link formatters}.
 *
 * @param original The parsed, but unformatted RDF file.
 * @returns A formatted RDF file.
 */
export function formatRDFFile(original: UnformattedRDFFile) {
  const newObject: { [key: string]: any } = {};

  for (const [key, val] of Object.entries(original)) {
    newObject[key] = formatValue(key, val, key, original);
  }

  return postProccessObject(newObject, original) as FormattedRDFFile;
}
