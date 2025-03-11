import { generateSchemaValidationSuite, getFixtureId } from './shared.js';

generateSchemaValidationSuite(getFixtureId(import.meta.filename));