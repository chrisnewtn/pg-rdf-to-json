import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { getSingleBook } from './shared.js';

const id = 1692;
const file = `pg${id}.rdf`;

describe(file, () => {
  /** @type {import('../dist/types.js').Book} */
  let book;

  before(async () => (book = await getSingleBook(file)));

  it(`has an "about" of ${id}`, () => {
    equal(book.about, id);
  });

  it('has a title of "1492"', () => {
    equal(book.title, '1492');
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated marc520 field', () => {
    equal(book.marc[520], '"1492" by Mary Johnston is a historical novel written in the early 20th century. The story unfolds during a pivotal moment in Spanish history, focusing on Jayme de Marchena, a man of complex heritage caught amidst the tumult of the Spanish Inquisition and the cultural conflicts of the time. It explores themes of identity, faith, and the quest for knowledge against the backdrop of significant historical events, such as the expulsion of Jews from Spain and Columbus\'s journey into the unknown.  The opening of the novel introduces Jayme de Marchena, who reflects on his life filled with academic pursuits and personal anguish due to his Jewish ancestry. As tensions rise in Spain, he feels the weight of danger from the Inquisition and contemplates his fate. Jayme seeks refuge at a Franciscan convent, where he meets Fray Juan Perez, with whom he discusses his precarious situation and future. The chapter sets a tone of melancholy and introspection, hinting at Jayme\'s internal struggles and the larger historical currents surrounding him as he prepares to take a significant step toward both survival and adventure. The chapter ends with Jayme contemplating the vast, untamed ocean, foreshadowing the exploration that lies ahead. (This is an automatically generated summary.)');
  });

  it('has language equalling ["en"]', () => {
    deepEqual(book.language, ['en']);
  });

  it('has an creator of "Johnston, Mary"', () => {
    deepEqual(book.relators, [
      {
        about: 695,
        name: 'Johnston, Mary',
        codes: ['cre'],
        birthdate: 1870,
        deathdate: 1936,
        webpage: [
          'http://en.wikipedia.org/wiki/Mary_Johnston'
        ],
      }
    ]);
  });

  it('has a subject of "Explorers", "Fiction" and others', () => {
    deepEqual(book.subject, [
      'Historical fiction',
      'Sea stories',
      'Biographical fiction',
      'Columbus, Christopher, 1451-1506 -- Fiction',
      'Discoveries in geography -- Fiction',
      'Jewish sailors -- Fiction',
      'Explorers -- Fiction',
      'Admirals -- Fiction',
      'America -- Discovery and exploration -- Fiction',
      'PS',
    ]);
  });

  it('has a bookshelf of "Browsing: Fiction" and others', () => {
    deepEqual(book.bookshelf, [
      'Browsing: History - General',
      'Browsing: Literature',
      'Browsing: Fiction',
    ]);
  });

  it('has a 18 related files', () => {
    equal(book.files.length, 18);

    deepEqual(book.files.slice(0, 1), [
      {
        about: 'https://www.gutenberg.org/ebooks/1692.html.images',
        isFormatOf: {
          resource: book.about
        },
        format: [
          'text/html',
          'text/html',
        ],
        extent: [
          681334,
          681324,
        ],
        modified: [
          new Date('2025-01-07T18:07:57.394294'),
          new Date('2023-10-01T09:44:19.040429')
        ]
      }
    ]);
  });
});
