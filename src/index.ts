import type { DICT, GenerateFields, ValidateDICT } from './type.js';

import { convert } from './core/convert.js';

export const generateFields = <const Fields extends DICT>(
  fields: ValidateDICT<Fields>,
): GenerateFields<Fields> => convert(fields) as GenerateFields<Fields>;

export default generateFields;
