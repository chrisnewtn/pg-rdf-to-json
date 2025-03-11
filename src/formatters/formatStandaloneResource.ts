export default function formatStandaloneResource(
  key: string,
  val: any,
  path: string
) {
  if (typeof val !== 'object' ||
    Object.keys(val).length !== 1 ||
    typeof val?.resource !== 'string'
  ) {
    throw new TypeError(`Expected single string value at ${path}.resource`);
  }
  return val?.resource;
}
