import type { Context, ReservedKeys, ConvertedFields, DictValue } from '@/types/base';

import { RESERVED_KEYS, ReservedKeysError } from '@/constants'
import { isListed, pathGenerator, createIndexFormatter, getCachedName } from '@/utils';

const defaultContext: Context = {
    path: '',
};

export const convertEager = <Fields>(
    field: Fields,
    context: Context = defaultContext,
): ConvertedFields => {
    const isList = Array.isArray(field);

    const { path = '' } = context;

    const isListedBefore = isListed(path);

    const fieldsObj = isList ? field[0] : field;
    const fields = Object.entries<DictValue>(fieldsObj);

    let convertedFields: ConvertedFields = {};

    for(let i = 0; i < fields.length; i++){
        const [key, value] = fields[i] as [string, DictValue];

        if(RESERVED_KEYS.has(key as ReservedKeys)){
            throw new ReservedKeysError(key as ReservedKeys);
        }

        const convertedName = getCachedName(key);

        if(typeof value === 'string'){
            convertedFields[convertedName] = value;

            const accessorName = `${convertedName}_FIELD`;
            const fullPath = path ? `${path}.${value}` : value;

            if(isList || isListedBefore){
                convertedFields[accessorName] = createIndexFormatter(fullPath);
                continue;
            }

            convertedFields[accessorName] = fullPath;

            continue;
        }

        if(Array.isArray(value)){
            const accessorName = `$${convertedName}`;
            const subGroupPath = path ? `${path}.${key}.#` : `${key}.#`;
            const subGroupPathField = path ? `${path}.${key}` : `${key}`;

            const subGroup = convertEager(value, {
                path: subGroupPath,
            });

            subGroup.KEY = key;
            subGroup.PATH = pathGenerator(subGroupPathField, key);
            subGroup.ELEMENT_AT = createIndexFormatter(subGroupPath);

            convertedFields[accessorName] = subGroup;

            continue;
        }


        if(typeof value === 'object' && value){
            const accessorName = `$${convertedName}`;
            const subGroupPath = path ? `${path}.${key}` : key;

            const subGroup = convertEager(value, {
                path: subGroupPath,
            });

            subGroup.KEY = key;
            subGroup.PATH = pathGenerator(subGroupPath, key);

            if(isListedBefore) 
                subGroup.AT = createIndexFormatter(subGroupPath);

            convertedFields[accessorName] = subGroup;
        }

    }


    return convertedFields;
}