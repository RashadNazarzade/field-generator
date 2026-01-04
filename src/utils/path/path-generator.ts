import { isListed } from './is-listed';
import { createIndexFormatter } from './create-index-formatter';

export const pathGenerator = (path: string, fallbackPath?: string) => {
  if (!path) {
    return fallbackPath;
  }

  if (isListed(path)) {
    return createIndexFormatter(path);
  }

  return path;
};
