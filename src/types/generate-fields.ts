import type { Dict } from './base'
import type { ValidateDictSchema } from './validation';
import type { whenDictNestedValues, toObjectFieldName } from './helpers';
import type { FieldsGroup, FieldsNameGenerator, FieldsFieldGenerator } from './generators';

export type {
  Dict,
  ValidateDictSchema,
}

export type GenerateFields<Fields extends Dict> = 
  FieldsFieldGenerator<Fields> 
  & FieldsNameGenerator<Fields> 
  & {
    [KEY in keyof Fields as whenDictNestedValues<Fields[KEY], toObjectFieldName<KEY>>]: 
        FieldsGroup<Fields[KEY], KEY & string, KEY & string>
  };
