import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { Ajv } from 'ajv/dist/jtd.js';
import { formattedEbookSchema } from '../dist/types.js';
import { extractProp } from '../dist/util.js';

const id = '11';
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

  it(`has an "about" of "ebooks/${id}"`, () => {
    equal(book.about, `ebooks/${id}`);
  });

  it('has a title of "Alice\'s Adventures in Wonderland"', () => {
    equal(book.title, 'Alice\'s Adventures in Wonderland');
  });

  it('has an alterative title of "Alice in Wonderland"', () => {
    deepEqual(book.alternative, [
      'Alice in Wonderland'
    ]);
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated marc520 field', () => {
    equal(book.marc520, '"Alice\'s Adventures in Wonderland" by Lewis Carroll is a classic children\'s novel written in the mid-19th century. The story follows a young girl named Alice who, feeling bored and sleepy while sitting by a riverbank, encounters a White Rabbit and follows it down a rabbit hole, plunging into a fantastical world filled with curious creatures and whimsical adventures.  The opening of the book introduces Alice as she daydreams about her surroundings before spotting the White Rabbit, who is both flustered and animated. Curious, Alice pursues the Rabbit and finds herself tumbling down a deep rabbit hole, leading to a curious hall filled with doors, all locked. After experiencing a series of bizarre changes in size from eating and drinking mysterious substances, she begins exploring this new world, initially frustrated by her newfound challenges as she navigates her size and the peculiar inhabitants she meets. The narrative sets the tone for Alice\'s whimsical and often nonsensical adventures that characterize the entire tale. (This is an automatically generated summary.)');
  });

  it('has language equalling ["en"]', () => {
    deepEqual(book.language, ['en']);
  });

  it('has an creator of "Carroll, Lewis"', () => {
    deepEqual(book.creator, [
      {
        about: '2009/agents/7',
        kind: 'agent',
        name: 'Carroll, Lewis',
        birthdate: 1832,
        deathdate: 1898,
        alias: [
          'Dodgson, Charles Lutwidge',
        ],
        webpage: [
          'https://en.wikipedia.org/wiki/Lewis_Carroll',
        ],
      }
    ]);
  });

  it('has subjects of "Children\'s stories" and others', () => {
    deepEqual(book.subject, [
      'Fantasy fiction',
      'Children\'s stories',
      'Imaginary places -- Juvenile fiction',
      'Alice (Fictitious character from Carroll) -- Juvenile fiction',
      'PR',
      'PZ',
    ]);
  });

  it('has bookshelves of "Children\'s Literature" and others', () => {
    deepEqual(book.bookshelf, [
      'Children\'s Literature',
      'Browsing: Children & Young Adult Reading',
      'Browsing: Fiction',
    ]);
  });

  it('has a 14 related files', () => {
    equal(book.files.length, 14);

    deepEqual(book.files.slice(0, 1), [
      {
        about: 'https://www.gutenberg.org/ebooks/11.html.images',
        format: [
          'text/html',
          'text/html',
        ],
        extent: [
          192440,
          192637,
        ],
        isFormatOf: {
          resource: book.about
        },
        modified: [
          new Date('2025-01-01T03:32:37.533868'),
          new Date('2023-10-01T03:32:23.395134')
        ]
      }
    ]);
  });
});
