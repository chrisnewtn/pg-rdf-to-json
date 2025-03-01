#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { booksFromStream, booksFromArchive } from './index.js';
import { Book } from './classes.js';

function setToArray(_key: any, val: any) {
  if (val instanceof Set) {
    return Array.from(val);
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

async function booksToFiles(books: AsyncGenerator<Book>, output: string) {
  let processed = 0;

  const createdDirectories = new Set();

  for await (const book of books) {
    const newFile = path.join(output, `${book.id}.json`);
    const newDir = path.dirname(newFile);

    if (!createdDirectories.has(newDir)) {
      await fs.mkdir(newDir, {recursive: true});
      createdDirectories.add(newDir);
    }

    await fs.writeFile(newFile, JSON.stringify(book, setToArray, 2), 'utf8');

    const count = (++processed).toString().padStart(5, '0');
    
    log(`processed ${count}: ${book.id}}`);
  }
}

async function booksToStdout(books: AsyncGenerator<Book>) {
  for await (const book of books) {
    process.stdout.write(JSON.stringify(book, setToArray));
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
