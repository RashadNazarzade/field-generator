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
  const Opt extends GenerateFieldsOptions | never = never,
  Options extends GenerateFieldsOptions = whenNever<
    Opt,
    DefaultOptions,
    Omit<DefaultOptions, keyof Opt> & Opt
  >,
>(
  fields: ValidateDictSchema<Fields>,
  options: Opt = defaultOptions as Opt,
) => {
  const { lazy } = options;

  if (lazy) {
    return convertLazy(fields) as GenerateFields<Fields, Options>;
  }
  return convertEager(fields) as GenerateFields<Fields, Options>;
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
  options: Opt = defaultStandAloneOptions as Opt,
) => convertEager(fields) as GenerateFields<Fields, Options>;

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
  options: Opt = defaultStandAloneOptions as Opt,
) => convertLazy(fields) as GenerateFields<Fields, Options>;

export default generateFields;
