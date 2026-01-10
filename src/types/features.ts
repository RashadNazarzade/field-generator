import type { ListFieldAccessor } from './accessors';
import type { TypeGenerateFieldsOptions } from './base';
import type { BaseFieldsCaseConverter } from './helpers';

export type FeatureFieldsForArrayFields<
  Path extends string,
  Options extends TypeGenerateFieldsOptions,
> = BaseFieldsCaseConverter<
  {
    element_at: ListFieldAccessor<`${Path}.${number}`, Options>;
  },
  Options
>;

export type FeatureFieldsForArraySubFields<
  Path extends string,
  Options extends TypeGenerateFieldsOptions,
> = BaseFieldsCaseConverter<
  {
    at: ListFieldAccessor<Path, Options>;
  },
  Options
>;
