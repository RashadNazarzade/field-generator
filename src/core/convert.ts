import type { Context, ReservedKeys, ConvertedFields } from '@/types/base';

import { RESERVED_KEYS, ReservedKeysError } from '@/constants'
import { isListed, toSnakeCase, pathGenerator, createIndexFormatter } from '@/utils';

const defaultContext: Context = {
  path: '',
};

export const convert = <Fields>(
  field: Fields,
  context: Context = defaultContext,
) => {
  const isList = Array.isArray(field);

  const { path = '' } = context;

  const isListedBefore = isListed(path);

  const fieldsObj = isList ? field[0] : field;
  const fields = Object.entries(fieldsObj);

  return fields.reduce<ConvertedFields>(
    (acc, [key, value]) => {
      const convertedName = toSnakeCase(key).toUpperCase();

      if (RESERVED_KEYS.has(key as ReservedKeys)) {
        throw new ReservedKeysError(key as ReservedKeys);
      }

      if (typeof value === 'string') {
        acc[convertedName] = value;

        const accessorName = `${convertedName}_FIELD`;

        if (isList || isListedBefore) {
          acc[accessorName] = createIndexFormatter(`${path}.${value}`);
          return acc;
        }

        acc[accessorName] = path ? `${path}.${value}` : value;

        return acc;
      }

      if (Array.isArray(value)) {
        const accessorName = `$${convertedName}`;
        const subGroupPath = path ? `${path}.${key}.#` : `${key}.#`;
        const subGroupPathField = path ? `${path}.${key}` : `${key}`;

        const subGroup = convert(value, {
          path: subGroupPath,
        });

        subGroup.KEY = key;
        subGroup.PATH = pathGenerator(subGroupPathField, key);
        subGroup.ELEMENT_AT = createIndexFormatter(subGroupPath);

        acc[accessorName] = subGroup;

        return acc;
      }

      if (typeof value === 'object' && value) {
        const accessorName = `$${convertedName}`;
        const subGroupPath = path ? `${path}.${key}` : key;

        const subGroup = convert(value, {
          path: subGroupPath,
        });

        subGroup.KEY = key;
        subGroup.PATH = pathGenerator(subGroupPath, key);

        if (isListed(subGroupPath))
          subGroup.AT = createIndexFormatter(subGroupPath);

        acc[accessorName] = subGroup;

        return acc;
      }

      return acc;
    },
    {},
  );
};
