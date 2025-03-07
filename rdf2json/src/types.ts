import { type JTDSchemaType } from 'ajv/dist/jtd.js';

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

export interface TaggedAgent {
  about: string;
  kind: 'agent';
  name: string;
  birthdate?: number;
  deathdate?: number;
  alias?: string[];
  webpage?: string[];
}

export interface FormattedResource {
  resource: string;
}

export interface TaggedResource extends FormattedResource {
  kind: 'resource'
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
  description: string[];
  publisher: string;
  license: string;
  issued: string;
  rights: string;
  downloads: number;

  /** https://www.loc.gov/marc/authority/ad010.html */
  marc010?: number;

  marc260?: string;
  marc300?: string;

  /**
   * Series Statement/Added Entry-Title [OBSOLETE, 2008]
   * @see {@link https://www.loc.gov/marc/bibliographic/bd4xx.html}
   */
  marc440?: string;

  marc508?: string;

  /**
   * Unformatted information that describes the scope and general contents of
   * the materials.
   *
   * This could be a summary, abstract, annotation, review, or only a phrase
   * describing the material.
   *
   * @see {@link https://www.loc.gov/marc/bibliographic/bd520.html}
   */
  marc520?: string;

  marc901?: string;
  tableOfContents?: string;
  language: string[];
  subject: string[];
  bookshelf: string[];
  type: string;

  /**
   * Author of introduction, etc.
   *
   * A person or organization responsible for an introduction, preface,
   * foreword, or other critical introductory matter, but who is not the chief
   * author.
   *
   * https://id.loc.gov/vocabulary/relators/aui.html
   */
  aui?: (TaggedAgent | TaggedResource)[],

  /** https://id.loc.gov/vocabulary/relators/ctb.html */
  contributor?: (TaggedAgent | TaggedResource)[],

  creator?: (TaggedAgent | TaggedResource)[],
  editor?: (TaggedAgent | TaggedResource)[],

  /** https://id.loc.gov/vocabulary/relators/ill.html */
  illustrator?: (TaggedAgent | TaggedResource)[],

  translator?: (TaggedAgent | TaggedResource)[],
  files: File[]
}

export interface FormattedRDFFile {
  'rdf': {
    'ebook': FormattedEbook
  }
}

export const formattedEbookSchema: JTDSchemaType<FormattedEbook, {
  file: File,
  agentOrResource: TaggedAgent | TaggedResource
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
    agentOrResource: {
      discriminator: 'kind',
      mapping: {
        agent: {
          properties: {
            about: { type: 'string' },
            name: { type: 'string' },
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
        resource: {
          properties: {
            resource: { type: 'string' }
          }
        }
      }
    }
  },
  properties: {
    about: { type: 'string' },
    title: { type: 'string' },
    description: {
      elements: { type: 'string' }
    },
    publisher: { type: 'string' },
    license: { type: 'string' },
    issued: { type: 'string' },
    rights: { type: 'string' },
    downloads: { type: 'float64' },
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
    aui: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    contributor: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    creator: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    editor: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    illustrator: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    translator: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    marc010: { type: 'float64' },
    marc260: { type: 'string' },
    marc300: { type: 'string' },
    marc440: { type: 'string' },
    marc508: { type: 'string' },
    marc520: { type: 'string' },
    marc901: { type: 'string' },
    tableOfContents: { type: 'string' },
  }
};

export const formattedRDFFileSchema: JTDSchemaType<FormattedRDFFile, {
  file: File,
  agentOrResource: TaggedAgent | TaggedResource
}> = {
  properties: {
    rdf: {
      properties: {
        ebook: formattedEbookSchema
      }
    }
  }
};
