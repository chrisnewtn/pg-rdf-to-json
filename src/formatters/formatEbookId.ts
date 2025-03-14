const ebookIdMatcher = /^ebooks\/(?<id>\d+)$/;

export default function formatEbookId(
  key: string,
  val: any,
  path: string
) {
  const matches = val.match(ebookIdMatcher);

  if (!matches || !matches.groups) {
    throw new TypeError(`Invalid "about" for Ebook ${val}`);
  }

  return parseInt(matches.groups.id, 10);
}
