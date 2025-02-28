import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { Agent, Book, File, Resource } from '../dist/classes.js';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const id = '11';
const file = `pg${id}.rdf`;

const pathToFixture = path.resolve(import.meta.dirname, 'fixtures', file);

describe(file, () => {
  /** @type {Book} */
  let book;

  before(async () => {
    for await (const b of booksFromStream(createReadStream(pathToFixture))) {
      book = b;
    }
  });

  it(`has an id of "ebooks/${id}"`, () => {
    equal(book.id, `ebooks/${id}`);
  });

  it('has a title of "Alice\'s Adventures in Wonderland"', () => {
    equal(book.title, 'Alice\'s Adventures in Wonderland');
  });

  it('has an alterative title of "Alice in Wonderland"', () => {
    deepEqual(book.alternativeTitles, [
      'Alice in Wonderland'
    ]);
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated description field', () => {
    equal(book.description, '"Alice\'s Adventures in Wonderland" by Lewis Carroll is a classic children\'s novel written in the mid-19th century. The story follows a young girl named Alice who, feeling bored and sleepy while sitting by a riverbank, encounters a White Rabbit and follows it down a rabbit hole, plunging into a fantastical world filled with curious creatures and whimsical adventures.  The opening of the book introduces Alice as she daydreams about her surroundings before spotting the White Rabbit, who is both flustered and animated. Curious, Alice pursues the Rabbit and finds herself tumbling down a deep rabbit hole, leading to a curious hall filled with doors, all locked. After experiencing a series of bizarre changes in size from eating and drinking mysterious substances, she begins exploring this new world, initially frustrated by her newfound challenges as she navigates her size and the peculiar inhabitants she meets. The narrative sets the tone for Alice\'s whimsical and often nonsensical adventures that characterize the entire tale. (This is an automatically generated summary.)');
  });

  it('has languages equalling ["en"]', () => {
    deepEqual(book.languages, ['en']);
  });

  it('has an author of "Carroll, Lewis"', () => {
    deepEqual(book.authors, [
      new Agent({
        id: '2009/agents/7',
        name: 'Carroll, Lewis',
        birthDate: 1832,
        deathDate: 1898,
        aliases: new Set([
          'Dodgson, Charles Lutwidge',
        ]),
        webpages: new Set([
          'https://en.wikipedia.org/wiki/Lewis_Carroll',
        ]),
      })
    ]);
  });

  it('has subjects of "Children\'s stories" and others', () => {
    deepEqual(book.subjects, new Set([
      'Children\'s stories',
      'Alice (Fictitious character from Carroll)',
      'Fantasy fiction',
      'Imaginary places',
      'Juvenile fiction',
      'PR',
      'PZ',
    ]));
  });

  it('has bookshelves of "Children\'s Literature" and others', () => {
    deepEqual(book.bookshelves, new Set([
      'Children\'s Literature',
      'Browsing: Children & Young Adult Reading',
      'Browsing: Fiction',
    ]));
  });

  it('has a 14 related files', () => {
    equal(book.files.length, 14);

    deepEqual(book.files.slice(0, 1), [
      new File({
        href: new URL('https://www.gutenberg.org/ebooks/11.html.images'),
        contentTypes: new Set([
          'text/html'
        ]),
        extents: [
          192440,
          192637,
        ],
        modifiedDates: new Set([
          new Date('2025-01-01T03:32:37.533868'),
          new Date('2023-10-01T03:32:23.395134')
        ])
      })
    ]);
  });
});
