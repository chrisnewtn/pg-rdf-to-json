export type BookType = 'Text' |
  'Sound' |
  'Collection' |
  'Image' |
  'StillImage' |
  'MovingImage' |
  'Dataset';

export type NoneOneOrMany<T> = T | T[] | undefined;

export interface Node<T = string> {
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
    'pgterms:name': Node;
    'pgterms:birthdate': Node<number> | undefined;
    'pgterms:deathdate': Node<number> | undefined;
    'pgterms:alias': Node | Node[];
    'pgterms:webpage': RDFResource | RDFResource[];
  }
}

export interface PGFile {
  'pgterms:file': {
    '@_rdf:about': string;
    'dcterms:isFormatOf': RDFResource;
    'dcterms:extent': NoneOneOrMany<Node<number>>;
    'dcterms:modified': NoneOneOrMany<Node>;
    'dcterms:format': NoneOneOrMany<RDFDescription<string>>;
  }
}

export interface RDFFile {
  '?xml': string;
  'rdf:RDF': {
    'pgterms:ebook': {
      '@_rdf:about': string;
      'dcterms:publisher': Node;
      'dcterms:issued': Node;
      'dcterms:title': Node;
      'dcterms:creator': NoneOneOrMany<PGAgent | RDFResource>;
      'marcrel:edt': NoneOneOrMany<PGAgent>;
      'dcterms:rights': Node;
      'pgterms:downloads': number;
      'pgterms:marc508': Node | number | undefined; // https://www.loc.gov/marc/bibliographic/bd508.html
      'pgterms:marc520': Node | undefined; // https://www.loc.gov/marc/bibliographic/bd520.html
      'dcterms:language': RDFDescription | RDFDescription[];
      'dcterms:type': RDFDescription<BookType>;
      'dcterms:subject': NoneOneOrMany<RDFDescription>;
      'pgterms:bookshelf': NoneOneOrMany<RDFDescription>;
      'dcterms:hasFormat': NoneOneOrMany<PGFile>;
    }
  }
}

export interface FromXML<TI, TO> {
  from (fields: TI): TO;
}
