import type { Dict } from './base';
import type { FieldsFieldGenerator, FieldsGroup, FieldsNameGenerator } from './generators';
import type { toObjectFieldName, whenDictNestedValues } from './helpers';
import type { ValidateDictSchema } from './validation';

export type { Dict, ValidateDictSchema };

export type DefaultOptions = {
  lazy: false;
};

export type Options = {
  lazy?: boolean;
};

export type GenerateFields<Fields extends Dict> = FieldsFieldGenerator<Fields> &
  FieldsNameGenerator<Fields> & {
    [KEY in keyof Fields as whenDictNestedValues<Fields[KEY], toObjectFieldName<KEY>>]: FieldsGroup<
      Fields[KEY],
      KEY & string,
      KEY & string
    >;
  };
