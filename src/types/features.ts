import type { ListFieldAccessor } from './accessors';

export type FeatureFieldsForArrayFields<Path extends string> = {
  ELEMENT_AT: ListFieldAccessor<`${Path}.${number}`>;
};

export type FeatureFieldsForArraySubFields<Path extends string> = {
  AT: ListFieldAccessor<Path>;
};
