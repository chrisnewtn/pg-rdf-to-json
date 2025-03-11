import { type UnformattedRDFFile } from '../types.js';

function formatNumber(
  key: string,
  val: any,
  path: string,
  original: UnformattedRDFFile
) {
  const parsed = parseInt(val?.['#text'], 10);

  if (Number.isNaN(parsed)) {
    new TypeError(`Expected number at ${path}. Got ${val?.['#text']}`);
  }

  return parsed;
}

export default function formatInteger(
  key: string,
  val: any,
  path: string,
  original: UnformattedRDFFile
) {
  if (val?.datatype !== 'http://www.w3.org/2001/XMLSchema#integer') {
    throw new TypeError(`Expected integer datatype at ${path}.datatype`);
  }
  return formatNumber(key, val, path, original);
}
