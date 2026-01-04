import type { ListFieldAccessor } from './accessors';
import type { DictObjectValue} from './base';
import type {
  FeatureFieldsForArrayFields,
  FeatureFieldsForArraySubFields,
} from './features';
import type {
  whenString,
  whenListed,
  toFieldName,
  ExceptNumber,
  toPropertyName,
  SubArrayElement,
  toObjectFieldName,
  whenIsEmptyString,
  whenDictArrayValue,
  whenDictObjectValue,
  whenDictNestedValues,
  AddonOnlyArraysFields,
  AddonOnlyFieldsThatListedBefore,
} from './helpers';

type PathGenerator<Path extends string> = whenListed<
  Path,
  ListFieldAccessor<Path>,
  Path
>;

type ObjectFieldNameGenerator<
  Key extends string,
  Field extends Record<string, unknown>,
> = Field[Key] extends string ? toFieldName<Key> : toObjectFieldName<Key>;

export type FieldsNameGenerator<Field> = {
  [KEY in keyof Field as whenString<
    Field[KEY],
    toPropertyName<KEY>
  >]: Field[KEY];
};

export type FieldsFieldGenerator<
  Field,
  Path extends string = '',
> = {
  [KEY in keyof Field as whenString<
    Field[KEY],
    toFieldName<KEY>
  >]: whenIsEmptyString<
    Path,
    Field[KEY],
    whenListed<
      Path,
      ListFieldAccessor<`${Path}.${Field[KEY] & string}`>,
      `${Path}.${Field[KEY] & string}`
    >
  >;
};

type GenerateFieldsFromArrays<
  Field,
  Path extends string,
> = {
  [KEY in keyof SubArrayElement<Field> as ObjectFieldNameGenerator<
    KEY & string,
    SubArrayElement<Field> & DictObjectValue
  >]: whenDictNestedValues<
    SubArrayElement<Field>[KEY],
    FieldsGroup<
      SubArrayElement<Field>[KEY],
      `${Path}.${number}.${KEY & string}`,
      KEY & string
    >,
    ListFieldAccessor<`${Path}.${number}.${SubArrayElement<Field>[KEY] & string}`>
  >;
} & {
  [KEY in keyof SubArrayElement<Field> as whenString<
    SubArrayElement<Field>[KEY],
    toPropertyName<KEY>
  >]: SubArrayElement<Field>[KEY];
};

type GenerateFieldsFromObjects<
  Field,
  Path extends string,
> = {
  [KEY in keyof Field as whenDictNestedValues<
    Field[KEY],
    ExceptNumber<KEY, toObjectFieldName<KEY>>
  >]: whenDictObjectValue<
    Field[KEY],
    FieldsGroup<
      Field[KEY],
      `${Path}.${KEY & string}`,
      KEY & string
    >,
    whenDictArrayValue<
      Field[KEY],
      FieldsGroup<
        Field[KEY],
        `${Path}.${KEY & string}`,
        KEY & string
      >
    >
  >;
};

type BaseFields<FieldName extends string, Path extends string> = {
  readonly KEY: FieldName;
  readonly PATH: PathGenerator<Path>;
};

type NameFields<Field> = FieldsNameGenerator<Field>;

type NestedFields<
  Field,
  Path extends string,
> =
GenerateFieldsFromArrays<Field, Path> 
& GenerateFieldsFromObjects<Field, Path>;

type FieldAccessors<
  Field,
  Path extends string,
> = FieldsFieldGenerator<Field, Path> &
  AddonOnlyFieldsThatListedBefore<
    Field,
    Path,
    FeatureFieldsForArraySubFields<Path>
  > &
  AddonOnlyArraysFields<Field, FeatureFieldsForArrayFields<Path>>;

export type FieldsGroup<
  Field,
  Path extends string,
  FieldName extends string,
> = BaseFields<FieldName, Path> &
  NameFields<Field> &
  NestedFields<Field, Path> &
  FieldAccessors<Field, Path>;
