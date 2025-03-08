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
  description?: string[];
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

  /**
   * Author of afterword, colophon, etc.
   *
   * A person or organization responsible for an afterword, postface, colophon,
   * etc. but who is not the chief author of a work.
   *
   * https://id.loc.gov/vocabulary/relators/aui.html
   */
  aft?: (TaggedAgent | TaggedResource)[],

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

  /**
   * A person contributing to a resource by performing music, acting, dancing,
   * speaking, etc., often in a musical or dramatic presentation, etc.
   *
   * If specific codes are used, [prf] is used for a person whose principal
   * skill is not known or specified.
   *
   * @see {@link https://id.loc.gov/vocabulary/relators/prf.html}
   */
  performer?: (TaggedAgent | TaggedResource)[],

  /**
   * A person, family, or organization responsible for creating or contributing
   * to a musical resource by adding music to a work that originally lacked it
   * or supplements it.
   *
   * @see {@link https://id.loc.gov/vocabulary/relators/cmp.html}
   */
  composer?: (TaggedAgent | TaggedResource)[],

  /**
   * An author of a libretto of an opera or other stage work, or an oratorio.
   *
   * @see {@link https://id.loc.gov/vocabulary/relators/lbt.html}
   */
  librettist?: (TaggedAgent | TaggedResource)[],

  /**
   * A person, family, or organization contributing to a musical work by
   * rewriting the composition for a medium of performance different from that
   * for which the work was originally intended, or modifying the work for the
   * same medium of performance, etc., such that the musical substance of the
   * original composition remains essentially unchanged. For extensive
   * modification that effectively results in the creation of a new musical
   * work, see composer.
   *
   * @see {@link https://id.loc.gov/vocabulary/relators/arr.html}
   */
  arranger?: (TaggedAgent | TaggedResource)[],

  /**
   * A person, family, or organization responsible for creating a new work
   * (e.g., a bibliography, a directory) through the act of compilation, e.g.,
   * selecting, arranging, aggregating, and editing data, information, etc.
   *
   * @see {@link https://id.loc.gov/vocabulary/relators/com.html}
   */
  compiler?: (TaggedAgent | TaggedResource)[],

  /**
   * A performer contributing to a musical resource by leading a performing
   * group (orchestra, chorus, opera, etc.) in a musical or dramatic
   * presentation.
   *
   * @see {@link https://id.loc.gov/vocabulary/relators/cnd.html}
   */
  conductor?: (TaggedAgent | TaggedResource)[],

  /**
   * A role that has no equivalent in the MARC list.
   *
   * @see {@link https://id.loc.gov/vocabulary/relators/oth.html}
   */
  other?: (TaggedAgent | TaggedResource)[],

  translator?: (TaggedAgent | TaggedResource)[],

  /**
   * This appears to be short for "Unknown".
   */
  unk?: (TaggedAgent | TaggedResource)[],

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
    arranger: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    aft: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    aui: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    compiler: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    composer: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    conductor: {
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
    description: {
      elements: { type: 'string' }
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
    librettist: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    other: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    performer: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    translator: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    unk: {
      elements: {
        ref: 'agentOrResource'
      }
    },
    marc010: { type: 'float64' },
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
