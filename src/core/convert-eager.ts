import type {
  Context,
  ConvertedFields,
  DictValue,
  GenerateFieldsOptions,
  ReservedKeys,
} from '@/types/base';

import { RESERVED_KEYS, ReservedKeysError } from '@/constants';
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

export const convertEager = <Fields>(
  field: Fields,
  options: GenerateFieldsOptions,
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

  let convertedFields: ConvertedFields = {};

  for (let i = 0; i < fields.length; i++) {
    const [key, value] = fields[i] as [string, DictValue];

    if (RESERVED_KEYS.has(key as ReservedKeys)) {
      throw new ReservedKeysError(key as ReservedKeys);
    }

    const convertedName = getCachedName(key, options);

    if (typeof value === 'string') {
      convertedFields[convertedName] = value;

      const accessorName = `${convertedName}${fieldAccessorSuffix}`;
      const fullPath = path ? `${path}.${value}` : value;

      if (isList || isListedBefore) {
        convertedFields[accessorName] = createIndexFormatter(fullPath);
        continue;
      }

      convertedFields[accessorName] = fullPath;

      continue;
    }

    if (Array.isArray(value)) {
      const accessorName = `$${convertedName}`;
      const subGroupPath = path ? `${path}.${key}.#` : `${key}.#`;
      const subGroupPathField = path ? `${path}.${key}` : `${key}`;

      const subGroup = convertEager(value, options, {
        path: subGroupPath,
      });

      subGroup[featureSuffixGenerator('key')] = key;
      subGroup[featureSuffixGenerator('path')] = pathGenerator(subGroupPathField, key);
      subGroup[featureSuffixGenerator('element_at')] = createIndexFormatter(subGroupPath);

      convertedFields[accessorName] = subGroup;

      continue;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const accessorName = `$${convertedName}`;
      const subGroupPath = path ? `${path}.${key}` : key;

      const subGroup = convertEager(value, options, {
        path: subGroupPath,
      });

      subGroup[featureSuffixGenerator('key')] = key;
      subGroup[featureSuffixGenerator('path')] = pathGenerator(subGroupPath, key);

      if (isListedBefore)
        subGroup[featureSuffixGenerator('at')] = createIndexFormatter(subGroupPath);

      convertedFields[accessorName] = subGroup;
    }
  }

  return convertedFields;
};
