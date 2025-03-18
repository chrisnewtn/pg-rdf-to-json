import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { getSingleBook } from './shared.js';

const id = '59774';
const file = `pg${id}.rdf`;

describe(file, () => {
  /** @type {import('../dist/types.js').Book} */
  let book;

  before(async () => (book = await getSingleBook(file)));

  it('has a title of Thirty Strange Stories', () => {
    equal(book.title, 'Thirty Strange Stories');
  });

  it('has an alternative title of 30 Strange Stories', () => {
    deepEqual(book.alternative, ['30 Strange Stories']);
  });
});
