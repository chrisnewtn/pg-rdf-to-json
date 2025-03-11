export default function formatDescription(
  key: string,
  val: any,
  path: string
) {
  const value = val?.description?.value?.['#text'];

  if (!value) {
    throw new TypeError(`Expected #text at ${path}.description.value.#text`);
  }

  return value;
}
