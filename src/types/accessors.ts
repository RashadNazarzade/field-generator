import type { TypeGenerateFieldsOptions } from './base';
import type { AddOneToNumber, BuildTuple, CountArrayIndices } from './utilities';

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
        AddOneToNumber<ArgIndex>
      >
  : ListPath extends `.${infer First}${infer Rest}`
    ? ListFieldAccessorReturn<Rest, ArgList, `${NewPath}.${First}`, ArgIndex>
    : ListPath extends `${infer First}${infer Rest}`
      ? ListFieldAccessorReturn<Rest, ArgList, `${NewPath}${First}`, ArgIndex>
      : NewPath;

export type ListFieldAccessor<
  Path extends string,
  Options extends TypeGenerateFieldsOptions,
  ArgsList extends BuildTuple<number, CountArrayIndices<Path>> = BuildTuple<
    number,
    CountArrayIndices<Path>
  >,
> = <Args extends ArgsList>(
  ...args: Args
) => Options['listFieldsReturnType'] extends 'exact' ? ListFieldAccessorReturn<Path, Args> : Path;
