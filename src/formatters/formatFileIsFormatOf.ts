import { assertRDFResource } from "../predicates.js";
import formatEbookId from "./formatEbookId.js";

export default function formatFileIsFormatOf(
  key: string,
  val: any,
  path: string
) {
  assertRDFResource(val);

  const { '#text': _, resource } = val;

  return {
    resource: formatEbookId(null, resource)
  };
}
