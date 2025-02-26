import {
  type RDFDescription,
  type RDFResource,
  type Node,
  type Constructor,
  type NoneOneOrMany,
} from './types.ts';

function descVal(description: RDFDescription) {
  return description['rdf:Description']['rdf:value']['#text'];
}

export function* parseSubjects(subjects: RDFDescription | RDFDescription[] | undefined) {
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

export function* toResources(resources: RDFResource | RDFResource[] | undefined) {
  if (Array.isArray(resources)) {
    for (const resource of resources) {
      yield resource['@_rdf:resource'];
    }
  } else if (resources !== undefined) {
    yield resources['@_rdf:resource'];
  }
}

export function* descContents<T>(files: RDFDescription<T> | RDFDescription<T>[] | undefined) {
  if (Array.isArray(files)) {
    for (const file of files) {
      yield file['rdf:Description']['rdf:value']['#text'];
    }
    return;
  } else if (files !== undefined) {
    yield files['rdf:Description']['rdf:value']['#text'];
  }
}

export function* nodeContents<T>(strings: Node<T> | Node<T>[] | undefined) {
  if (Array.isArray(strings)) {
    for (const string of strings) {
      yield string['#text'];
    }
  } else if (strings && Object.hasOwn(strings, '#text')) {
    yield strings['#text'];
  }
}

export function* instances<TI, TO>(F: Constructor<TI, TO>, agents: NoneOneOrMany<TI>) {
  if (Array.isArray(agents)) {
    for (const agent of agents) {
      yield new F(agent);
    }
  } else if (agents !== undefined) {
    yield new F(agents);
  }
}
