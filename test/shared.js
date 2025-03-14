import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { Ajv } from 'ajv/dist/jtd.js';
import { formattedEbookSchema } from '../dist/types.js';
import { extractProp } from '../dist/util.js';

const ajv = new Ajv();
export const validate = ajv.compile(formattedEbookSchema);

export function getValidationErrors(validateFunction, book) {
  return (validateFunction.errors || []).map(error => ({
    ...error,
    value: extractProp(book, error.instancePath)
  }));
}

export async function getSingleBook(file) {
  const pathToFixture = path.resolve(import.meta.dirname, 'fixtures', file);

  /** @type {import('../dist/types.js').FormattedEbook} */
  let book;

  for await (const b of booksFromStream(createReadStream(pathToFixture))) {
    book = b;
  }

  return book;
}

export function getFixtureId(filename) {
  return filename.match(/pg(\d+).test.js$/)[1];
}

export function generateSchemaValidationSuite(id) {
  const file = `pg${id}.rdf`;

  describe(file, () => {
    /** @type {import('../dist/types.js').FormattedEbook} */
    let book;

    before(async () => (book = await getSingleBook(file)));

    it('is a valid ebook', () => {
      validate(book);
      deepEqual(getValidationErrors(validate, book), []);
    });
  });
}
