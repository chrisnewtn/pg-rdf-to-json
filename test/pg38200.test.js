import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const id = '38200';
const file = `pg${id}.rdf`;

const pathToFixture = path.resolve(import.meta.dirname, 'fixtures', file);

describe(file, () => {
  let book;

  before(async () => {
    for await (const b of booksFromStream(createReadStream(pathToFixture))) {
      book = b;
    }
  });

  it('is skipped as it is empty', () => {
    equal(book, undefined);
  });
});
