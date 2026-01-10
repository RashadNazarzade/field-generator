import type { TypeGenerateFieldsOptions } from '@/types/generate-fields';

const defaultStandAloneOptions = {
  listFieldsReturnType: 'default',
  fieldNameCaseFormat: 'upper-snake-case',
} satisfies TypeGenerateFieldsOptions;

const defaultOptions = {
  lazy: false,
  ...defaultStandAloneOptions,
} as const;

export type DefaultOptions = typeof defaultOptions;

export { defaultOptions, defaultStandAloneOptions };
