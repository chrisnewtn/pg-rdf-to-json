import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';
import { Book } from '../dist/classes.js';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const pathToFixture = path.resolve(import.meta.dirname, 'fixtures', 'pg11-test.rdf');

describe('pg11-test.rdf', () => {
  /** @type {Book} */
  let book;

  before(async () => {
    for await (const b of booksFromStream(createReadStream(pathToFixture))) {
      book = b;
    }
  });

  it('is skipped as it lacks a type', () => {
    equal(book, undefined);
  });
});
