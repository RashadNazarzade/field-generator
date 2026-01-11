import type {
  Dict,
  GenerateFields,
  GenerateFieldsOptions,
  TypeGenerateFieldsOptions,
  ValidateDictSchema,
  whenNever,
} from '@/types/generate-fields';

import { defaultOptions, defaultStandAloneOptions, type DefaultOptions } from '@/constants';
import { convertEager, convertLazy } from '@/core';

export const generateFields = <
  const Fields extends Dict,
  const Opt extends GenerateFieldsOptions = never,
  Options extends GenerateFieldsOptions = whenNever<
    Opt,
    DefaultOptions,
    Omit<DefaultOptions, keyof Opt> & Opt
  >,
>(
  fields: ValidateDictSchema<Fields>,
  opt: Opt = defaultOptions as unknown as Opt,
) => {
  const { lazy, ...rest } = opt;
  const options = { ...defaultOptions, ...rest };

  if (lazy) {
    return convertLazy(fields, options) as GenerateFields<Fields, Options>;
  }

  return convertEager(fields, options) as GenerateFields<Fields, Options>;
};

export const generateFieldsEager = <
  const Fields extends Dict,
  const Opt extends TypeGenerateFieldsOptions | never = never,
  Options extends GenerateFieldsOptions = whenNever<
    Opt,
    DefaultOptions,
    Omit<DefaultOptions, keyof Opt> & Opt
  >,
>(
  fields: ValidateDictSchema<Fields>,
  opt: Opt = defaultStandAloneOptions as unknown as Opt,
) => {
  const options = { ...defaultStandAloneOptions, ...opt };

  return convertEager(fields, options) as GenerateFields<Fields, Options>;
};

export const generateFieldsLazy = <
  const Fields extends Dict,
  const Opt extends TypeGenerateFieldsOptions | never = never,
  Options extends GenerateFieldsOptions = whenNever<
    Opt,
    DefaultOptions,
    Omit<DefaultOptions, keyof Opt> & Opt
  >,
>(
  fields: ValidateDictSchema<Fields>,
  opt: Opt = defaultStandAloneOptions as unknown as Opt,
) => {
  const options = { ...defaultStandAloneOptions, ...opt };

  return convertLazy(fields, options) as GenerateFields<Fields, Options>;
};
