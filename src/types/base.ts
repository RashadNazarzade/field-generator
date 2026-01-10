export type ArrayNumberPattern = `.${number}`;

export type ReservedKeys = 'key' | 'path' | 'elementAt' | 'at';

export type Context = {
  path: string;
};

export type DictObjectValue = { readonly [key: string]: DictValue };
export type DictArrayValue = readonly [{ readonly [key: string]: DictValue }];

export type DictValue = string | DictArrayValue | DictObjectValue;

export type DictNestedValues = DictArrayValue | DictObjectValue;

export type Dict = Record<string, DictValue>;

export type ConvertedField = string | Function | ConvertedFields | undefined;
export type ConvertedFields = {
  [key: string]: ConvertedField;
};

export type TypeGenerateFieldsOptions = {
  listFieldsReturnType?: 'exact' | 'default';
  fieldNameCaseFormat?: 'upper-snake-case' | 'snake-case' | 'no-case';
};

export type GenerateFieldsOptions = TypeGenerateFieldsOptions & {
  lazy?: boolean;
};
