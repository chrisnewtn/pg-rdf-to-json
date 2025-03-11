import { relators } from '../input-schemas/relators.js';
import { type UnformattedRDFFile } from '../types.js';
import formatObject from './formatObject.js';
import formatValue from './formatValue.js';

const sharedRelators: WeakMap<UnformattedRDFFile, any[]> = new WeakMap();

export default function formatAgent(
  key: string,
  value: any,
  path: string,
  original: UnformattedRDFFile
) {
  if (typeof value !== 'object') {
    throw new TypeError(`Expected object at ${path}`);
  }

  const keys = Object.keys(value);
  let formattedRelator;

  if (keys[0] === 'agent') {
    formattedRelator = formatValue(
      keys[0],
      value[keys[0]],
      `${path}.${keys[0]}`,
      original
    );
  } else if (keys.includes('resource')) {
    formattedRelator = formatObject(key, value, path, original);
  } else {
    return formatObject(key, value, path, original);
  }

  if (relators.has(key)) {
    formattedRelator.code = key;
  }

  if (sharedRelators.has(original)) {
    sharedRelators.get(original)?.push(formattedRelator);
  } else {
    sharedRelators.set(original, [formattedRelator]);
  }

  return formattedRelator;
}

export function postProcessRelators(
  newObject: any,
  original: UnformattedRDFFile
) {
  const relators = sharedRelators.get(original);

  if (Array.isArray(relators)) {
    newObject.rdf.ebook.relators = [];

    for (const relator of relators) {
      if (relator.code) {
        newObject.rdf.ebook.relators.push(relator);
        delete newObject.rdf.ebook[relator.code];
      }
    }

    sharedRelators.delete(original);
  }
}
