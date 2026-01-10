import type {
  DictArrayValue,
  DictNestedValues,
  DictObjectValue,
  TypeGenerateFieldsOptions,
} from './base';
import type { CamelToSnakeCase, CountArrayIndices } from './utilities';

export type toPropertyName<
  KEY,
  Options extends TypeGenerateFieldsOptions,
> = Options['fieldNameCaseFormat'] extends 'upper-snake-case'
  ? Uppercase<CamelToSnakeCase<KEY & string>>
  : Options['fieldNameCaseFormat'] extends 'snake-case'
    ? CamelToSnakeCase<KEY & string>
    : KEY & string;

export type toFieldName<
  KEY,
  Options extends TypeGenerateFieldsOptions,
> = `${toPropertyName<KEY, Options>}_FIELD`;

export type toObjectFieldName<
  KEY,
  Options extends TypeGenerateFieldsOptions,
> = `$${toPropertyName<KEY, Options>}`;

export type IsListedBefore<Path extends string> = CountArrayIndices<Path> extends 0 ? false : true;

export type whenNever<Val, Result, Fallback> = [Val] extends [never] ? Result : Fallback;
export type whenString<Val, Result> = Val extends string ? Result : never;
export type whenListed<Path extends string, Result, Fallback = never> =
  IsListedBefore<Path> extends true ? Result : Fallback;
export type whenIsEmptyString<Str extends string, WhenEmpty, NotEmpty> = Str extends ''
  ? WhenEmpty
  : NotEmpty;
export type whenDictNestedValues<Val, Result, Fallback = never> = Val extends DictNestedValues
  ? Result
  : Fallback;
export type whenDictObjectValue<Val, Result, Fallback = never> = Val extends DictObjectValue
  ? Result
  : Fallback;
export type whenDictArrayValue<Val, Result, Fallback = never> = Val extends DictArrayValue
  ? Result
  : Fallback;

export type ExceptNumber<Key, Result> = Key extends `${number}` ? never : Result;

export type SubArrayElement<Arr> = Arr extends readonly [infer Obj] ? Obj : never;

export type HasArrayElements<Field> = SubArrayElement<Field> extends never ? false : true;

export type ExtendObjectWithCondition<Condition extends boolean, Obj> = Condition extends true
  ? Obj
  : {};

export type AddonOnlyArraysFields<Field, Obj> = ExtendObjectWithCondition<
  HasArrayElements<Field>,
  Obj
>;

export type AddonOnlyFieldsThatListedBefore<
  Field,
  Path extends string,
  Obj,
> = ExtendObjectWithCondition<
  IsListedBefore<Path> extends true ? (SubArrayElement<Field> extends never ? true : false) : false,
  Obj
>;
