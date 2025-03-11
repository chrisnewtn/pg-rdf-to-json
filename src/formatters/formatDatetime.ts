export default function formatDatetime(
  key: string,
  val: any,
  path: string
) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#dateTime') {
    throw new TypeError(`Expected dateTime datatype at ${path}.datatype`);
  }
  return new Date(val?.['#text']);
}
