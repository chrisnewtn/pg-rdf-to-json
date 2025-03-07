#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { booksFromStream, booksFromArchive } from './index.js';
import { type FormattedEbook, formattedEbookSchema } from './types.js';
import { parseArgs, inspect } from 'node:util';
import { Ajv } from 'ajv/dist/jtd.js';
import { extractProp } from './util.js';

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

function logError(contents: string): Promise<void> {
  return new Promise((resolve, reject) => {
    process.stderr.write(`${contents}\n`, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  });
}

async function booksToFiles(
  books: AsyncGenerator<FormattedEbook>,
  {
    options,
    output
  }: {
    options: {
      validate?: boolean
    },
    output: string
  }
) {
  let processed = 0;

  const createdDirectories = new Set();

  const ajv = new Ajv();
  const validate = ajv.compile(formattedEbookSchema);

  for await (const book of books) {
    if (processed > 10) {
      break;
    }

    if (options.validate) {
      validate(book);

      if (Array.isArray(validate.errors)) {
        const detailedErrors = validate.errors.map(error => ({
          ...error,
          value: extractProp(book, error.instancePath)
        }));

        await logError(`Validation error for book: ${book.about}`);

        for (const error of detailedErrors) {
          await logError(inspect(error, {colors: true, depth: Infinity}));
        }

        process.exit(1);
      }
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

async function booksToStdout(books: AsyncGenerator<FormattedEbook>) {
  for await (const book of books) {
    process.stdout.write(JSON.stringify(book, setToArray));
    process.stdout.write('\n');
  }
}

const {
  values: options,
  positionals: [input, output]
} = parseArgs({
  options: {
    validate: {
      type: 'boolean'
    },
  },
  allowPositionals: true,
});

const books = input !== '-' ?
  booksFromArchive(input) :
  booksFromStream(process.stdin);

if (output) {
  await booksToFiles(books, {options, output});
} else {
  await booksToStdout(books);
}
