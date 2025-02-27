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
  if (Array.isArray(resources)) {
    for (const resource of resources) {
      yield resource['@_rdf:resource'];
    }
  } else if (resources !== undefined) {
    yield resources['@_rdf:resource'];
  }
}

export function* descContents<T>(files: NoneOneOrMany<RDFDescription<T>>) {
  if (Array.isArray(files)) {
    for (const file of files) {
      yield descVal(file);
    }
    return;
  } else if (files !== undefined) {
    yield descVal(files);
  }
}

export function* nodeContents<T>(strings: NoneOneOrMany<Node<T>>) {
  if (Array.isArray(strings)) {
    for (const string of strings) {
      yield string['#text'];
    }
  } else if (strings && Object.hasOwn(strings, '#text')) {
    yield strings['#text'];
  }
}

export function* instances<TI, TO>(F: FromXML<TI, TO>, agents: NoneOneOrMany<TI>) {
  if (Array.isArray(agents)) {
    for (const agent of agents) {
      yield F.from(agent);
    }
  } else if (agents !== undefined) {
    yield F.from(agents);
  }
}
