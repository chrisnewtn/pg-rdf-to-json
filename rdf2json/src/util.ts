export function extractProp(value: any, path: string) {
  let rtn = value;

  for (const subValue of path.substring(1).split('/')) {
    rtn = rtn[subValue];
  }

  return rtn;
}
