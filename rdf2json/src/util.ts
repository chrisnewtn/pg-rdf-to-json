import {
  type RDFDescription,
  type RDFResource,
  type Node,
  type FromXML,
  type NoneOneOrMany,
} from './types.ts';

function descVal<T>(description: RDFDescription<T>) {
  return description['rdf:Description']['rdf:value']['#text'];
}

function* unwrap<T>(noneOneOrMany: NoneOneOrMany<T>) {
  if (Array.isArray(noneOneOrMany)) {
    for (const one of noneOneOrMany) {
      yield one;
    }
  } else if (noneOneOrMany !== undefined) {
    yield noneOneOrMany;
  }
}

export function* parseSubjects(subjects: NoneOneOrMany<RDFDescription>) {
  if (subjects === undefined) {
    return;
  }
  if (Array.isArray(subjects)) {
    for (const subject of subjects) {
      if (typeof descVal(subject) !== 'string') {
        continue;
      }
      for (const subsubjects of descVal(subject).split(' -- ')) {
        yield subsubjects;
      }
    }
  } else if (typeof descVal(subjects) === 'string') {
    for (const subsubjects of descVal(subjects).split(' -- ')) {
      yield subsubjects;
    }
  }
}

export function* toResources(resources: NoneOneOrMany<RDFResource>) {
  for (const resource of unwrap(resources)) {
    yield resource['@_rdf:resource'];
  }
}

export function* descContents<T>(files: NoneOneOrMany<RDFDescription<T>>) {
  for (const file of unwrap(files)) {
    yield descVal(file);
  }
}

export function* nodeContents<T>(strings: NoneOneOrMany<Node<T>>) {
  for (const string of unwrap(strings)) {
    yield string['#text'];
  }
}

export function* instances<TI, TO>(F: FromXML<TI, TO>, agents: NoneOneOrMany<TI>) {
  for (const agent of unwrap(agents)) {
    yield F.from(agent);
  }
}
