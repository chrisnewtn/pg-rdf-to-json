import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { Agent, Book, File, Resource } from '../dist/classes.js';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const id = '1692';
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

  it('has a title of "1492"', () => {
    equal(book.title, '1492');
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated description field', () => {
    equal(book.description, '"1492" by Mary Johnston is a historical novel written in the early 20th century. The story unfolds during a pivotal moment in Spanish history, focusing on Jayme de Marchena, a man of complex heritage caught amidst the tumult of the Spanish Inquisition and the cultural conflicts of the time. It explores themes of identity, faith, and the quest for knowledge against the backdrop of significant historical events, such as the expulsion of Jews from Spain and Columbus\'s journey into the unknown.  The opening of the novel introduces Jayme de Marchena, who reflects on his life filled with academic pursuits and personal anguish due to his Jewish ancestry. As tensions rise in Spain, he feels the weight of danger from the Inquisition and contemplates his fate. Jayme seeks refuge at a Franciscan convent, where he meets Fray Juan Perez, with whom he discusses his precarious situation and future. The chapter sets a tone of melancholy and introspection, hinting at Jayme\'s internal struggles and the larger historical currents surrounding him as he prepares to take a significant step toward both survival and adventure. The chapter ends with Jayme contemplating the vast, untamed ocean, foreshadowing the exploration that lies ahead. (This is an automatically generated summary.)');
  });

  it('has languages equalling ["en"]', () => {
    deepEqual(book.languages, ['en']);
  });

  it('has various authors including "Bekker, Paul"', () => {
    deepEqual(book.authors, [
      new Agent({
        id: '2009/agents/695',
        name: 'Johnston, Mary',
        birthDate: 1870,
        deathDate: 1936,
        webpages: new Set([
          'http://en.wikipedia.org/wiki/Mary_Johnston'
        ]),
      })
    ]);
  });

  it('has a subjects of "Explorers", "Fiction" and others', () => {
    deepEqual(book.subjects, new Set([
      'Admirals',
      'America',
      'Biographical fiction',
      'Columbus, Christopher, 1451-1506',
      'Discoveries in geography',
      'Discovery and exploration',
      'Explorers',
      'Fiction',
      'Historical fiction',
      'Jewish sailors',
      'PS',
      'Sea stories',
    ]));
  });

  it('has a subjects of "Browsing: Fiction" and others', () => {
    deepEqual(book.bookshelves, new Set([
      'Browsing: Fiction',
      'Browsing: History - General',
      'Browsing: Literature',
    ]));
  });

  it('has a 18 related files', () => {
    equal(book.files.length, 18);

    deepEqual(book.files.slice(0, 1), [
      new File({
        href: new URL('https://www.gutenberg.org/ebooks/1692.html.images'),
        contentTypes: new Set([
          'text/html'
        ]),
        extents: [
          681334,
          681324,
        ],
        modifiedDates: new Set([
          new Date('2025-01-07T18:07:57.394294'),
          new Date('2023-10-01T09:44:19.040429')
        ])
      })
    ]);
  });
});
