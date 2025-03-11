export default function formatLanguage(
  key: string,
  val: any,
  path: string
) {
  const value = val?.description?.value;

  if (value?.datatype !== 'http://purl.org/dc/terms/RFC4646') {
    throw new TypeError(`Expected RFC4646 datatype at ${path}.description.value.datatype`);
  }

  return value?.['#text'];
}
