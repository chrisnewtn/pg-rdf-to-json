import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { Ajv } from 'ajv/dist/jtd.js';
import { formattedEbookSchema } from '../dist/types.js';
import { extractProp } from '../dist/util.js';

const id = '24017';
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

  it(`has an "about of "ebooks/${id}"`, () => {
    equal(book.about, `ebooks/${id}`);
  });

  it('has a title of "Das Motiv der Kästchenwahl"', () => {
    equal(book.title, 'Das Motiv der Kästchenwahl');
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated marc520 field', () => {
    equal(book.marc520, '"Das Motiv der Kästchenwahl" by Sigmund Freud is a scientific publication written in the early 20th century. The book delves into the symbolic interpretation of mythological and literary themes, particularly those resembling a choice motif often portrayed through narratives involving female characters. Freud analyzes the intersections of mythology, literature, and psychoanalysis, emphasizing how these stories reflect human psychology and unconscious motivations.  In this work, Freud examines the recurring theme of choice among three women in various narratives, such as Shakespeare\'s "The Merchant of Venice" and "King Lear." He discusses how these choices often indicate deeper psychoanalytic meanings, where the third option typically represents an underlying theme of death or the unconscious. Freud suggests that the third sister or woman often embodies a complex relationship with mortality, reflecting the choices individuals face between love, life, and loss. Through this analysis, Freud seeks to uncover hidden motivations behind human behavior using psychoanalytic techniques to interpret these literary and mythological narratives. (This is an automatically generated summary.)');
  });

  it('has language equalling ["de"]', () => {
    deepEqual(book.language, ['de']);
  });

  it('has an creator of "Freud, Sigmund"', () => {
    deepEqual(book.creator, [
      {
        kind: 'agent',
        about: '2009/agents/391',
        name: 'Freud, Sigmund',
        birthdate: 1856,
        deathdate: 1939,
        webpage: [
          'https://en.wikipedia.org/wiki/Sigmund_Freud',
          'https://de.wikipedia.org/wiki/Sigmund_Freud',
        ],
      }
    ]);
  });

  it('has a subject of "BF", "Psychoanalysis" and others', () => {
    deepEqual(book.subject, [
      'Psychoanalysis',
      'Motivation (Psychology)',
      'BF',
    ]);
  });

  it('has a bookshelf of "Browsing: Philosophy & Ethics" and others', () => {
    deepEqual(book.bookshelf, [
      'DE Sachbuch',
      'Browsing: Philosophy & Ethics',
      'Browsing: Psychiatry/Psychology',
    ]);
  });

  it('has a 18 related files', () => {
    equal(book.files.length, 18);

    deepEqual(book.files.slice(0, 1), [
      {
        about: 'https://www.gutenberg.org/ebooks/24017.html.images',
        isFormatOf: {
          resource: book.about
        },
        format: [
          'text/html',
          'text/html',
        ],
        extent: [
          56887,
          56896,
        ],
        modified: [
          new Date('2025-01-10T06:04:50.885815'),
          new Date('2023-09-11T03:32:47.953905')
        ]
      }
    ]);
  });
});
