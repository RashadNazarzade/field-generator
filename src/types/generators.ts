import type { ListFieldAccessor } from './accessors';
import type {
  DefaultOptions,
  DictObjectValue,
  GenerateFieldsOptions,
  TypeGenerateFieldsOptions,
} from './base';
import type { FeatureFieldsForArrayFields, FeatureFieldsForArraySubFields } from './features';
import type {
  AddonOnlyArraysFields,
  AddonOnlyFieldsThatListedBefore,
  ExceptNumber,
  SubArrayElement,
  toFieldName,
  toObjectFieldName,
  toPropertyName,
  whenDictArrayValue,
  whenDictNestedValues,
  whenDictObjectValue,
  whenIsEmptyString,
  whenListed,
  whenString,
} from './helpers';

type PathGenerator<Path extends string, Options extends GenerateFieldsOptions> = whenListed<
  Path,
  ListFieldAccessor<Path, Options>,
  Path
>;

type ObjectFieldNameGenerator<
  Key extends string,
  Field extends Record<string, unknown>,
  Options extends TypeGenerateFieldsOptions,
> = Field[Key] extends string ? toFieldName<Key, Options> : toObjectFieldName<Key, Options>;

export type FieldsNameGenerator<Field, Options extends TypeGenerateFieldsOptions> = {
  [KEY in keyof Field as whenString<Field[KEY], toPropertyName<KEY, Options>>]: Field[KEY];
};

export type FieldsFieldGenerator<
  Field,
  Path extends string = '',
  Options extends GenerateFieldsOptions = DefaultOptions,
> = {
  [KEY in keyof Field as whenString<Field[KEY], toFieldName<KEY, Options>>]: whenIsEmptyString<
    Path,
    Field[KEY],
    whenListed<
      Path,
      ListFieldAccessor<`${Path}.${Field[KEY] & string}`, Options>,
      `${Path}.${Field[KEY] & string}`
    >
  >;
};

type GenerateFieldsFromArrays<
  Field,
  Path extends string = '',
  Options extends GenerateFieldsOptions = DefaultOptions,
> = {
  [KEY in keyof SubArrayElement<Field> as ObjectFieldNameGenerator<
    KEY & string,
    SubArrayElement<Field> & DictObjectValue,
    Options
  >]: whenDictNestedValues<
    SubArrayElement<Field>[KEY],
    FieldsGroup<
      SubArrayElement<Field>[KEY],
      `${Path}.${number}.${KEY & string}`,
      KEY & string,
      Options
    >,
    ListFieldAccessor<`${Path}.${number}.${SubArrayElement<Field>[KEY] & string}`, Options>
  >;
} & {
  [KEY in keyof SubArrayElement<Field> as whenString<
    SubArrayElement<Field>[KEY],
    toPropertyName<KEY, Options>
  >]: SubArrayElement<Field>[KEY];
};

type GenerateFieldsFromObjects<
  Field,
  Path extends string,
  Options extends GenerateFieldsOptions,
> = {
  [KEY in keyof Field as whenDictNestedValues<
    Field[KEY],
    ExceptNumber<KEY, toObjectFieldName<KEY, Options>>
  >]: whenDictObjectValue<
    Field[KEY],
    FieldsGroup<Field[KEY], `${Path}.${KEY & string}`, KEY & string, Options>,
    whenDictArrayValue<
      Field[KEY],
      FieldsGroup<Field[KEY], `${Path}.${KEY & string}`, KEY & string, Options>
    >
  >;
};

type BaseFields<
  FieldName extends string,
  Path extends string,
  Options extends GenerateFieldsOptions,
> = {
  readonly KEY: FieldName;
  readonly PATH: PathGenerator<Path, Options>;
};

type NameFields<Field, Options extends TypeGenerateFieldsOptions> = FieldsNameGenerator<
  Field,
  Options
>;

//prettier-ignore
type NestedFields<Field, Path extends string, Options extends GenerateFieldsOptions> = GenerateFieldsFromArrays<Field, Path, Options> &
  GenerateFieldsFromObjects<Field, Path, Options>;

// prettier-ignore
type FieldAccessors<Field, Path extends string, Options extends GenerateFieldsOptions> = FieldsFieldGenerator<Field, Path, Options> &
  AddonOnlyFieldsThatListedBefore<Field, Path, FeatureFieldsForArraySubFields<Path, Options>> &
  AddonOnlyArraysFields<Field, FeatureFieldsForArrayFields<Path, Options>>;

// prettier-ignore
export type FieldsGroup<Field, Path extends string, FieldName extends string, Options extends GenerateFieldsOptions> = 
  BaseFields<FieldName, Path, Options> &
  NameFields<Field, Options> &
  NestedFields<Field, Path, Options> &
  FieldAccessors<Field, Path, Options>;
