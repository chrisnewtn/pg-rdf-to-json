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
  code?: string;
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
  description?: string[];
  publisher: string;
  license: string;
  issued: string;
  rights: string;
  downloads: number;

  /** https://www.loc.gov/marc/authority/ad010.html */
  marc010?: number;

  /** @see {@link https://www.loc.gov/marc/bibliographic/bd250.html} */
  marc250?: string;

  marc260?: string;
  marc300?: string;

  /**
   * Series Statement/Added Entry-Title [OBSOLETE, 2008]
   * @see {@link https://www.loc.gov/marc/bibliographic/bd4xx.html}
   */
  marc440?: string;

  /**
   * 508 - Creation/Production Credits Note (R)
   *
   * Credits for persons or organizations, other than members of the cast, who
   * have participated in the creation and/or production of the work. The
   * introductory term Credits: is usually generated as a display constant.
   *
   * Field 508 is repeatable to record complex or multiple credit notes.
   */
  marc508?: string[];

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

  /**
   * 546 - Language Note (R)
   *
   * Textual information on the language or notation system used to convey the
   * content of the described materials. A description of the alphabet, script,
   * or other symbol system (e.g., arabic alphabet, ASCII, bar code,
   * logarithmic graphing) may also be included, but for musical notation system
   * terms, prefer field 348 (Notated Music Characteristics). Coded language
   * information is contained in fields 008/35-37 (Language) and/or
   * 041 (Language code).
   *
   * @see {@link https://www.loc.gov/marc/bibliographic/bd546.html}
   */
  marc546?: string;

  marc901?: string[];

  /**
   * Appears to be used to store the title.
   */
  marc905?: string;

  tableOfContents?: string;
  language: string[];
  subject: string[];
  bookshelf: string[];
  type: string;

  creator?: (TaggedAgent | TaggedResource)[],

  /**
   * Relator terms and their associated codes designate the relationship
   * between an agent and a bibliographic resource.
   *
   * https://id.loc.gov/vocabulary/relators.html
   */
  relators?: (TaggedAgent | TaggedResource)[],

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
            code: { type: 'string' },
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
    creator: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    description: {
      elements: { type: 'string' }
    },
    relators: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    marc010: { type: 'float64' },
    marc250: { type: 'string' },
    marc260: { type: 'string' },
    marc300: { type: 'string' },
    marc440: { type: 'string' },
    marc508: {
      elements: { type: 'string' },
    },
    marc520: { type: 'string' },
    marc546: { type: 'string' },
    marc901: {
      elements: { type: 'string' },
    },
    marc905: { type: 'string' },
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
