import { toScreamingSnakeCase } from "../string/to-screaming-snake-case";

const MAX_CACHE_SIZE = 300;

const nameCache = new Map<string, string>();

export const getCachedName = (name: string) => {
  if(nameCache.has(name)){
    return nameCache.get(name) as string;
  }

  const convertedName = toScreamingSnakeCase(name);

  nameCache.set(name, convertedName);

  return convertedName;
}

export const clearNameCache = () => {
  if(nameCache.size > MAX_CACHE_SIZE) {
    nameCache.clear();
  }
}