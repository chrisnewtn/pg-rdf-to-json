import { decode } from 'html-entities';
import { Agent, Resource } from './classes.js';
import {
  type RDFDescription,
  type RDFResource,
  type Node,
  type FromXML,
  type NoneOneOrMany,
  type PGAgent,
} from './types.js';

function descVal<T>(description: RDFDescription<T>) {
  return description['rdf:Description']['rdf:value']['#text'];
}

export function decodeNode({ '#text': text }: Node<string | number>) {
  return decode(text.toString()).trim();
}

export function* unwrap<T>(noneOneOrMany: NoneOneOrMany<T>) {
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

export function* instances<TI, TO>(F: FromXML<TI, TO>, values: NoneOneOrMany<TI>) {
  for (const value of unwrap(values)) {
    yield F.from(value);
  }
}

function isRdfResource(object: any): object is RDFResource {
  return typeof object === 'object' && Object.hasOwn(object, '@_rdf:resource');
}

function isPgAgent(object: any): object is PGAgent {
  return typeof object === 'object' && Object.hasOwn(object, 'pgterms:agent');
}

export function* agents(agents: NoneOneOrMany<PGAgent | RDFResource>) {
  for (const agent of unwrap(agents)) {
    if (isRdfResource(agent)) {
      yield Resource.from(agent);
    } else if (isPgAgent(agent)) {
      yield Agent.from(agent);
    } else {
      throw new TypeError('Expected PGAgent | RDFResource');
    }
  }
}
