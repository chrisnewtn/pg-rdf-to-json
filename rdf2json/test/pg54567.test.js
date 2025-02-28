import { booksFromStream } from '../dist/index.js';
import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { Agent, Book, File, Resource } from '../dist/classes.js';
import { createReadStream } from 'node:fs';
import path from 'node:path';

const id = '54567';
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

  it('has a title of "Bizarre Happenings Eyewitnessed Over Two Decades"', () => {
    equal(book.title, 'Bizarre Happenings Eyewitnessed Over Two Decades');
  });

  it('has alternative titles', () => {
    deepEqual(book.alternativeTitles, [
      '二十年目睹之怪現狀',
      'Erh-shih nien mu-tu-chih kuai hsien-chuang',
      'Er shi nian mu du zhi guai xian zhuang',
      'Bizarre Happenings Eyewitnessed Over Two Decades',
    ]);
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated description field', () => {
    equal(book.description, '"Bizarre Happenings Eyewitnessed Over Two Decades" by Jianren Wu is a collection of personal anecdotes or observations likely written in the late 19th century. The text appears to delve into a range of unusual, intricate events and experiences witnessed by the narrator over two decades, particularly focusing on societal changes in Shanghai.   At the start of the narrative, the author introduces a bustling scene in Shanghai, highlighting the city\'s vibrant social life and the constant interactions that revolve around networking and personal connections. The narrator reflects on their own transformation over the years, having once participated in the lively yet superficial activities of society, to a more seasoned outlook marked by survival from past treacheries. The opening sets the stage for a series of bizarre events intertwined with personal growth, as the narrator stands on the brink of a deeper exploration into the complexities of human behavior and societal norms in a rapidly changing urban landscape. (This is an automatically generated summary.)');
  });

  it('has languages equalling ["zh"]', () => {
    deepEqual(book.languages, ['zh']);
  });

  it('has an author of "Wu, Jianren"', () => {
    deepEqual(book.authors, [
      new Agent({
        id: '2009/agents/26060',
        name: 'Wu, Jianren',
        birthDate: 1866,
        deathDate: 1910,
        aliases: new Set([
          '吳趼人',
          '吴趼人',
          'Wu, Woyao',
          'Wu, Chien-jen',
          'Wu, Yanren',
        ]),
        webpages: new Set([
          'http://zh.wikipedia.org/wiki/%E5%90%B3%E6%B2%83%E5%A0%AF',
        ]),
      })
    ]);
  });

  it('has a subjects of "Chinese fiction" and others', () => {
    deepEqual(book.subjects, new Set([
      'Chinese fiction',
      'PL',
      'Qing dynasty, 1644-1912',
      'Short stories, Chinese',
    ]));
  });

  it('has a bookshelves of "Browsing: Fiction" and others', () => {
    deepEqual(book.bookshelves, new Set([
      'Browsing: Culture/Civilization/Society',
      'Browsing: Fiction',
      'Browsing: Literature',
    ]));
  });

  it('has a 15 related files', () => {
    equal(book.files.length, 15);

    deepEqual(book.files.slice(0, 1), [
      new File({
        href: new URL('https://www.gutenberg.org/ebooks/54567.html.images'),
        contentTypes: new Set([
          'text/html'
        ]),
        extents: [
          791538,
          790882,
        ],
        modifiedDates: new Set([
          new Date('2025-01-21T15:09:59.374150'),
          new Date('2023-09-23T12:14:43.474566')
        ])
      })
    ]);
  });
});
