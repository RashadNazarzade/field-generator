import { expectTypeOf } from 'expect-type';
import { describe, test } from 'vitest';

import type { ValidateDictSchema } from '@/types/validation';

describe('Type Validation', () => {
  describe('ValidateDictSchema', () => {
    test('should pass validation for valid schema', () => {
      type ValidSchema = { name: string; age: string };
      type Result = ValidateDictSchema<ValidSchema>;

      expectTypeOf<Result>().toEqualTypeOf<{
        name: string;
        age: string;
      }>();
    });

    test('should show error for reserved key "key"', () => {
      type InvalidSchema = { key: string };
      type Result = ValidateDictSchema<InvalidSchema>;

      expectTypeOf<Result>().toEqualTypeOf<{
        key: 'Error: "key" is a reserved key and cannot be used';
      }>();
    });

    test('should show error for reserved key "path"', () => {
      type InvalidSchema = { path: string };
      type Result = ValidateDictSchema<InvalidSchema>;

      expectTypeOf<Result>().toEqualTypeOf<{
        path: 'Error: "path" is a reserved key and cannot be used';
      }>();
    });

    test('should show error for reserved key "elementAt"', () => {
      type InvalidSchema = { elementAt: string };
      type Result = ValidateDictSchema<InvalidSchema>;

      expectTypeOf<Result>().toEqualTypeOf<{
        elementAt: 'Error: "elementAt" is a reserved key and cannot be used';
      }>();
    });

    test('should show error for reserved key "at"', () => {
      type InvalidSchema = { at: string };
      type Result = ValidateDictSchema<InvalidSchema>;

      expectTypeOf<Result>().toEqualTypeOf<{
        at: 'Error: "at" is a reserved key and cannot be used';
      }>();
    });

    test('should validate nested objects', () => {
      type NestedSchema = {
        user: {
          name: string;
          profile: {
            bio: string;
          };
        };
      };
      type Result = ValidateDictSchema<NestedSchema>;

      expectTypeOf<Result>().toMatchObjectType<{
        user: {
          name: string;
          profile: {
            bio: string;
          };
        };
      }>();
    });

    test('should show error for reserved key in nested object', () => {
      type InvalidNestedSchema = {
        user: {
          name: string;
          key: string;
        };
      };
      type Result = ValidateDictSchema<InvalidNestedSchema>;

      expectTypeOf<
        Result['user']['key']
      >().toEqualTypeOf<'Error: "key" is a reserved key and cannot be used'>();
    });

    test('should handle arrays with nested objects', () => {
      type ArraySchema = {
        users: [
          {
            name: string;
            email: string;
          },
        ];
      };
      type Result = ValidateDictSchema<ArraySchema>;

      expectTypeOf<Result>().toMatchObjectType<{
        users: [
          {
            name: string;
            email: string;
          },
        ];
      }>();
    });

    test('should show error for reserved key in array element', () => {
      type InvalidArraySchema = {
        users: [
          {
            name: string;
            path: string;
          },
        ];
      };
      type Result = ValidateDictSchema<InvalidArraySchema>;

      expectTypeOf<
        Result['users'][0]['path']
      >().toEqualTypeOf<'Error: "path" is a reserved key and cannot be used'>();
    });

    test('should handle deeply nested validation', () => {
      type DeeplyNestedSchema = {
        company: {
          departments: [
            {
              name: string;
              employees: [
                {
                  id: string;
                  elementAt: string;
                },
              ];
            },
          ];
        };
      };
      type Result = ValidateDictSchema<DeeplyNestedSchema>;

      expectTypeOf<
        Result['company']['departments'][0]['employees'][0]['elementAt']
      >().toEqualTypeOf<'Error: "elementAt" is a reserved key and cannot be used'>();
    });

    test('should pass multiple valid fields', () => {
      type ValidComplexSchema = {
        firstName: string;
        lastName: string;
        email: string;
        address: {
          street: string;
          city: string;
          country: string;
        };
      };
      type Result = ValidateDictSchema<ValidComplexSchema>;

      expectTypeOf<Result>().toMatchObjectType<ValidComplexSchema>();
    });
  });
});
