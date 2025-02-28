import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { Agent, Book, File } from '../dist/classes.js';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const pathToFixture = path.resolve(import.meta.dirname, 'fixtures', 'pg36.rdf');

describe('pg36.rdf', () => {
  /** @type {Book} */
  let book;

  before(async () => {
    for await (const b of booksFromStream(createReadStream(pathToFixture))) {
      book = b;
    }
  });

  it('has an id of "ebooks/36"', () => {
    equal(book.id, 'ebooks/36');
  });

  it('has a title of "The War of the Worlds"', () => {
    equal(book.title, 'The War of the Worlds');
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated description field', () => {
    equal(book.description, '"The War of the Worlds" by H. G. Wells is a science fiction novel written in the late 19th century, during a time when literature began to explore themes of alien life and the potential consequences of space exploration. The narrative focuses on the harrowing invasion of Earth by Martians, highlighting the struggles of human civilization when faced with technologically superior beings. The story is primarily told through the experiences of an unnamed protagonist who witnesses the unfolding chaos.  At the start of the book, the stage is set for an extraordinary and unsettling invasion. It opens with a reflective take on humanity\'s ignorance of the vastness of space and the potential dangers that lie beyond it. Soon, the protagonist observes a falling star that turns out to be a mysterious cylinder from Mars, which crashes on Horsell Common. Alongside astronomers who first notice disturbing phenomena on Mars, the protagonist soon becomes entwined in the ensuing panic once it becomes apparent that extraterrestrial beings are making a terrifying arrival. As the narrative explores the fears and reactions of those witnessing the Martian emergence, the tone is charged with suspense, foreshadowing the catastrophic events that are about to unfold. (This is an automatically generated summary.)');
  });

  it('has languages equalling ["en"]', () => {
    deepEqual(book.languages, ['en']);
  });

  it('has an author of "Wells, H. G. (Herbert George)"', () => {
    deepEqual(book.authors, [new Agent({
      id: '2009/agents/30',
      name: 'Wells, H. G. (Herbert George)',
      birthDate: 1866,
      deathDate: 1946,
      aliases: new Set(['Wells, Herbert George']),
      webpages: new Set(['https://en.wikipedia.org/wiki/H._G._Wells']),
    })]);
  });

  it('has a subjects of "Fiction", "Martians" and others', () => {
    deepEqual(book.subjects, new Set([
      'Fiction',
      'Imaginary wars and battles',
      'Life on other planets',
      'Mars (Planet)',
      'Martians',
      'PR',
      'Science fiction',
      'Space warfare',
      'War stories',
    ]));
  });

  it('has a bookshelves of "Browsing: Fiction", "Movie Books" and others', () => {
    deepEqual(book.bookshelves, new Set([
      'Browsing: Fiction',
      'Browsing: History - Warfare',
      'Browsing: Science-Fiction & Fantasy',
      'Movie Books',
      'Science Fiction',
    ]));
  });

  it('has a 16 related files', () => {
    equal(book.files.length, 16);

    deepEqual(book.files.slice(0, 1), [
      new File({
        href: new URL('https://www.gutenberg.org/ebooks/36.html.images'),
        contentTypes: new Set([
          'text/html'
        ]),
        extents: [
          385247,
          385453,
        ],
        modifiedDates: new Set([
          new Date('2025-01-01T03:44:04.561947'),
          new Date('2023-10-01T03:42:33.010789')
        ])
      })
    ]);
  });
});
