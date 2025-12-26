import { isListed } from './is-list.js';
import { createIndexFormatter } from './create-index-formatter.js';

export const pathGenerator = (path: string, fallbackPath?: string) => {
    if(!path) {
        return fallbackPath;
    }
    
    if(isListed(path)) {
        return createIndexFormatter(path);
    }

    return path
};