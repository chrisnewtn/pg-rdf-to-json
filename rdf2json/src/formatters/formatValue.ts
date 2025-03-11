import { type UnformattedRDFFile } from '../types.js';
import formatObject from './formatObject.js';
import { formatters } from './formatters.js';

export default function formatValue(
  key: string,
  value: any,
  path: string,
  original: UnformattedRDFFile
): any {
  if (Array.isArray(value)) {
    return value.map(val => formatValue(key, val, path, original))
  }

  const formatter = formatters.get(path);

  if (formatter) {
    if (!Array.isArray(formatter)) {
      return formatter(key, value, path, original);
    }
    return formatter.reduce((memo, f) => f(key, memo, path, original), value);
  }

  if (typeof value === 'object') {
    return formatObject(key, value, path, original);
  }

  return value;
}
