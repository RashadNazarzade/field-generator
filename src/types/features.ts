import type { ListFieldAccessor } from './accessors';
import type { TypeGenerateFieldsOptions } from './base';

export type FeatureFieldsForArrayFields<
  Path extends string,
  Options extends TypeGenerateFieldsOptions,
> = {
  ELEMENT_AT: ListFieldAccessor<`${Path}.${number}`, Options>;
};

export type FeatureFieldsForArraySubFields<
  Path extends string,
  Options extends TypeGenerateFieldsOptions,
> = {
  AT: ListFieldAccessor<Path, Options>;
};
