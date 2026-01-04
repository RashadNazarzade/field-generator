import type { ArrayNumberPattern } from './base';

type CheckCharIsCharCanBeCapitalize<Char extends string> =
  Char extends `${number}` ? never : Capitalize<Char>;

export type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends CheckCharIsCharCanBeCapitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

export type BuildTuple< Type, Length extends number, Acc extends Type[] = []> = 
    Acc['length'] extends Length ? Acc: BuildTuple<Type, Length, [...Acc, Type]>;

export type AddOneToNumber<N extends number> = [
    ...BuildTuple<unknown, N>,
    unknown
]['length'] extends infer L ? L extends number ? L : never : never;


type CountOccurrences<
  S extends string,
  Acc extends unknown[] = [],
> = S extends `${ArrayNumberPattern}${infer Rest}`
  ? CountOccurrences<Rest, [...Acc, 0]>
  : S extends `${infer _}${infer Rest}`
    ? CountOccurrences<Rest, Acc>
    : Acc['length'];

export type CountArrayIndices<Path extends string> = CountOccurrences<Path>;