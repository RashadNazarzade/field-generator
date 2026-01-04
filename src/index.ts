import type { Dict, ValidateDictSchema, GenerateFields } from './types/generate-fields.js';

import { convert } from './core/convert.js';

export const generateFields = <const Fields extends Dict>(
  fields: ValidateDictSchema<Fields>,
): GenerateFields<Fields> => convert(fields) as GenerateFields<Fields>;

export default generateFields;