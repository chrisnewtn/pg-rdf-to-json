import { before, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';
import { getSingleBook, getValidationErrors, validate } from './shared.js';

const id = 54567;
const file = `pg${id}.rdf`;

describe(file, () => {
  /** @type {import('../dist/types.js').Book} */
  let book;

  before(async () => (book = await getSingleBook(file)));

  it('is a valid ebook', () => {
    validate(book);
    deepEqual(getValidationErrors(validate), []);
  });

  it(`has an "about" of ${id}`, () => {
    equal(book.about, id);
  });

  it('has a title of "Bizarre Happenings Eyewitnessed Over Two Decades"', () => {
    equal(book.title, 'Bizarre Happenings Eyewitnessed Over Two Decades');
  });

  it('has alternative titles', () => {
    deepEqual(book.alternative, [
      '二十年目睹之怪現狀',
      'Erh-shih nien mu-tu-chih kuai hsien-chuang',
      'Er shi nian mu du zhi guai xian zhuang',
      'Bizarre Happenings Eyewitnessed Over Two Decades',
    ]);
  });

  it('has a type of "Text"', () => {
    equal(book.type, 'Text');
  });

  it('has a populated marc520 field', () => {
    equal(book.marc[520], '"Bizarre Happenings Eyewitnessed Over Two Decades" by Jianren Wu is a collection of personal anecdotes or observations likely written in the late 19th century. The text appears to delve into a range of unusual, intricate events and experiences witnessed by the narrator over two decades, particularly focusing on societal changes in Shanghai.   At the start of the narrative, the author introduces a bustling scene in Shanghai, highlighting the city\'s vibrant social life and the constant interactions that revolve around networking and personal connections. The narrator reflects on their own transformation over the years, having once participated in the lively yet superficial activities of society, to a more seasoned outlook marked by survival from past treacheries. The opening sets the stage for a series of bizarre events intertwined with personal growth, as the narrator stands on the brink of a deeper exploration into the complexities of human behavior and societal norms in a rapidly changing urban landscape. (This is an automatically generated summary.)');
  });

  it('has language equalling ["zh"]', () => {
    deepEqual(book.language, ['zh']);
  });

  it('has a creator of "Wu, Jianren"', () => {
    deepEqual(book.relators, [
      {
        about: 26060,
        name: 'Wu, Jianren',
        codes: ['cre'],
        birthdate: 1866,
        deathdate: 1910,
        alias: [
          '吳趼人',
          '吴趼人',
          'Wu, Woyao',
          'Wu, Chien-jen',
          'Wu, Yanren',
        ],
        webpage: [
          'http://zh.wikipedia.org/wiki/%E5%90%B3%E6%B2%83%E5%A0%AF',
        ],
      }
    ]);
  });

  it('has a subject of "PL" and others', () => {
    deepEqual(book.subject, [
      'Chinese fiction -- Qing dynasty, 1644-1912',
      'Short stories, Chinese',
      'PL',
    ]);
  });

  it('has a bookshelf of "Browsing: Fiction" and others', () => {
    deepEqual(book.bookshelf, [
      'Browsing: Culture/Civilization/Society',
      'Browsing: Literature',
      'Browsing: Fiction',
    ]);
  });

  it('has a 15 related files', () => {
    equal(book.files.length, 15);

    deepEqual(book.files.slice(0, 1), [
      {
        about: 'https://www.gutenberg.org/ebooks/54567.html.images',
        isFormatOf: {
          resource: book.about
        },
        format: [
          'text/html',
          'text/html',
        ],
        extent: [
          791538,
          790882,
        ],
        modified: [
          new Date('2025-01-21T15:09:59.374150'),
          new Date('2023-09-23T12:14:43.474566')
        ]
      }
    ]);
  });
});
