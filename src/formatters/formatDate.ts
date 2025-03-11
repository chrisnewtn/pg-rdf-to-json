export default function formatDate(
  key: string,
  val: any,
  path: string
) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#date') {
    throw new TypeError(`Expected date datatype at ${path}.datatype`);
  }
  return val?.['#text'];
}
