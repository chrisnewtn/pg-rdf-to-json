export default function formatStandaloneText(
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
  return val?.['#text'];
}
