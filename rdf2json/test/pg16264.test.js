import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { Ajv } from 'ajv/dist/jtd.js';
import { formattedEbookSchema } from '../dist/types.js';
import { extractProp } from '../dist/util.js';

const id = '16264';
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

  it('has a title of "Deutsches Leben der Gegenwart"', () => {
    equal(book.title, 'Deutsches Leben der Gegenwart');
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated marc520 field', () => {
    equal(book.marc[520], '"Deutsches Leben der Gegenwart" by Bekker, Briefs, Scheler, Sommerfeld, and Witkop is a collective analysis of contemporary German life written in the early 20th century. This work explores various aspects of German culture, including literature, music, philosophy, science, and economic problems in the wake of World War I. The contributors, all prominent figures in their respective fields, aim to provide insights into the spiritual refreshment and growth arising from Germany\'s hardships, emphasizing the resilience of the inner cultural landscape despite external struggles.  The opening of "Deutsches Leben der Gegenwart" delves into the complex dynamics of German culture following a period of turmoil. The foreword, penned by Prof. Dr. Philipp Witkop, reflects on how Germany has historically experienced significant cultural flourishing in times of adversity, asserting that creative forces from literature, music, and philosophy are emerging anew despite political and economic challenges. Through a focus on the literary and spiritual revival following the destruction brought about by the war, the text sets the foundation for examining each contributing author\'s perspective on how contemporary German culture is characterized by both introspection and resilience. (This is an automatically generated summary.)');
  });

  it('has language equalling ["de"]', () => {
    deepEqual(book.language, ['de']);
  });

  it('has various creator including "Bekker, Paul"', () => {
    deepEqual(book.creator, [
      {
        kind: 'agent',
        about: '2009/agents/6582',
        name: 'Bekker, Paul',
        birthdate: 1882,
        deathdate: 1937,
        webpage: [
          'http://de.wikipedia.org/wiki/Paul_Bekker'
        ],
      },
      {
        kind: 'agent',
        about: '2009/agents/6585',
        name: 'Briefs, Goetz A. (Goetz Antony)',
        birthdate: 1889,
        deathdate: 1974,
        alias: [
          'Briefs, Goetz Antony'
        ],
        webpage: [
          'http://de.wikipedia.org/wiki/G%C3%B6tz_Briefs'
        ],
      },
      {
        kind: 'agent',
        about: '2009/agents/6583',
        name: 'Scheler, Max',
        birthdate: 1874,
        deathdate: 1928,
        alias: [
          'Scheler, Max Ferdinand'
        ],
        webpage: [
          'https://en.wikipedia.org/wiki/Max_Scheler',
          'https://de.wikipedia.org/wiki/Max_Scheler'
        ],
      },
      {
        kind: 'agent',
        about: '2009/agents/6584',
        name: 'Sommerfeld, Arnold',
        birthdate: 1868,
        deathdate: 1951,
        alias: [
          'Sommerfeld, Arnold Johannes Wilhelm',
          'Sommerfeld, A. (Arnold)'
        ],
        webpage: [
          'https://en.wikipedia.org/wiki/Arnold_Sommerfeld'
        ],
      },
      {
        kind: 'resource',
        resource: '2009/agents/6581'
      },
    ]);
  });

  it('has a subject of "Germany -- Civilization" and "DD"', () => {
    deepEqual(book.subject, [
      'Germany -- Civilization',
      'DD',
    ]);
  });

  it('has a bookshelf of "DE Sachbuch" and others', () => {
    deepEqual(book.bookshelf, [
      'German Language Books',
      'DE Sachbuch',
      'Browsing: Culture/Civilization/Society',
      'Browsing: History - General',
    ]);
  });

  it('has a 16 related files', () => {
    equal(book.files.length, 16);

    deepEqual(book.files.slice(0, 1), [
      {
        about: 'https://www.gutenberg.org/ebooks/16264.html.images',
        isFormatOf: {
          resource: book.about
        },
        format: [
          'text/html',
          'text/html',
        ],
        extent: [
          618773,
          618144,
        ],
        modified: [
          new Date('2025-01-15T19:29:25.239431'),
          new Date('2023-09-07T10:16:09.141390')
        ]
      }
    ]);
  });
});
