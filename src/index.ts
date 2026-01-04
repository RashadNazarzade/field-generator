import type {
  DefaultOptions,
  Dict,
  GenerateFields,
  Options,
  ValidateDictSchema,
} from '@/types/generate-fields';

import { convertEager, convertLazy } from '@/core';

const defaultOptions: DefaultOptions = {
  lazy: false,
};

export const generateFields = <
  const Fields extends Dict,
  const Opt extends Options = DefaultOptions,
>(
  fields: ValidateDictSchema<Fields>,
  options: Opt = defaultOptions as Opt,
) => {
  const { lazy } = options;

  if (lazy) {
    return convertLazy(fields) as GenerateFields<Fields>;
  }

  return convertEager(fields) as GenerateFields<Fields>;
};

export default generateFields;
