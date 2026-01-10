import { RESERVED_KEYS, ReservedKeysError } from '@/constants';
import type {
  Context,
  ConvertedField,
  ConvertedFields,
  DictValue,
  ReservedKeys,
  TypeGenerateFieldsOptions,
} from '@/types/base';
import {
  createIndexFormatter,
  getCachedName,
  isListed,
  isStartingUpper,
  pathGenerator,
} from '@/utils';

const defaultContext: Context = {
  path: '',
};

export const convertLazy = <Fields>(
  field: Fields,
  options: TypeGenerateFieldsOptions,
  context: Context = defaultContext,
): ConvertedFields => {
  const isList = Array.isArray(field);

  const { path = '' } = context;

  const isListedBefore = isListed(path);

  const fieldsObj = isList ? field[0] : field;
  const fields = Object.entries<DictValue>(fieldsObj);

  const featureSuffixGenerator = (suffix: string) =>
    isStartingUpper(options.fieldNameCaseFormat) ? suffix?.toUpperCase() : suffix;

  const fieldAccessorSuffix = isStartingUpper(options.fieldNameCaseFormat)
    ? options.fieldAccessorSuffix?.toUpperCase()
    : options.fieldAccessorSuffix;

  const cache = new Map<string, ConvertedField>();

  let convertedFields: ConvertedFields = {};

  for (let i = 0; i < fields.length; i++) {
    const [key, value] = fields[i] as [string, DictValue];

    if (RESERVED_KEYS.has(key as ReservedKeys)) {
      throw new ReservedKeysError(key as ReservedKeys);
    }

    const convertedName = getCachedName(key, options);

    if (typeof value === 'string') {
      Object.defineProperty(convertedFields, convertedName, {
        get: () => value,
        enumerable: true,
      });

      const accessorName = `${convertedName}${fieldAccessorSuffix}`;

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
        configurable: true,
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

          const subGroup = convertLazy(value, options, {
            path: subGroupPath,
          });

          subGroup[featureSuffixGenerator('key')] = key;
          subGroup[featureSuffixGenerator('path')] = pathGenerator(subGroupPathField, key);
          subGroup[featureSuffixGenerator('element_at')] = createIndexFormatter(subGroupPath);

          cache.set(accessorName, subGroup);

          return subGroup;
        },
        configurable: true,
        enumerable: true,
      });
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const accessorName = `$${convertedName}`;

      Object.defineProperty(convertedFields, accessorName, {
        get: () => {
          if (cache.has(accessorName)) {
            return cache.get(accessorName);
          }

          const subGroupPath = path ? `${path}.${key}` : key;

          const subGroup = convertLazy(value, options, {
            path: subGroupPath,
          });

          subGroup[featureSuffixGenerator('key')] = key;
          subGroup[featureSuffixGenerator('path')] = pathGenerator(subGroupPath, key);

          if (isListedBefore)
            subGroup[featureSuffixGenerator('at')] = createIndexFormatter(subGroupPath);

          cache.set(accessorName, subGroup);

          return subGroup;
        },
        configurable: true,
        enumerable: true,
      });
    }
  }

  return convertedFields;
};
