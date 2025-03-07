import readline from 'node:readline/promises';
import { XMLParser } from 'fast-xml-parser';
import { spawn } from 'node:child_process';
import internal from 'node:stream';
import { type UnformattedRDFFile } from './types.js';
import { inspect } from 'node:util';
import { formatRDFFile } from './formatter.js';

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

  const attrUnionDiscriminators = new Map([
    [
      'rdf:RDF.pgterms:ebook.dcterms:creator.pgterms:agent',
      (attrs: {[ k: string]: string }) => {
        attrs.kind = 'agent';
      }
    ],
    [
      'rdf:RDF.pgterms:ebook.marcrel:edt.pgterms:agent',
      (attrs: {[ k: string]: string }) => {
        attrs.kind = 'agent';
      }
    ],
    [
      'rdf:RDF.pgterms:ebook.dcterms:creator',
      (attrs: {[ k: string]: string }) => {
        if (Object.hasOwn(attrs, 'resource')) {
          attrs.kind = 'resource';
        }
      }
    ],
    [
      'rdf:RDF.pgterms:ebook.marcrel:edt',
      (attrs: {[ k: string]: string }) => {
        if (Object.hasOwn(attrs, 'resource')) {
          attrs.kind = 'resource';
        }
      }
    ],
  ]);

  const arrays = new Set([
    'rdf.ebook.subject',
    'rdf.ebook.editor',
    'rdf.ebook.editor.agent.alias',
    'rdf.ebook.editor.agent.webpage',
    'rdf.ebook.creator',
    'rdf.ebook.creator.agent.alias',
    'rdf.ebook.creator.agent.webpage',
    'rdf.ebook.files.file.format',
    'rdf.ebook.files.file.extent',
    'rdf.ebook.files.file.modified',
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
    [
      'rdf:RDF.pgterms:ebook.marcrel:edt',
      'editor'
    ],
  ]);

  const parser = new XMLParser({
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

      const unionDiscriminator = attrUnionDiscriminators.get(jPath);

      if (unionDiscriminator) {
        unionDiscriminator(attrs);
      }

      if (matches !== null && matches.groups) {
        return tagNameTransforms.get(jPath) ||
          lowerFirstChar(matches.groups.name);
      }

      return tagName;
    },
  });

  for await (const file of processArchive(stream)) {
    yield parser.parse(file) as UnformattedRDFFile;
  }
}

export async function* booksFromStream(stream: internal.Readable) {
  for await (const file of rdfFileStream(stream)) {
    const eBook = file.rdf.ebook;

    try {
      if (!Object.hasOwn(eBook, 'title')) {
        continue;
      }
      if (!Object.hasOwn(eBook, 'type')) {
        continue;
      }
      yield formatRDFFile(file).rdf.ebook;
    } catch (cause) {
      const bookId = eBook.about;
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
