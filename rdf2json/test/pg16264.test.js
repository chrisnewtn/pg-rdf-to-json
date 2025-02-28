import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { Agent, Book, File, Resource } from '../dist/classes.js';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const id = '16264';
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

  it('has a title of "Deutsches Leben der Gegenwart"', () => {
    equal(book.title, 'Deutsches Leben der Gegenwart');
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated description field', () => {
    equal(book.description, '"Deutsches Leben der Gegenwart" by Bekker, Briefs, Scheler, Sommerfeld, and Witkop is a collective analysis of contemporary German life written in the early 20th century. This work explores various aspects of German culture, including literature, music, philosophy, science, and economic problems in the wake of World War I. The contributors, all prominent figures in their respective fields, aim to provide insights into the spiritual refreshment and growth arising from Germany\'s hardships, emphasizing the resilience of the inner cultural landscape despite external struggles.  The opening of "Deutsches Leben der Gegenwart" delves into the complex dynamics of German culture following a period of turmoil. The foreword, penned by Prof. Dr. Philipp Witkop, reflects on how Germany has historically experienced significant cultural flourishing in times of adversity, asserting that creative forces from literature, music, and philosophy are emerging anew despite political and economic challenges. Through a focus on the literary and spiritual revival following the destruction brought about by the war, the text sets the foundation for examining each contributing author\'s perspective on how contemporary German culture is characterized by both introspection and resilience. (This is an automatically generated summary.)');
  });

  it('has languages equalling ["de"]', () => {
    deepEqual(book.languages, ['de']);
  });

  it('has various authors including "Bekker, Paul"', () => {
    deepEqual(book.authors, [
      new Agent({
        id: '2009/agents/6582',
        name: 'Bekker, Paul',
        birthDate: 1882,
        deathDate: 1937,
        aliases: new Set(),
        webpages: new Set([
          'http://de.wikipedia.org/wiki/Paul_Bekker'
        ]),
      }),
      new Agent({
        id: '2009/agents/6585',
        name: 'Briefs, Goetz A. (Goetz Antony)',
        birthDate: 1889,
        deathDate: 1974,
        aliases: new Set([
          'Briefs, Goetz Antony'
        ]),
        webpages: new Set([
          'http://de.wikipedia.org/wiki/G%C3%B6tz_Briefs'
        ]),
      }),
      new Agent({
        id: '2009/agents/6583',
        name: 'Scheler, Max',
        birthDate: 1874,
        deathDate: 1928,
        aliases: new Set([
          'Scheler, Max Ferdinand'
        ]),
        webpages: new Set([
          'https://en.wikipedia.org/wiki/Max_Scheler',
          'https://de.wikipedia.org/wiki/Max_Scheler'
        ]),
      }),
      new Agent({
        id: '2009/agents/6584',
        name: 'Sommerfeld, Arnold',
        birthDate: 1868,
        deathDate: 1951,
        aliases: new Set([
          'Sommerfeld, Arnold Johannes Wilhelm',
          'Sommerfeld, A. (Arnold)'
        ]),
        webpages: new Set([
          'https://en.wikipedia.org/wiki/Arnold_Sommerfeld'
        ]),
      }),
      new Resource({
        resource: '2009/agents/6581'
      }),
    ]);
  });

  it('has a subjects of "Civilization", "Germany" and "DD"', () => {
    deepEqual(book.subjects, new Set([
      'Civilization',
      'Germany',
      'DD',
    ]));
  });

  it('has a bookshelves of "DE Sachbuch" and others', () => {
    deepEqual(book.bookshelves, new Set([
      'Browsing: Culture/Civilization/Society',
      'Browsing: History - General',
      'DE Sachbuch',
      'German Language Books',
    ]));
  });

  it('has a 16 related files', () => {
    equal(book.files.length, 16);

    deepEqual(book.files.slice(0, 1), [
      new File({
        href: new URL('https://www.gutenberg.org/ebooks/16264.html.images'),
        contentTypes: new Set([
          'text/html'
        ]),
        extents: [
          618773,
          618144,
        ],
        modifiedDates: new Set([
          new Date('2025-01-15T19:29:25.239431'),
          new Date('2023-09-07T10:16:09.141390')
        ])
      })
    ]);
  });
});
