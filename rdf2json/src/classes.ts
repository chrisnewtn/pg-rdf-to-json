import { decode } from 'html-entities';
import {
  type BookType,
  type RDFFile,
  type PGAgent,
  type PGFile,
} from './types.ts';
import {
  descContents,
  instances,
  nodeContents,
  parseSubjects,
  toResources
} from './util.ts';

export class Book {
  id: string;
  title: string;
  description: string | null;
  authors: Agent[] = [];
  contributors: Agent[] = [];
  type: BookType;
  languages: string[] = [];
  subjects: Set<string>;
  bookshelves: Set<string>;
  files: object[] = [];

  constructor({'rdf:RDF': {'pgterms:ebook': xmlBook}}: RDFFile) {
    this.id = xmlBook['@_rdf:about'];
    this.title = decode(xmlBook['dcterms:title']['#text']).trim();
    this.type = xmlBook['dcterms:type']['rdf:Description']['rdf:value']['#text'];
    this.description = xmlBook['pgterms:marc520']?.['#text'] || null;
    this.authors = Array.from(instances(Agent, xmlBook['dcterms:creator']));
    this.contributors = Array.from(instances(Agent, xmlBook['marcrel:edt']));
    this.subjects = new Set(parseSubjects(xmlBook['dcterms:subject']));
    this.bookshelves = new Set(parseSubjects(xmlBook['pgterms:bookshelf']))

    for (const language of descContents(xmlBook['dcterms:language'])) {
      this.languages.push(language);
    }

    this.files = Array.from(instances(File, xmlBook['dcterms:hasFormat']));
  }
}

class Agent {
  id: string;
  name: string;
  birthDate: number | null;
  deathDate: number | null;
  aliases: Set<string>;
  webpages: Set<string>;

  constructor({'pgterms:agent': agent}: PGAgent) {
    this.id = agent['@_rdf:about'];
    this.name = agent['pgterms:name']['#text'];
    this.birthDate = agent['pgterms:birthdate']?.['#text'] || null;
    this.deathDate = agent['pgterms:deathdate']?.['#text'] || null;
    this.aliases = new Set(nodeContents(agent['pgterms:alias']));
    this.webpages = new Set(toResources(agent['pgterms:webpage']));
  }
}

class File {
  href: string;
  contentTypes: Set<string>;
  extents: Array<number>;
  modifiedDates: Set<string>;

  constructor(f: PGFile) {
    this.href = f['pgterms:file']['@_rdf:about'];
    this.contentTypes = new Set(descContents(f['pgterms:file']['dcterms:format']));
    this.extents = Array.from(nodeContents(f['pgterms:file']['dcterms:extent']));
    this.modifiedDates = new Set(nodeContents(f['pgterms:file']['dcterms:modified']));
  }
}
