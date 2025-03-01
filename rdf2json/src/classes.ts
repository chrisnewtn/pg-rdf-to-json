import {
  type BookType,
  type RDFFile,
  type PGAgent,
  type PGFile,
  type RDFResource,
} from './types.js';
import {
  agents,
  decodeNode,
  descContents,
  instances,
  nodeContents,
  parseSubjects,
  toResources,
  unwrap
} from './util.js';

export class Book {
  id: string;
  title: string = '';
  alternativeTitles: string[] = [];
  description: string | null;
  authors: Array<Agent | Resource> = [];
  contributors: Array<Agent | Resource> = [];
  type: BookType;
  languages: string[];
  subjects: Set<string>;
  bookshelves: Set<string>;
  files: object[] = [];

  constructor({'rdf:RDF': {'pgterms:ebook': xmlBook}}: RDFFile) {
    this.id = xmlBook['@_rdf:about'];
    this.type = xmlBook['dcterms:type']['rdf:Description']['rdf:value']['#text'];
    this.description = xmlBook['pgterms:marc520']?.['#text'] || null;
    this.authors = Array.from(agents(xmlBook['dcterms:creator']));
    this.contributors = Array.from(agents(xmlBook['marcrel:edt']));
    this.subjects = new Set(parseSubjects(xmlBook['dcterms:subject']));
    this.bookshelves = new Set(parseSubjects(xmlBook['pgterms:bookshelf']));
    this.languages = Array.from(descContents(xmlBook['dcterms:language']));
    this.files = Array.from(instances(File, xmlBook['dcterms:hasFormat']));

    for (const title of unwrap(xmlBook['dcterms:title'])) {
      if (!this.title) {
        this.title = decodeNode(title);
      } else {
        this.alternativeTitles.push(decodeNode(title));
      }
    }

    for (const title of unwrap(xmlBook['dcterms:alternative'])) {
      this.alternativeTitles.push(decodeNode(title));
    }
  }
}

export class Agent {
  id: string;
  name: string;
  birthDate: number | null;
  deathDate: number | null;
  aliases: Set<string>;
  webpages: Set<string>;

  constructor(fields: {
    id: string,
    name: string,
    birthDate: number | null,
    deathDate: number | null,
    aliases: Set<string>,
    webpages: Set<string>,
  }) {
    this.id = fields.id;
    this.name = fields.name;
    this.birthDate = fields.birthDate;
    this.deathDate = fields.deathDate;
    this.aliases = fields.aliases || new Set();
    this.webpages = fields.webpages;
  }

  static from({'pgterms:agent': agent}: PGAgent) {
    return new Agent({
      id: agent['@_rdf:about'],
      name: agent['pgterms:name']['#text'],
      birthDate: agent['pgterms:birthdate']?.['#text'] || null,
      deathDate: agent['pgterms:deathdate']?.['#text'] || null,
      aliases: new Set(nodeContents(agent['pgterms:alias'])),
      webpages: new Set(toResources(agent['pgterms:webpage'])),
    });
  }
}

export class File {
  href: string;
  contentTypes: Set<string>;
  extents: Array<number>;
  modifiedDates: Set<Date>;

  constructor(fields: {
    href: string,
    contentTypes: Set<string>,
    extents: Array<number>,
    modifiedDates: Set<Date>,
  }) {
    this.href = fields.href;
    this.contentTypes = fields.contentTypes;
    this.extents = fields.extents;
    this.modifiedDates = fields.modifiedDates;
  }

  static from(f: PGFile) {
    const modifiedDates = new Set<Date>();

    for (const date of nodeContents(f['pgterms:file']['dcterms:modified'])) {
      modifiedDates.add(new Date(date));
    }

    return new File({
      href: f['pgterms:file']['@_rdf:about'],
      contentTypes: new Set(descContents(f['pgterms:file']['dcterms:format'])),
      extents: Array.from(nodeContents(f['pgterms:file']['dcterms:extent'])),
      modifiedDates,
    });
  }
}

export class Resource {
  resource: string;

  constructor(fields: {resource: string}) {
    this.resource = fields.resource;
  }

  static from(resource: RDFResource) {
    return new Resource({resource: resource['@_rdf:resource']});
  }
}
