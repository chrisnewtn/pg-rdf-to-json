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
    formattedRelator.codes = [key];
  } else if (key.endsWith('creator')) {
    formattedRelator.codes = ['cre'];
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

  newObject.rdf.ebook.relators = [];

  if (Array.isArray(relators)) {
    for (const relator of relators) {
      if (Array.isArray(relator.codes)) {
        const toDelete = relator.codes
          .map((c: string) => c === 'cre' ? 'creator' : c);

        if (Object.hasOwn(relator, 'resource')) {
          const original: any = relators.find((r: any) => {
            return r.about === relator.resource;
          });
          if (original) {
            original.codes.push(...relator.codes);
          }
        } else {
          newObject.rdf.ebook.relators.push(relator);
        }

        for (const code of toDelete) {
          delete newObject.rdf.ebook[code];
        }
      }
    }
    sharedRelators.delete(original);
  }
}
