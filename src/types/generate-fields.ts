import type { Dict, GenerateFieldsOptions, TypeGenerateFieldsOptions } from './base';
import type { FieldsFieldGenerator, FieldsGroup, FieldsNameGenerator } from './generators';
import type { toObjectFieldName, whenDictNestedValues, whenNever } from './helpers';
import type { ValidateDictSchema } from './validation';

export type {
  Dict,
  GenerateFieldsOptions,
  TypeGenerateFieldsOptions,
  ValidateDictSchema,
  whenNever,
};

export type GenerateFields<
  Fields extends Dict,
  Options extends TypeGenerateFieldsOptions,
> = FieldsFieldGenerator<Fields, '', Options> &
  FieldsNameGenerator<Fields, Options> & {
    [KEY in keyof Fields as whenDictNestedValues<
      Fields[KEY],
      toObjectFieldName<KEY, Options>
    >]: FieldsGroup<Fields[KEY], KEY & string, KEY & string, Options>;
  };
