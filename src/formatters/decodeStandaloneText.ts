import { decode } from 'html-entities';

export default function decodeStandaloneText(
  key: string,
  val: any,
  path: string
) {
  if (typeof val !== 'object' ||
    Object.keys(val).length !== 1 ||
    typeof val?.['#text'] !== 'string'
  ) {
    throw new TypeError(`Expected single string value #text at ${path}`);
  }
  return decode(val?.['#text']);
}
