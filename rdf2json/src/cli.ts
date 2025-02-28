#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { booksFromStream, booksFromArchive } from './index.js';

function setToArray(_key: any, val: any) {
  if (val instanceof Set) {
    return Array.from(val);
  }
  return val;
}

const [input, output] = process.argv.slice(2);

const books = input !== '-' ?
  booksFromArchive(input) :
  booksFromStream(process.stdin);

if (output) {
  let processed = 0;

  const log = (contents: string) => {
    process.stdout.moveCursor(0, -1)
    process.stdout.cursorTo(0);
    process.stdout.clearLine(0);
    process.stdout.write(contents);
    process.stdout.write('\n');
  };

  for await (const book of books) {
    const newFile = path.join(output, `${book.id}.json`);

    await fs.mkdir(path.dirname(newFile), {recursive: true});
    await fs.writeFile(newFile, JSON.stringify(book, setToArray, 2), 'utf8');

    log(`processed ${(++processed).toString().padStart(5, '0')}: ${book.id}`);
  }
} else {
  for await (const book of books) {
    process.stdout.write(JSON.stringify(book, setToArray));
    process.stdout.write('\n');
  }
}
