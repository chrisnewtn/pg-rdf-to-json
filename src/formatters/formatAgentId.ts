const agentIdMatcher = /^2009\/agents\/(?<id>\d+)$/;

export default function formatAgentId(
  key: string,
  val: any,
  path: string
) {
  const matches = val.match(agentIdMatcher);

  if (!matches || !matches.groups) {
    throw new TypeError(`Invalid "about" for Agent ${val}`);
  }

  return parseInt(matches.groups.id, 10);
}
