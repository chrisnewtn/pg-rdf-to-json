import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { Agent, Book, File, Resource } from '../dist/classes.js';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const id = '24017';
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

  it('has a title of "Das Motiv der Kästchenwahl"', () => {
    equal(book.title, 'Das Motiv der Kästchenwahl');
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated description field', () => {
    equal(book.description, '"Das Motiv der Kästchenwahl" by Sigmund Freud is a scientific publication written in the early 20th century. The book delves into the symbolic interpretation of mythological and literary themes, particularly those resembling a choice motif often portrayed through narratives involving female characters. Freud analyzes the intersections of mythology, literature, and psychoanalysis, emphasizing how these stories reflect human psychology and unconscious motivations.  In this work, Freud examines the recurring theme of choice among three women in various narratives, such as Shakespeare\'s "The Merchant of Venice" and "King Lear." He discusses how these choices often indicate deeper psychoanalytic meanings, where the third option typically represents an underlying theme of death or the unconscious. Freud suggests that the third sister or woman often embodies a complex relationship with mortality, reflecting the choices individuals face between love, life, and loss. Through this analysis, Freud seeks to uncover hidden motivations behind human behavior using psychoanalytic techniques to interpret these literary and mythological narratives. (This is an automatically generated summary.)');
  });

  it('has languages equalling ["de"]', () => {
    deepEqual(book.languages, ['de']);
  });

  it('has an author of "Freud, Sigmund"', () => {
    deepEqual(book.authors, [
      new Agent({
        id: '2009/agents/391',
        name: 'Freud, Sigmund',
        birthDate: 1856,
        deathDate: 1939,
        webpages: new Set([
          'https://en.wikipedia.org/wiki/Sigmund_Freud',
          'https://de.wikipedia.org/wiki/Sigmund_Freud',
        ]),
      })
    ]);
  });

  it('has a subjects of "BF", "Psychoanalysis" and others', () => {
    deepEqual(book.subjects, new Set([
      'BF',
      'Motivation (Psychology)',
      'Psychoanalysis',
    ]));
  });

  it('has a bookshelves of "Browsing: Philosophy & Ethics" and others', () => {
    deepEqual(book.bookshelves, new Set([
      'Browsing: Philosophy & Ethics',
      'Browsing: Psychiatry/Psychology',
      'DE Sachbuch',
    ]));
  });

  it('has a 18 related files', () => {
    equal(book.files.length, 18);

    deepEqual(book.files.slice(0, 1), [
      new File({
        href: new URL('https://www.gutenberg.org/ebooks/24017.html.images'),
        contentTypes: new Set([
          'text/html'
        ]),
        extents: [
          56887,
          56896,
        ],
        modifiedDates: new Set([
          new Date('2025-01-10T06:04:50.885815'),
          new Date('2023-09-11T03:32:47.953905')
        ])
      })
    ]);
  });
});
