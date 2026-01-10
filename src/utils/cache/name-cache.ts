import type { TypeGenerateFieldsOptions } from '@/types/generate-fields';
import { toScreamingSnakeCase, toSnakeCase } from '../string';

const MAX_CACHE_SIZE = 300;

const nameCache = new Map<[string, TypeGenerateFieldsOptions], string>();

const convertName: Record<
  NonNullable<TypeGenerateFieldsOptions['fieldNameCaseFormat']>,
  (name: string) => string
> = {
  'upper-snake-case': toScreamingSnakeCase,
  'snake-case': toSnakeCase,
  'no-case': (name) => name,
};

export const getCachedName = (name: string, options: TypeGenerateFieldsOptions) => {
  if (nameCache.has([name, options])) {
    return nameCache.get([name, options]) as string;
  }

  const { fieldNameCaseFormat = 'upper-snake-case' } = options;

  const convertedName = convertName[fieldNameCaseFormat](name);

  nameCache.set([name, options], convertedName);

  return convertedName;
};

export const clearNameCache = () => {
  if (nameCache.size > MAX_CACHE_SIZE) {
    nameCache.clear();
  }
};
