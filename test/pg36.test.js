import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { getSingleBook } from './shared.js';

describe('pg36.rdf', () => {
  /** @type {import('../dist/types.js').Book} */
  let book;

  before(async () => (book = await getSingleBook('pg36.rdf')));

  it('has an "about" of 36', () => {
    equal(book.about, 36);
  });

  it('has a title of "The War of the Worlds"', () => {
    equal(book.title, 'The War of the Worlds');
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated marc520 field', () => {
    equal(book.marc[520], '"The War of the Worlds" by H. G. Wells is a science fiction novel written in the late 19th century, during a time when literature began to explore themes of alien life and the potential consequences of space exploration. The narrative focuses on the harrowing invasion of Earth by Martians, highlighting the struggles of human civilization when faced with technologically superior beings. The story is primarily told through the experiences of an unnamed protagonist who witnesses the unfolding chaos.  At the start of the book, the stage is set for an extraordinary and unsettling invasion. It opens with a reflective take on humanity\'s ignorance of the vastness of space and the potential dangers that lie beyond it. Soon, the protagonist observes a falling star that turns out to be a mysterious cylinder from Mars, which crashes on Horsell Common. Alongside astronomers who first notice disturbing phenomena on Mars, the protagonist soon becomes entwined in the ensuing panic once it becomes apparent that extraterrestrial beings are making a terrifying arrival. As the narrative explores the fears and reactions of those witnessing the Martian emergence, the tone is charged with suspense, foreshadowing the catastrophic events that are about to unfold. (This is an automatically generated summary.)');
  });

  it('has language equalling ["en"]', () => {
    deepEqual(book.language, ['en']);
  });

  it('has an creator of "Wells, H. G. (Herbert George)"', () => {
    deepEqual(book.relators, [{
      about: 30,
      name: 'Wells, H. G. (Herbert George)',
      codes: ['cre'],
      birthdate: 1866,
      deathdate: 1946,
      alias: ['Wells, Herbert George'],
      webpage: ['https://en.wikipedia.org/wiki/H._G._Wells'],
    }]);
  });

  it('has a subject of "Fiction", "Martians" and others', () => {
    deepEqual(book.subject, [
      'Science fiction',
      'War stories',
      'Martians -- Fiction',
      'Mars (Planet) -- Fiction',
      'Space warfare -- Fiction',
      'Imaginary wars and battles -- Fiction',
      'Life on other planets -- Fiction',
      'PR'
    ]);
  });

  it('has a bookshelf of "Browsing: Fiction", "Movie Books" and others', () => {
    deepEqual(book.bookshelf, [
      'Science Fiction',
      'Movie Books',
      'Browsing: History - Warfare',
      'Browsing: Science-Fiction & Fantasy',
      'Browsing: Fiction',
    ]);
  });

  it('has a 16 related files', () => {
    equal(book.files.length, 16);

    deepEqual(book.files.slice(0, 1), [
      {
        about: 'https://www.gutenberg.org/ebooks/36.html.images',
        isFormatOf: {
          resource: book.about
        },
        format: [
          'text/html',
          'text/html'
        ],
        extent: [
          385247,
          385453,
        ],
        modified: [
          new Date('2025-01-01T03:44:04.561947'),
          new Date('2023-10-01T03:42:33.010789')
        ]
      }
    ]);
  });
});
