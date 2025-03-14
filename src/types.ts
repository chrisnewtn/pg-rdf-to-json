import { type JTDSchemaType } from 'ajv/dist/jtd.js';

export type Formatter = (
  key: string,
  val: any,
  path: string,
  original: UnformattedRDFFile
) => any;

export type BookType =
  'Collection' |
  'Dataset' |
  'Event' |
  'Image' |
  'InteractiveResource' |
  'MovingImage' |
  'PhysicalObject' |
  'Service' |
  'Software' |
  'Sound' |
  'StillImage' |
  'Text';

export type NoneOneOrMany<T> = T | T[] | undefined;

export interface Node<T = string> {
  '#text': T
}

export interface RDFDescription<T = string> {
  'description': {
    'value': Node<T>;
  }
}

export interface RDFResource {
  'resource': string;
}

export interface PGAgent {
  'agent': {
    'about': string;
    'name': Node;
    'birthdate': Node<number> | undefined;
    'deathdate': Node<number> | undefined;
    'alias': Node | Node[];
    'webpage': RDFResource | RDFResource[];
  }
}

export interface PGFile {
  'file': {
    'about': string;
    'isFormatOf': RDFResource;
    'extent': NoneOneOrMany<Node<number>>;
    'modified': NoneOneOrMany<Node>;
    'format': NoneOneOrMany<RDFDescription<string>>;
  }
}

export interface UnformattedRDFFile {
  'rdf': {
    'ebook': {
      'about': string;
      'publisher': Node;
      'issued': Node;
      'title': NoneOneOrMany<Node<string | number>>;
      'alternative': NoneOneOrMany<Node<string | number>>;
      'creator': NoneOneOrMany<PGAgent | RDFResource>;
      'editor': NoneOneOrMany<PGAgent | RDFResource>;
      'rights': Node;
      'downloads': number;
      'marc508': Node | number | undefined; // https://www.loc.gov/marc/bibliographic/bd508.html
      'marc520': Node | undefined; // https://www.loc.gov/marc/bibliographic/bd520.html
      'language': RDFDescription | RDFDescription[];
      'type': RDFDescription<BookType>;
      'subject': NoneOneOrMany<RDFDescription>;
      'bookshelf': NoneOneOrMany<RDFDescription>;
      'files': NoneOneOrMany<PGFile>;
    }
  }
}

export interface Agent {
  about: string;
  name: string;
  codes: string[];
  birthdate?: number;
  deathdate?: number;
  alias?: string[];
  webpage?: string[];
}

export interface FormattedResource {
  resource: string;
}

export interface TaggedResource extends FormattedResource {
  kind: 'resource';
  code?: string;
}

export interface File {
  about: string;
  isFormatOf: FormattedResource,
  extent: number[];
  format: string[];
  modified: Date[];
}

export interface FormattedEbook {
  about: string;
  title: string;
  alternative?: string[];
  description?: string[];
  publisher: string;
  license: string;
  issued: string;
  rights: string;
  downloads: number;

  /** @see {@link https://www.loc.gov/marc/bibliographic/bdsummary.html} */
  marc: Record<string, any>;

  tableOfContents?: string;
  language: string[];
  subject: string[];
  bookshelf: string[];
  type: string;

  /**
   * Relator terms and their associated codes designate the relationship
   * between an agent and a bibliographic resource.
   *
   * https://id.loc.gov/vocabulary/relators.html
   */
  relators: Agent[],

  files: File[]
}

export interface FormattedRDFFile {
  'rdf': {
    'ebook': FormattedEbook
  }
}

export const formattedEbookSchema: JTDSchemaType<FormattedEbook, {
  file: File,
  agent: Agent,
}> = {
  definitions: {
    file: {
      properties: {
        about: { type: 'string' },
        isFormatOf: {
          properties: {
            resource: { type: 'string' }
          }
        },
        extent: {
          elements: { type: 'float64' }
        },
        format: {
          elements: { type: 'string' }
        },
        modified: {
          elements: { type: 'timestamp' }
        }
      }
    },
    agent: {
      properties: {
        about: { type: 'string' },
        name: { type: 'string' },
        codes: {
          elements: {
            type: 'string'
          }
        },
      },
      optionalProperties: {
        alias: {
          elements: { type: 'string' }
        },
        birthdate: { type: 'float64' },
        deathdate: { type: 'float64' },
        webpage: {
          elements: { type: 'string' }
        },
      }
    },
  },
  properties: {
    about: { type: 'string' },
    title: { type: 'string' },
    publisher: { type: 'string' },
    license: { type: 'string' },
    issued: { type: 'string' },
    rights: { type: 'string' },
    downloads: { type: 'float64' },
    relators: {
      elements: {
        ref: 'agent'
      }
    },
    marc: {
      values: {}
    },
    language: {
      elements: { type: 'string' }
    },
    subject: {
      elements: { type: 'string' }
    },
    bookshelf: {
      elements: { type: 'string' }
    },
    type: { type: 'string' },
    files: {
      elements: {
        ref: 'file'
      }
    }
  },
  optionalProperties: {
    alternative: {
      elements: { type: 'string' }
    },
    description: {
      elements: { type: 'string' }
    },
    tableOfContents: { type: 'string' },
  }
};

export const formattedRDFFileSchema: JTDSchemaType<FormattedRDFFile, {
  file: File,
  agent: Agent
}> = {
  properties: {
    rdf: {
      properties: {
        ebook: formattedEbookSchema
      }
    }
  }
};
