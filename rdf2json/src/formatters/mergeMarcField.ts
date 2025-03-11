import { type UnformattedRDFFile } from '../types.js';

const sharedMarc: WeakMap<UnformattedRDFFile, Record<string, any>> = new WeakMap();

const marcMatcher = /^marc(?<id>\d{3})$/;

export default function mergeMarcField(
  key: string,
  value: any,
  path: string,
  original: UnformattedRDFFile
) {
  const matches = marcMatcher.exec(key);

  if (!matches || !matches.groups) {
    throw new Error(`Expected field to start with "marc". Got "${key}"`);
  }

  const marcFields = sharedMarc.get(original);

  if (!marcFields) {
    sharedMarc.set(original, { [matches.groups.id]: value });
  } else {
    marcFields[matches.groups.id] = value;
  }

  return value;
}

export function postProcessMarcFields(
  newObject: any,
  original: UnformattedRDFFile
) {
  const marcFields = sharedMarc.get(original);

  if (marcFields) {
    newObject.rdf.ebook.marc = marcFields;

    for (const key of Object.keys(marcFields)) {
      delete newObject.rdf.ebook[`marc${key}`];
    }

    sharedMarc.delete(original);
  } else {
    newObject.rdf.ebook.marc = {};
  }
}
