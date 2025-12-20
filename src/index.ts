import type { DICT, GenerateFields } from './type.js';

import { convert } from './core/convert.js';

export const generateFields = <const Fields extends DICT>(
  fields: Fields,
): GenerateFields<Fields> => convert(fields) as GenerateFields<Fields>;

export default generateFields;


const Fields = generateFields({
  user: {
    name: 'name',
    email: 'email',
  },
  users: [
    {
      name: 'name',
      email: 'email',
      address: {
        street: 'street',
        city: 'city',
        state: 'state',
        zips: [{
          zip: 'zip',
          country: 'country',
        }],
        phones: [{
          number: 'number',
          type: 'type',

          phone: {
            number: 'number',
            type: 'type',
          }
        }],
      }
    }
  ]
});
