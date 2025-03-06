import readline from 'node:readline/promises';
import { XMLParser } from 'fast-xml-parser';
import { spawn } from 'node:child_process';
import internal from 'node:stream';
import { type RDFFile } from './types.js';
import { Book } from './classes.js';
import { inspect } from 'node:util';
import { formatObject } from './formatter.js';

async function* processArchive(archiveStream: internal.Readable) {
  let file = '';

  const stream = readline.createInterface(archiveStream);

  for await (const line of stream) {
    if (line === '<?xml version="1.0" encoding="utf-8"?>') {
      if (file !== '') {
        yield file;
      }
      file = line;
    } else {
      file += '\n' + line;
    }
  }

  if (file !== '') {
    yield file;
  }
}

async function* rdfFileStream(stream: internal.Readable) {
  const tagNameMatcher = /^(?<ns>\w+):(?<name>\w+)$/;
  const attrNameMatcher = /^@_(?<ns>\w+):(?<name>\w+)$/

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }
  const lowerFirstChar = (str: string) => {
    return str.charAt(0).toLowerCase() + str.substring(1);
  }

  const manualTagNameMap = new Map([
    ['rdf:RDF', 'rdf'],
  ]);

  const manualAttrNameMap = new Map([
  ]);

  const tagNameMap: Map<string, string> = new Map();
  const attrNameMap: Map<string, string> = new Map();

  const arrays = new Set([
    'rdf.ebook.subject',
    'rdf.ebook.creator',
    'rdf.ebook.creator.agent.alias',
    'rdf.ebook.creator.agent.webpage',
    'rdf.ebook.hasformat.file.format',
    'rdf.ebook.hasformat.file.extent',
    'rdf.ebook.hasformat.file.modified',
    'rdf.ebook.description',
    'rdf.ebook.language',
    'rdf.ebook.alternative',
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
    // [
    //   'rdf:RDF.pgterms:ebook.dcterms:language',
    //   'languages'
    // ]
  ]);

  const parser = new XMLParser({
    // ignoreAttributes: false,
    alwaysCreateTextNode: true,
    ignoreDeclaration: true,
    trimValues: true,
    // textNodeName: 'text',
    isArray(tagName, jPath, isLeafNode, isAttribute) {
      // console.log(isAttribute, jPath);
      return arrays.has(jPath);
    },
    ignoreAttributes(attrName, jPath) {
      return attrName.startsWith('xmlns:');
    },
    transformTagName(tagName: string) {
      return tagName;
      // if (manualTagNameMap.has(tagName)) {
      //   return manualTagNameMap.get(tagName) as string;
      // }
      // const matches = tagNameMatcher.exec(tagName);

      // if (matches === null || !matches.groups) {
      //   return tagName;
      // }

      // const namespace = tagNameMap.get(matches.groups.name);

      // if (!namespace) {
      //   tagNameMap.set(matches.groups.name, matches.groups.ns);
      // } else if (namespace !== matches.groups.ns) {
      //   return `${matches.groups.ns}${capitalize(matches.groups.name)}`;
      // }

      // return lowerFirstChar(matches.groups.name);
    },
    transformAttributeName(attrName: string) {
      if (manualAttrNameMap.has(attrName)) {
        return manualAttrNameMap.get(attrName) as string;
      }
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
    tagValueProcessor(tagName, tagValue) {
      return null;
    },
    attributeValueProcessor(attrName, attrValue) {
      return null;
    },
    updateTag(tagName, jPath, attrs) {
      const matches = tagNameMatcher.exec(tagName);

      if (matches !== null && matches.groups) {
        return tagNameTransforms.get(jPath) ||
          lowerFirstChar(matches.groups.name);
      }

      return tagName;
    },
  });

  for await (const file of processArchive(stream)) {
    const parsed = parser.parse(file);
    yield parsed;
  }
}

export async function* booksFromStream(stream: internal.Readable) {
  for await (const file of rdfFileStream(stream)) {
    // console.log(inspect(file, {depth: Infinity, colors: true}));
    const eBook = file.rdf.ebook;

    try {
      if (!Object.hasOwn(eBook, 'title')) {
        continue;
      }
      if (!Object.hasOwn(eBook, 'type')) {
        continue;
      }
      yield formatObject(file).rdf.ebook;
    } catch (cause) {
      const bookId = eBook.id;
      throw new Error(`Problem parsing "${bookId}"`, {cause});
    }
  }
}

export async function* booksFromArchive(pathToArchive: string) {
  const inputStream = spawn('tar', ['-lxOf', pathToArchive]);

  yield* booksFromStream(inputStream.stdout);

  if (inputStream.exitCode !== 0) {
    for await (const chunk of inputStream.stderr) {
      throw new Error(chunk.toString());
    }
  }
}
