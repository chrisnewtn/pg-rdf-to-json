import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { Ajv } from 'ajv/dist/jtd.js';
import { formattedEbookSchema } from '../dist/types.js';
import { extractProp } from '../dist/util.js';

const id = '59774';
const file = `pg${id}.rdf`;

const pathToFixture = path.resolve(import.meta.dirname, 'fixtures', file);

describe(file, () => {
  /** @type {import('../dist/types.js').FormattedEbook} */
  let book;

  before(async () => {
    for await (const b of booksFromStream(createReadStream(pathToFixture))) {
      book = b;
    }
  });

  it('is a valid ebook', () => {
    const ajv = new Ajv();
    const validate = ajv.compile(formattedEbookSchema);
    validate(book);
    deepEqual((validate.errors || []).map(error => ({
      ...error,
      value: extractProp(book, error.instancePath)
    })), []);
  });

  it('has a title of Thirty Strange Stories', () => {
    equal(book.title, 'Thirty Strange Stories');
  });

  it('has an alternative title of 30 Strange Stories', () => {
    deepEqual(book.alternative, ['30 Strange Stories']);
  });
});
