export type Context = {
  path: string;
};

type ArrayNumberPattern = `.${number}`;

type DICT_VALUE =
  | string
  | readonly { readonly [key: string]: DICT_VALUE }[]
  | { readonly [key: string]: DICT_VALUE };

type DICT_OBJECT_VALUE = { readonly [key: string]: DICT_VALUE };
type DICT_ARRAY_VALUE = readonly { readonly [key: string]: DICT_VALUE }[];

type DICT_NESTED_VALUES = DICT_ARRAY_VALUE | DICT_OBJECT_VALUE;

export type DICT = Record<string, DICT_VALUE>;

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

type BuildTuple<
  Type,
  Length extends number,
  Acc extends Type[] = [],
> = Acc['length'] extends Length
  ? Acc
  : BuildTuple<Type, Length, [...Acc, Type]>;

type CountOccurrences<
  S extends string,
  Acc extends unknown[] = [],
> = S extends `${ArrayNumberPattern}${infer Rest}`
  ? CountOccurrences<Rest, [...Acc, 0]>
  : S extends `${infer _}${infer Rest}`
    ? CountOccurrences<Rest, Acc>
    : Acc['length'];

type ExtendObjectWithCondition<
  Condition extends boolean,
  Obj,
> = Condition extends true ? Obj : {};

type CountArrayIndices<Path extends string> = CountOccurrences<Path>;

type TO_NAME<KEY> = Uppercase<CamelToSnakeCase<KEY & string>>;

type TO_FIELD_NAME<KEY> = `${TO_NAME<KEY>}_FIELD`;
type TO_OBJECT_FIELD_NAME<KEY> = `$${TO_NAME<KEY>}`;

type ListFieldAccessor<Path extends string> = (
  ...args: BuildTuple<number, CountArrayIndices<Path>>
) => Path;

type SubArrayElement<Arr extends DICT_NESTED_VALUES> =
  Arr extends readonly (infer Obj)[] ? Obj : never;

type PathGenerator<Path extends string> =
  CountArrayIndices<Path> extends 0 ? Path : ListFieldAccessor<Path>;

type ObjectFieldNameGenerator<
  Key extends string,
  Field extends DICT_OBJECT_VALUE,
> = Field[Key] extends string ? TO_FIELD_NAME<Key> : TO_OBJECT_FIELD_NAME<Key>;

type IsListedBefore<Path extends string> =
  CountArrayIndices<Path> extends 0 ? false : true;

type ExceptNumber<Key, Result> = Key extends `${number}` ? never : Result;

// Features for fields

type FeatureFieldsForArrayFields<Path extends string> = {
  ELEMENT_AT: ListFieldAccessor<`${Path}.${number}`>;
};

type FeatureFieldsForArraySubFields<Path extends string> = {
  AT: ListFieldAccessor<Path>;
};

// generator for fields group

type FieldsNameGenerator<Field extends DICT_NESTED_VALUES> = {
  [KEY in keyof Field as Field[KEY] extends string
    ? TO_NAME<KEY>
    : never]: Field[KEY];
} &
  // For array fields inside names not showing in common version
  ExtendObjectWithCondition<
    SubArrayElement<Field> extends never ? false : true,
    {
      [KEY in keyof SubArrayElement<Field> as SubArrayElement<Field>[KEY] extends string
        ? TO_NAME<KEY>
        : never]: SubArrayElement<Field>[KEY];
    }
  >;

type FieldsFieldGenerator<
  Field extends DICT_NESTED_VALUES,
  Path extends string = '',
> = {
  [KEY in keyof Field as Field[KEY] extends string
    ? TO_FIELD_NAME<KEY>
    : never]: Path extends ''
    ? Field[KEY]
    : IsListedBefore<Path> extends true
      ? ListFieldAccessor<`${Path}.${Field[KEY] & string}`>
      : `${Path}.${Field[KEY] & string}`;
};

type GenerateFieldsFromArrays<
  Field extends DICT_NESTED_VALUES,
  Path extends string,
> = {
  [KEY in keyof SubArrayElement<Field> as ObjectFieldNameGenerator<
    KEY & string,
    SubArrayElement<Field>
  >]: SubArrayElement<Field>[KEY] extends DICT_NESTED_VALUES
    ? FieldsGroup<
        SubArrayElement<Field>[KEY],
        `${Path}.${number}.${KEY & string}`,
        KEY & string
      >
    : ListFieldAccessor<`${Path}.${number}.${KEY & string}`>;
};

type GenerateFieldsFromObjects<
  Field extends DICT_NESTED_VALUES,
  Path extends string,
> = {
  [KEY in keyof Field as Field[KEY] extends DICT_NESTED_VALUES
    ? ExceptNumber<KEY, TO_OBJECT_FIELD_NAME<KEY>>
    : never]: Field[KEY] extends DICT_OBJECT_VALUE
    ? FieldsGroup<Field[KEY], `${Path}.${KEY & string}`, KEY & string>
    : Field[KEY] extends DICT_ARRAY_VALUE
      ? FieldsGroup<Field[KEY], `${Path}.${KEY & string}`, KEY & string>
      : never;
};

type AddonOnlyArraysFields<
  Field extends DICT_NESTED_VALUES,
  Obj,
> = ExtendObjectWithCondition<
  SubArrayElement<Field> extends never ? false : true,
  Obj
>;

type AddonOnlyFieldsThatListedBefore<
  Field extends DICT_NESTED_VALUES,
  Path extends string,
  Obj,
> = ExtendObjectWithCondition<
  IsListedBefore<Path> extends true
    ? SubArrayElement<Field> extends never
      ? true
      : false
    : false,
  Obj
>;

type FieldsGroup<
  Field extends DICT_NESTED_VALUES,
  Path extends string,
  FieldName extends string,
> = {
  readonly KEY: FieldName;

  readonly PATH: PathGenerator<Path>;
} & FieldsNameGenerator<Field> &
  GenerateFieldsFromArrays<Field, Path> &
  GenerateFieldsFromObjects<Field, Path> &
  FieldsFieldGenerator<Field, Path> &
  AddonOnlyFieldsThatListedBefore<
    Field,
    Path,
    FeatureFieldsForArraySubFields<Path>
  > &
  AddonOnlyArraysFields<Field, FeatureFieldsForArrayFields<Path>>;

export type GenerateFields<Fields extends DICT> = FieldsFieldGenerator<Fields> &
  FieldsNameGenerator<Fields> & {
    [KEY in keyof Fields as Fields[KEY] extends DICT_NESTED_VALUES
      ? TO_OBJECT_FIELD_NAME<KEY>
      : never]: Fields[KEY] extends DICT_NESTED_VALUES
      ? FieldsGroup<Fields[KEY], KEY & string, KEY & string>
      : never;
  };
