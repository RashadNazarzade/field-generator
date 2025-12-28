export type Context = {
  path: string;
};

export type ReservedKeys = 'key' | 'path' | 'elementAt' | 'at';

type ArrayNumberPattern = `.${number}`;

type DictValue =
  | string
  | readonly [{ readonly [key: string]: DictValue }]
  | { readonly [key: string]: DictValue };

type DictObjectValue = { readonly [key: string]: DictValue };
type DictArrayValue = readonly [{ readonly [key: string]: DictValue }];

type DictNestedValues = DictArrayValue | DictObjectValue;

export type Dict = Record<string, DictValue>;

export type ValidateDICT<DictObj extends Dict | DictNestedValues> = {
  [Key in keyof DictObj]: DictObj[Key] extends DictNestedValues
    ? ValidateDICT<DictObj[Key]>
    : Key extends ReservedKeys
      ? `Error: "${Key & string}" is a reserved key and cannot be used`
      : DictObj[Key];
};

type CheckCharIsCharCanBeCapitalize<Char extends string> =
  Char extends `${number}` ? never : Capitalize<Char>;

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends CheckCharIsCharCanBeCapitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

type BuildTuple<
  Type,
  Length extends number,
  Acc extends Type[] = [],
> = Acc['length'] extends Length
  ? Acc
  : BuildTuple<Type, Length, [...Acc, Type]>;

type AddOne<N extends number> = [
  ...BuildTuple<unknown, N>,
  unknown,
]['length'] extends infer L
  ? L extends number
    ? L
    : never
  : never;

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

type toPropertyName<KEY> = Uppercase<CamelToSnakeCase<KEY & string>>;

type toFieldName<KEY> = `${toPropertyName<KEY>}_FIELD`;
type toObjectFieldName<KEY> = `$${toPropertyName<KEY>}`;

type ListFieldAccessorReturn<
  ListPath extends string,
  ArgList extends number[],
  NewPath extends string = '',
  ArgIndex extends number = 0,
> = ListPath extends `.${number}${infer Rest}`
  ? ArgIndex extends ArgList['length']
    ? `${NewPath}.${ListPath}`
    : ListFieldAccessorReturn<
        Rest,
        ArgList,
        `${NewPath}.${ArgList[ArgIndex]}`,
        AddOne<ArgIndex>
      >
  : ListPath extends `.${infer First}${infer Rest}`
    ? ListFieldAccessorReturn<Rest, ArgList, `${NewPath}.${First}`, ArgIndex>
    : ListPath extends `${infer First}${infer Rest}`
      ? ListFieldAccessorReturn<Rest, ArgList, `${NewPath}${First}`, ArgIndex>
      : NewPath;

type ListFieldAccessor<
  Path extends string,
  ArgsList extends BuildTuple<number, CountArrayIndices<Path>> = BuildTuple<
    number,
    CountArrayIndices<Path>
  >,
> = <Args extends ArgsList>(
  ...args: Args
) => ListFieldAccessorReturn<Path, Args>;

type SubArrayElement<Arr extends DictNestedValues> =
  Arr extends readonly (infer Obj)[] ? Obj : never;

type HasArrayElements<Field extends DictNestedValues> =
  SubArrayElement<Field> extends never ? false : true;

type PathGenerator<Path extends string> =
  CountArrayIndices<Path> extends 0 ? Path : ListFieldAccessor<Path>;

type ObjectFieldNameGenerator<
  Key extends string,
  Field extends DictObjectValue,
> = Field[Key] extends string ? toFieldName<Key> : toObjectFieldName<Key>;

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

type FieldsNameGenerator<Field extends DictNestedValues> = {
  [KEY in keyof Field as Field[KEY] extends string
    ? toPropertyName<KEY>
    : never]: Field[KEY];
};

type FieldsFieldGenerator<
  Field extends DictNestedValues,
  Path extends string = '',
> = {
  [KEY in keyof Field as Field[KEY] extends string
    ? toFieldName<KEY>
    : never]: Path extends ''
    ? Field[KEY]
    : IsListedBefore<Path> extends true
      ? ListFieldAccessor<`${Path}.${Field[KEY] & string}`>
      : `${Path}.${Field[KEY] & string}`;
};

type GenerateFieldsFromArrays<
  Field extends DictNestedValues,
  Path extends string,
> = {
  [KEY in keyof SubArrayElement<Field> as ObjectFieldNameGenerator<
    KEY & string,
    SubArrayElement<Field>
  >]: SubArrayElement<Field>[KEY] extends DictNestedValues
    ? FieldsGroup<
        SubArrayElement<Field>[KEY],
        `${Path}.${number}.${KEY & string}`,
        KEY & string
      >
    : ListFieldAccessor<`${Path}.${number}.${SubArrayElement<Field>[KEY] & string}`>;
} & {
  [KEY in keyof SubArrayElement<Field> as SubArrayElement<Field>[KEY] extends string
    ? toPropertyName<KEY>
    : never]: SubArrayElement<Field>[KEY];
};

type GenerateFieldsFromObjects<
  Field extends DictNestedValues,
  Path extends string,
> = {
  [KEY in keyof Field as Field[KEY] extends DictNestedValues
    ? ExceptNumber<KEY, toObjectFieldName<KEY>>
    : never]: Field[KEY] extends DictObjectValue
    ? FieldsGroup<Field[KEY], `${Path}.${KEY & string}`, KEY & string>
    : Field[KEY] extends DictArrayValue
      ? FieldsGroup<Field[KEY], `${Path}.${KEY & string}`, KEY & string>
      : never;
};

type AddonOnlyArraysFields<
  Field extends DictNestedValues,
  Obj,
> = ExtendObjectWithCondition<HasArrayElements<Field>, Obj>;

type AddonOnlyFieldsThatListedBefore<
  Field extends DictNestedValues,
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

type BaseFields<FieldName extends string, Path extends string> = {
  readonly KEY: FieldName;
  readonly PATH: PathGenerator<Path>;
};

type NameFields<Field extends DictNestedValues> = FieldsNameGenerator<Field>;

type NestedFields<
  Field extends DictNestedValues,
  Path extends string,
> = GenerateFieldsFromArrays<Field, Path> &
  GenerateFieldsFromObjects<Field, Path>;

type FieldAccessors<
  Field extends DictNestedValues,
  Path extends string,
> = FieldsFieldGenerator<Field, Path> &
  AddonOnlyFieldsThatListedBefore<
    Field,
    Path,
    FeatureFieldsForArraySubFields<Path>
  > &
  AddonOnlyArraysFields<Field, FeatureFieldsForArrayFields<Path>>;

// prettier-ignore
type FieldsGroup<
  Field extends DictNestedValues,
  Path extends string,
  FieldName extends string,
> =  
  BaseFields<FieldName, Path>
  & NameFields<Field>
  & NestedFields<Field, Path>
  & FieldAccessors<Field, Path>;

// prettier-ignore
export type GenerateFields<Fields extends Dict> = 
  FieldsFieldGenerator<Fields> 
  & FieldsNameGenerator<Fields> 
  & {
    [KEY in keyof Fields as Fields[KEY] extends DictNestedValues ? toObjectFieldName<KEY> : never]: 
      Fields[KEY] extends DictNestedValues
        ? FieldsGroup<Fields[KEY], KEY & string, KEY & string>
        : never;
  };
