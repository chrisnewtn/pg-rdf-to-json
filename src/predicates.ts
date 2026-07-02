import type { Node, RDFResource } from "./types.js";

export function isNode(val: any): val is Node {
  return typeof val === 'object'
    && Object.hasOwn(val, '#text')
    && typeof val['#text'] === 'string';
}

export function isRDFResource(val: any): val is RDFResource {
  return isNode(val)
    && 'resource' in val
    && typeof val.resource === 'string';
}

export function assertRDFResource(val: any): asserts val is RDFResource {
  if (!isRDFResource(val)) {
    throw new TypeError(`Not an RDFResource: ${JSON.stringify(val)}`);
  }
}
