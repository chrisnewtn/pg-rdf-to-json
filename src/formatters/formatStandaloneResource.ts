import { isRDFResource } from "../predicates.js";

export default function formatStandaloneResource(
  key: string,
  val: any,
  path: string
) {
  if (!isRDFResource(val)) {
    throw new TypeError(`Expected RDFResource at ${path}.resource. got ${JSON.stringify(val)}`);
  }
  return val.resource;
}
