import { booksFromStream, booksFromArchive } from "./index.ts";

function setToArray(_key: any, val: any) {
  if (val instanceof Set) {
    return Array.from(val);
  }
  return val;
}

const books = process.argv[2] ?
  booksFromArchive(process.argv[2]) :
  booksFromStream(process.stdin);

for await (const book of books) {
  process.stdout.write(JSON.stringify(book, setToArray));
  process.stdout.write('\n');
}
