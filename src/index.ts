import readline from 'node:readline/promises';
import { spawn } from 'node:child_process';
import internal from 'node:stream';
import { formatRDFFile } from './formatters/formatters.js';
import { getParser } from './parser.js';
import {
  formattedEbookSchema,
  type UnformattedRDFFile,
  type FormattedEbook,
  type File,
  type Agent,
} from './types.js';

/** Re-export types for use downstream. */
export {
  formattedEbookSchema as ebookSchema,
  FormattedEbook,
  File,
  Agent,
};

/**
 * Accepts a {@link internal.Readable} stream of XML text. This generator will
 * yield the complete text of each XML document it encounters in the passed
 * stream.
 *
 * @param archiveStream A Readable stream of text.
 */
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

/**
 * Accepts a {@link internal.Readable} stream of XML text. It will parse each
 * XML document yielded by {@link processArchive} using the parser produced by
 * {@link getParser}, yielding the resulting object.
 *
 * @param stream A Readable stream of XML text.
 */
async function* rdfFileStream(stream: internal.Readable) {
  const parser = getParser();

  for await (const file of processArchive(stream)) {
    yield parser.parse(file) as UnformattedRDFFile;
  }
}

/**
 * Accepts a {@link internal.Readable} stream of XML text. This function will
 * parse each XML file and yield each parsed document as a
 * {@link FormattedEbook}.
 *
 * @param stream A Readable stream of XML text.
 */
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

/**
 * Spawns `tar -lxOf $pathToArchive`, passes the resulting stream to
 * {@link booksFromStream} and yields each resulting {@link FormattedEbook}.
 *
 * @throws Will throw the contents of `tar`'s `stderr` if it does not exit
 * cleanly.
 *
 * @param pathToArchive The path to a TAR archive.
 */
export async function* booksFromArchive(pathToArchive: string) {
  const inputStream = spawn('tar', ['-lxOf', pathToArchive]);

  yield* booksFromStream(inputStream.stdout);

  if (inputStream.exitCode !== 0) {
    for await (const chunk of inputStream.stderr) {
      throw new Error(chunk.toString());
    }
  }
}
