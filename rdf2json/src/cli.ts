#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { booksFromStream, booksFromArchive } from './index.js';
import { Book } from './classes.js';
import { RDFFile } from './types.js';

function setToArray(_key: any, val: any) {
  if (val instanceof Set) {
    return Array.from(val);
  }
  return val;
}

function simplify(key: string, val: any) {
  if (val instanceof Set) {
    return Array.from(val);
  }
  if (typeof val?.['#text'] === 'string') {
    switch (val?.datatype) {
      case 'http://www.w3.org/2001/XMLSchema#integer':
        return parseInt(val['#text'], 10);
      case 'http://www.w3.org/2001/XMLSchema#dateTime':
        return new Date(val['#text']).toJSON();
      case 'http://www.w3.org/2001/XMLSchema#date':
        return val['#text'];
      case 'http://purl.org/dc/terms/RFC4646':
        return val['#text'];
      case 'http://purl.org/dc/terms/IMT':
        return val['#text'];
    }
  }
  return val;
}

function log(contents: string) {
  process.stdout.moveCursor(0, -1);
  process.stdout.cursorTo(0);
  process.stdout.clearLine(0);
  process.stdout.write(contents);
  process.stdout.write('\n');
}

async function booksToFiles(books: AsyncGenerator<any>, output: string) {
  let processed = 0;

  const createdDirectories = new Set();

  for await (const book of books) {
    if (processed > 10) {
      break;
    }
    const bookId = book.about;
    const newFile = path.join(output, `${bookId}.json`);
    const newDir = path.dirname(newFile);

    if (!createdDirectories.has(newDir)) {
      await fs.mkdir(newDir, {recursive: true});
      createdDirectories.add(newDir);
    }

    await fs.writeFile(newFile, JSON.stringify(book, setToArray, 2), 'utf8');

    const count = (++processed).toString().padStart(5, '0');

    log(`processed ${count}: ${bookId}`);
  }
}

async function booksToStdout(books: AsyncGenerator<any>) {
  for await (const book of books) {
    process.stdout.write(JSON.stringify(book, simplify));
    process.stdout.write('\n');
  }
}

const [input, output] = process.argv.slice(2);

const books = input !== '-' ?
  booksFromArchive(input) :
  booksFromStream(process.stdin);

if (output) {
  await booksToFiles(books, output);
} else {
  await booksToStdout(books);
}
