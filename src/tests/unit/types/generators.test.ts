import { expectTypeOf } from 'expect-type';
import { describe, test } from 'vitest';

import type { ListFieldAccessor } from '@/types/accessors';
import type { FieldsFieldGenerator, FieldsGroup, FieldsNameGenerator } from '@/types/generators';

describe('Type Generators', () => {
  describe('FieldsNameGenerator', () => {
    test('should generate name fields for simple object', () => {
      type Schema = { name: string; age: string };
      type Result = FieldsNameGenerator<
        Schema,
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toEqualTypeOf<{
        NAME: string;
        AGE: string;
      }>();
    });

    test('should only generate for string values', () => {
      type Schema = { name: string; address: { city: string } };
      type Result = FieldsNameGenerator<
        Schema,
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toEqualTypeOf<{
        NAME: string;
      }>();

      expectTypeOf<Result>().not.toHaveProperty('ADDRESS');
    });

    test('should handle camelCase keys', () => {
      type Schema = { firstName: string; lastName: string };
      type Result = FieldsNameGenerator<
        Schema,
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toEqualTypeOf<{
        FIRST_NAME: string;
        LAST_NAME: string;
      }>();
    });
  });

  describe('FieldsFieldGenerator', () => {
    test('should generate field accessors for simple object', () => {
      type Schema = { name: string; age: string };
      type Result = FieldsFieldGenerator<
        Schema,
        '',
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toMatchObjectType<{
        NAME_FIELD: string;
        AGE_FIELD: string;
      }>();
    });

    test('should generate with path prefix', () => {
      type Schema = { name: 'name'; age: 'age' };
      type Result = FieldsFieldGenerator<
        Schema,
        'user',
        { listFieldsReturnType: 'exact'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toMatchObjectType<{
        NAME_FIELD: 'user.name';
        AGE_FIELD: 'user.age';
      }>();
    });

    test('should generate functions for listed paths', () => {
      type Schema = { name: 'name'; age: 'age_field' };
      type Result = FieldsFieldGenerator<
        Schema,
        'users.0',
        { listFieldsReturnType: 'exact'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toMatchObjectType<{
        NAME_FIELD: ListFieldAccessor<`users.0.name`, { listFieldsReturnType: 'exact' }>;
        AGE_FIELD: ListFieldAccessor<`users.0.age_field`, { listFieldsReturnType: 'exact' }>;
      }>();
    });

    test('should only generate for string values', () => {
      type Schema = { name: string; address: { city: string } };
      type Result = FieldsFieldGenerator<
        Schema,
        '',
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toHaveProperty('NAME_FIELD');
      expectTypeOf<Result>().not.toHaveProperty('ADDRESS_FIELD');
    });
  });

  describe('FieldsGroup', () => {
    test('should include BASE fields (KEY and PATH)', () => {
      type Schema = { name: string };
      type Result = FieldsGroup<Schema, 'user', 'user', { listFieldsReturnType: 'default' }>;

      expectTypeOf<Result>().toHaveProperty('KEY');
      expectTypeOf<Result>().toHaveProperty('PATH');
      expectTypeOf<Result['KEY']>().toEqualTypeOf<'user'>();
    });

    test('should include name fields', () => {
      type Schema = { name: string; age: string };
      type Result = FieldsGroup<
        Schema,
        'user',
        'user',
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toHaveProperty('NAME');
      expectTypeOf<Result>().toHaveProperty('AGE');
    });

    test('should include field accessors', () => {
      type Schema = { name: string; age: string };
      type Result = FieldsGroup<
        Schema,
        'user',
        'user',
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toHaveProperty('NAME_FIELD');
      expectTypeOf<Result>().toHaveProperty('AGE_FIELD');
    });

    test('should handle nested objects', () => {
      type Schema = { name: string; address: { city: string } };
      type Result = FieldsGroup<
        Schema,
        'user',
        'user',
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toHaveProperty('$ADDRESS');
      expectTypeOf<Result>().toHaveProperty('NAME_FIELD');
    });

    test('should handle arrays with ELEMENT_AT', () => {
      type Schema = [{ name: string }];
      type Result = FieldsGroup<
        Schema,
        'users',
        'users',
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toHaveProperty('ELEMENT_AT');
      expectTypeOf<Result>().toHaveProperty('NAME_FIELD');
    });

    test('should handle listed before with AT accessor', () => {
      type Schema = { name: string };
      type Result = FieldsGroup<
        Schema,
        'users.0.profile',
        'profile',
        { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
      >;

      expectTypeOf<Result>().toHaveProperty('AT');
      expectTypeOf<Result>().toHaveProperty('NAME_FIELD');
    });
  });
});
