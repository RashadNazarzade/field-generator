import type { Context } from '../type.js';

import { isListed } from '../utils/is-list.js';
import { toSnakeCase } from '../utils/to-snake-case.js';
import { createIndexFormatter } from '../utils/create-index-formatter.js';

const defaultContext: Context = {
  path: '',
};

export const convert = <Fields extends Record<string, any>>(
  field: Fields,
  context: Context = defaultContext,
) => {
  const isList = Array.isArray(field);

  const { path = '' } = context;

  const isListedBefore = isListed(path);

  const fieldsObj = isList ? field[0] : field;
  const fields = Object.entries(fieldsObj);

  return fields.reduce(
    (acc, [key, value]) => {
      const convertedName = toSnakeCase(key).toUpperCase();

      if (typeof value === 'string') {
        acc[convertedName] = value;

        const accessorName = `${convertedName}_FIELD`;

        if (isList || isListedBefore) {
          acc[accessorName] = createIndexFormatter(`${path}.${key}`);
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

        if (path)
          subGroup.PATH = isListed(subGroupPathField)
            ? createIndexFormatter(subGroupPathField)
            : subGroupPathField;

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

        if (path)
          subGroup.PATH = isListed(subGroupPath)
            ? createIndexFormatter(subGroupPath)
            : subGroupPath;

        if (isListed(subGroupPath))
          subGroup.AT = createIndexFormatter(subGroupPath);

        acc[accessorName] = subGroup;

        return acc;
      }

      return acc;
    },
    {} as Record<string, any>,
  );
};
