// https://id.loc.gov/vocabulary/relators.json
import inputRelators from './relators.json' with { type: 'json' };

export const relators: Map<string, string> = new Map();

const labelKey = 'http://www.loc.gov/mads/rdf/v1#authoritativeLabel';

for (const relator of inputRelators) {
  let url;

  try {
    url = new URL(relator['@id']);
  } catch (err) {
    continue;
  }

  const matches = url.pathname.match(/\/(?<code>\w{3})$/);

  if (!matches || !matches.groups) {
    continue;
  }

  const label = relator[labelKey]?.[0]['@value'];

  if (!label) {
    continue;
  }

  relators.set(
    matches.groups.code,
    label
  );
}

// Manually add this as it's present in the data, but not the schema.
relators.set(
  'unk',
  'unknown'
);
relators.set(
  'clb',
  'collaborator'
);
