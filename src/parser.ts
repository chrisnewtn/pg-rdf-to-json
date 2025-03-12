import { XMLParser } from "fast-xml-parser";
import { relators } from './input-schemas/relators.js';

/**
 * Adds a property named "kind" with a value of "agent" to the passed object.
 */
function labelAgent(attrs: {[ k: string]: string }) {
  attrs.kind = 'agent';
}

/**
 * Conditionally adds a property named "kind" with a value of "resource" to the
 * passed object if it already has a property named "resource".
 */
function labelResource(attrs: {[ k: string]: string }) {
  if (Object.hasOwn(attrs, 'resource')) {
    attrs.kind = 'resource';
  }
}

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

  const attrUnionDiscriminators: Map<
    string,
    (attrs: {[ k: string]: string }) => void
  > = new Map();

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

  function addAgentField(originalPath: string, newName?: string) {
    if (!newName) {
      const matches = originalPath.match(/:(?<name>\w+)$/);

      if (!matches || !matches.groups) {
        throw new Error('no matches');
      }

      newName = matches.groups.name;
    } else {
      tagNameTransforms.set(originalPath, newName);
    }

    arrays.add(`rdf.ebook.${newName}`);
    arrays.add(`rdf.ebook.${newName}.agent.alias`);
    arrays.add(`rdf.ebook.${newName}.agent.webpage`);

    attrUnionDiscriminators.set(
      originalPath,
      labelResource
    );
    attrUnionDiscriminators.set(
      `${originalPath}.pgterms:agent`,
      labelAgent
    );
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
      const unionDiscriminator = attrUnionDiscriminators.get(jPath);

      if (unionDiscriminator) {
        unionDiscriminator(attrs);
      }

      const matches = tagNameMatcher.exec(tagName);

      if (matches !== null && matches.groups) {
        return tagNameTransforms.get(jPath) ||
          lowerFirstChar(matches.groups.name);
      }

      return tagName;
    },
  });
}