const ebookIdMatcher = /^ebooks\/(?<id>\d+)$/;

export default function formatEbookId(
  _: unknown,
  val: any,
) {
  const matches = ebookIdMatcher.exec(val);

  if (!matches || !matches.groups) {
    throw new TypeError(`Invalid "about" for Ebook ${val}`);
  }

  return parseInt(matches.groups.id, 10);
}
