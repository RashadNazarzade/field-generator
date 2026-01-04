import { RESERVED_KEYS, ReservedKeysError } from '@/constants';
import type {
  Context,
  ConvertedField,
  ConvertedFields,
  DictValue,
  ReservedKeys,
} from '@/types/base';
import { createIndexFormatter, getCachedName, isListed, pathGenerator } from '@/utils';

const defaultContext: Context = {
  path: '',
};

export const convertLazy = <Fields>(
  field: Fields,
  context: Context = defaultContext,
): ConvertedFields => {
  const isList = Array.isArray(field);

  const { path = '' } = context;

  const isListedBefore = isListed(path);

  const fieldsObj = isList ? field[0] : field;
  const fields = Object.entries<DictValue>(fieldsObj);

  const cache = new Map<string, ConvertedField>();

  let convertedFields: ConvertedFields = {};

  for (let i = 0; i < fields.length; i++) {
    const [key, value] = fields[i] as [string, DictValue];

    if (RESERVED_KEYS.has(key as ReservedKeys)) {
      throw new ReservedKeysError(key as ReservedKeys);
    }

    const convertedName = getCachedName(key);

    if (typeof value === 'string') {
      Object.defineProperty(convertedFields, convertedName, {
        get: () => value,
        enumerable: true,
      });

      const accessorName = `${convertedName}_FIELD`;

      Object.defineProperty(convertedFields, accessorName, {
        get: () => {
          if (cache.has(accessorName)) {
            return cache.get(accessorName);
          }

          const fullPath = path ? `${path}.${value}` : value;
          const fieldPath = isList || isListedBefore ? createIndexFormatter(fullPath) : fullPath;

          cache.set(accessorName, fieldPath);

          return fieldPath;
        },
        enumerable: true,
      });

      continue;
    }

    if (Array.isArray(value)) {
      const accessorName = `$${convertedName}`;

      Object.defineProperty(convertedFields, accessorName, {
        get: () => {
          if (cache.has(accessorName)) {
            return cache.get(accessorName);
          }

          const subGroupPath = path ? `${path}.${key}.#` : `${key}.#`;
          const subGroupPathField = path ? `${path}.${key}` : `${key}`;

          const subGroup = convertLazy(value, {
            path: subGroupPath,
          });

          subGroup.KEY = key;
          subGroup.PATH = pathGenerator(subGroupPathField, key);
          subGroup.ELEMENT_AT = createIndexFormatter(subGroupPath);

          if (isListedBefore) subGroup.AT = createIndexFormatter(subGroupPath);

          cache.set(accessorName, subGroup);

          return subGroup;
        },
      });
    }

    if (typeof value === 'object' && value) {
      const accessorName = `$${convertedName}`;

      Object.defineProperty(convertedFields, accessorName, {
        get: () => {
          if (cache.has(accessorName)) {
            return cache.get(accessorName);
          }

          const subGroupPath = path ? `${path}.${key}` : key;

          const subGroup = convertLazy(value, {
            path: subGroupPath,
          });

          subGroup.KEY = key;
          subGroup.PATH = pathGenerator(subGroupPath, key);

          if (isListedBefore) subGroup.AT = createIndexFormatter(subGroupPath);

          cache.set(accessorName, subGroup);

          return subGroup;
        },
      });
    }
  }

  return convertedFields;
};
