import { type UnformattedRDFFile } from '../types.js';
import formatValue from './formatValue.js';

export default function hoistStandaloneObjectValue(
  key: string,
  value: any,
  path: string,
  original: UnformattedRDFFile
) {
  if (typeof value !== 'object') {
    throw new TypeError(`Expected object at ${path}`);
  }

  if (Object.keys(value).length !== 1) {
    throw new TypeError(`Expected single key at ${path}`);
  }

  const [onlyKey] = Object.keys(value);

  return formatValue(onlyKey, value[onlyKey], `${path}.${onlyKey}`, original);
}
