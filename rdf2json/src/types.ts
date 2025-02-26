export type BookType = 'Text' |
  'Sound' |
  'Collection' |
  'Image' |
  'StillImage' |
  'MovingImage' |
  'Dataset';

export type FileFormat = RDFDescription<string>;

export type NoneOneOrMany<T> = T | T[] | undefined;

export interface Node<T> {
  '#text': T
}

export interface RDFDescription<T = string> {
  'rdf:Description': {
    'rdf:value': Node<T>;
  }
}

export interface RDFResource {
  '@_rdf:resource': string;
}

export interface PGAgent {
  'pgterms:agent': {
    '@_rdf:about': string;
    'pgterms:name': Node<string>;
    'pgterms:birthdate': Node<number> | undefined;
    'pgterms:deathdate': Node<number> | undefined;
    'pgterms:alias': Node<string> | Node<string>[];
    'pgterms:webpage': RDFResource | RDFResource[];
  }
}

export interface PGFile {
  'pgterms:file': {
    '@_rdf:about': string;
    'dcterms:isFormatOf': RDFResource;
    'dcterms:extent': Node<number> | Node<number>[] | undefined;
    'dcterms:modified': Node<string> | Node<string>[] | undefined;
    'dcterms:format': FileFormat | FileFormat[] | undefined;
  }
}

export interface RDFFile {
  '?xml': string;
  'rdf:RDF': {
    'pgterms:ebook': {
      '@_rdf:about': string;
      'dcterms:publisher': Node<string>;
      'dcterms:issued': Node<string>;
      'dcterms:title': Node<string>;
      'dcterms:creator': PGAgent | PGAgent[] | undefined;
      'marcrel:edt': PGAgent | PGAgent[] | undefined;
      'dcterms:rights': Node<string>;
      'pgterms:downloads': number;
      'pgterms:marc508': Node<string> | number | undefined; // https://www.loc.gov/marc/bibliographic/bd508.html
      'pgterms:marc520': Node<string> | undefined; // https://www.loc.gov/marc/bibliographic/bd520.html
      'dcterms:language': RDFDescription | RDFDescription[];
      'dcterms:type': RDFDescription<BookType>;
      'dcterms:subject': RDFDescription | RDFDescription[] | undefined;
      'pgterms:bookshelf': RDFDescription | RDFDescription[] | undefined;
      'dcterms:hasFormat': PGFile | PGFile[] | undefined;
    }
  }
}

export interface Constructor<TI, TO> {
  new (args: TI): TO;
}
