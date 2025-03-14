import { XMLParser } from "fast-xml-parser";
import { relators } from './input-schemas/relators.js';

/**
 * Sends the first character of the passed string to upper case.
 */
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

/**
 * Sends the first character of the passed string to lower case.
 */
function lowerFirstChar(str: string) {
  return str.charAt(0).toLowerCase() + str.substring(1);
}

/**
 * Returns null. Used to instruct `XMLParser` to not parse tag or attribute
 * values.
 */
function returnNull() {
  return null;
}

const tagNameMatcher = /^(?<ns>\w+):(?<name>\w+)$/;
const attrNameMatcher = /^@_(?<ns>\w+):(?<name>\w+)$/;

export function getParser() {
  const tagNameMap: Map<string, string> = new Map();
  const attrNameMap: Map<string, string> = new Map();

  const arrays = new Set([
    'rdf.ebook.subject',
    'rdf.ebook.files',
    'rdf.ebook.files.file.format',
    'rdf.ebook.files.file.extent',
    'rdf.ebook.files.file.modified',
    'rdf.ebook.description',
    'rdf.ebook.language',
    'rdf.ebook.alternative',
    'rdf.ebook.bookshelf',
    'rdf.ebook.marc901',
    'rdf.ebook.marc508',
  ]);

  const tagNameTransforms = new Map([
    [
      'rdf:RDF',
      'rdf'
    ],
    [
      'rdf:RDF.pgterms:ebook.rdf:about',
      'id'
    ],
    [
      'rdf:RDF.pgterms:ebook.dcterms:hasFormat',
      'files'
    ],
  ]);

  for (const [relator] of relators) {
    addAgentField(
      `rdf:RDF.pgterms:ebook.marcrel:${relator}`
    );
  }

  addAgentField(
    'rdf:RDF.pgterms:ebook.dcterms:creator'
  );

  function addAgentField(originalPath: string) {
    const matches = originalPath.match(/:(?<name>\w+)$/);

    if (!matches || !matches.groups) {
      throw new Error('no matches');
    }

    arrays.add(`rdf.ebook.${matches.groups.name}`);
    arrays.add(`rdf.ebook.${matches.groups.name}.agent.alias`);
    arrays.add(`rdf.ebook.${matches.groups.name}.agent.webpage`);
  }

  return new XMLParser({
    alwaysCreateTextNode: true,
    ignoreDeclaration: true,
    trimValues: true,
    isArray(tagName, jPath, isLeafNode, isAttribute) {
      return arrays.has(jPath);
    },
    ignoreAttributes(attrName, jPath) {
      return attrName.startsWith('xmlns:');
    },
    transformAttributeName(attrName: string) {
      const matches = attrNameMatcher.exec(attrName);

      if (matches === null || !matches.groups) {
        return attrName;
      }

      const namespace = attrNameMap.get(matches.groups.name);

      if (tagNameMap.has(matches.groups.name)) {
        return `attr${capitalize(matches.groups.name)}`;
      }

      if (!namespace) {
        attrNameMap.set(matches.groups.name, matches.groups.ns);
      } else if (namespace !== matches.groups.ns) {
        return `${matches.groups.ns}${capitalize(matches.groups.name)}`;
      }

      return lowerFirstChar(matches.groups.name);
    },
    tagValueProcessor: returnNull,
    attributeValueProcessor: returnNull,
    updateTag(tagName, jPath, attrs) {
      const matches = tagNameMatcher.exec(tagName);

      if (matches !== null && matches.groups) {
        return tagNameTransforms.get(jPath) ||
          lowerFirstChar(matches.groups.name);
      }

      return tagName;
    },
  });
}
