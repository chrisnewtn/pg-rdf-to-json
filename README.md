# pg-rdf-to-json

[![Tests Badge][tests-badge]][tests]

Transforms RDF files from [rdf-files.tar.bz2][rdf-files.tar.bz2] provided by [Project Gutenberg][project-gutenberg] into JS/JSON objects.

## Usage

There are two main ways to use this library: As a CLI or as a library.

### CLI

> [!WARNING]
> Document CLI usage once finalized.

### Library

The library exposes two generator functions for converting RDF files to JSON.

#### `booksFromStream`

Accepts a [`Readable`][readable] stream as its only parameter.

This function expects the passed stream to yield the text of at least one XML file.

This function is an [async generator][async-genertator] which means [it conforms to the async iterator protocol][async-iterator]. This means you can read its results using a [`for-await...of`][for-await-of] loop like so:

```js
const tar = spawn('tar', ['-lxOf', 'rdf-files.tar.bz2']);

for await (const book of booksFromStream(tar.stdout)) {
  console.log(book.title);
}
```

#### `booksFromArchive`

Accepts a path to a `.tar.bz2` file as a `string` as its only parameter.

> [!IMPORTANT]
> This function spawns an internal instance of [`tar`][tar] and has only been tested on Linux.

Like [`booksFromStream`](#booksfromstream), this function is an [async generator][async-genertator] which means [it conforms to the async iterator protocol][async-iterator]. This means you can read its results using a [`for-await...of`][for-await-of] loop like so:

```js
for await (const book of booksFromArchive('rdf-files.tar.bz2')) {
  console.log(book.title);
}
```

[rdf-files.tar.bz2]: https://www.gutenberg.org/cache/epub/feeds/
[project-gutenberg]: https://www.gutenberg.org/
[tests]: https://github.com/chrisnewtn/pg-rdf-to-json/actions/workflows/tests.yml
[tests-badge]: https://github.com/chrisnewtn/pg-rdf-to-json/actions/workflows/tests.yml/badge.svg
[readable]: https://nodejs.org/docs/latest-v22.x/api/stream.html#class-streamreadable
[async-generator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*
[async-iterator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols
[for-await-of]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
[tar]: https://www.man7.org/linux/man-pages/man1/tar.1.html
