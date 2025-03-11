import { type UnformattedRDFFile } from '../types.js';
import formatValue from './formatValue.js';

export default function formatObject(
  key: string,
  value: object,
  path: string,
  original: UnformattedRDFFile
) {
  const rtn: { [key: string]: any } = {};

  for (const [skey, val] of Object.entries(value)) {
    rtn[skey] = formatValue(skey, val, `${path}.${skey}`, original);
  }

  return rtn;
}
