import type { ReservedKeys, Dict, DictNestedValues } from './base';

export type ValidateDictSchema<Schema extends Dict | DictNestedValues> = {
    [Key in keyof Schema]: Schema[Key] extends DictNestedValues
      ? ValidateDictSchema<Schema[Key]>
      : Key extends ReservedKeys
        ? `Error: "${Key & string}" is a reserved key and cannot be used`
        : Schema[Key];
  };