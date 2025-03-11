import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { getSingleBook, getValidationErrors, validate } from './shared.js';

const id = '59774';
const file = `pg${id}.rdf`;

describe(file, () => {
  /** @type {import('../dist/types.js').FormattedEbook} */
  let book;

  before(async () => (book = await getSingleBook(file)));

  it('is a valid ebook', () => {
    validate(book);
    deepEqual(getValidationErrors(validate), []);
  });

  it('has a title of Thirty Strange Stories', () => {
    equal(book.title, 'Thirty Strange Stories');
  });

  it('has an alternative title of 30 Strange Stories', () => {
    deepEqual(book.alternative, ['30 Strange Stories']);
  });
});
