import type { DICT, GenerateFields } from './type.js';

import { convert } from './core/convert.js';

export const generateFields = <const Fields extends DICT>(
  fields: Fields,
): GenerateFields<Fields> => convert(fields) as GenerateFields<Fields>;

export default generateFields;

const Fields = generateFields({
  endpoints: [
    {
      path12: 'path12',
      method: 'method',
      params: [{ name: 'name' }],
    },
  ],
});
