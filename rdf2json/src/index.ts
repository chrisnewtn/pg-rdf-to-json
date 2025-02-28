import readline from 'node:readline/promises';
import { XMLParser } from 'fast-xml-parser';
import { spawn } from 'node:child_process';
import internal from 'node:stream';
import { type RDFFile } from './types.js';
import { Book } from './classes.js';

async function* processArchive(archiveStream: internal.Readable) {
  let file = '';

  const stream = readline.createInterface(archiveStream);

  for await (const line of stream) {
    const chunkString = line.toString();

    if (chunkString === '<?xml version="1.0" encoding="utf-8"?>') {
      if (file !== '') {
        yield file;
      }
      file = chunkString;
    } else {
      file += '\n' + line;
    }
  }

  if (file !== '') {
    yield file;
  }
}

async function* rdfFileStream(stream: internal.Readable) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    alwaysCreateTextNode: true
  });

  for await (const file of processArchive(stream)) {
    yield parser.parse(file) as RDFFile;
  }
}

export async function* booksFromStream(stream: internal.Readable) {
  for await (const file of rdfFileStream(stream)) {
    try {
      if (!Object.hasOwn(file['rdf:RDF']['pgterms:ebook'], 'dcterms:title')) {
        continue;
      }
      yield new Book(file);
    } catch (cause) {
      const bookId = file['rdf:RDF']['pgterms:ebook']['@_rdf:about'];
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
