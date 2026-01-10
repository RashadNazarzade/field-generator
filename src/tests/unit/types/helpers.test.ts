import { expectTypeOf } from 'expect-type';
import { describe, test } from 'vitest';

import type {
  ExceptNumber,
  HasArrayElements,
  IsListedBefore,
  SubArrayElement,
  toFieldName,
  toObjectFieldName,
  toPropertyName,
  whenDictArrayValue,
  whenDictNestedValues,
  whenDictObjectValue,
  whenIsEmptyString,
  whenListed,
  whenString,
} from '@/types/helpers';

describe('Type Helpers', () => {
  describe('toPropertyName', () => {
    test('should convert to uppercase snake case property name', () => {
      expectTypeOf<
        toPropertyName<'userName', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'USER_NAME'>();
      expectTypeOf<
        toPropertyName<'firstName', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'FIRST_NAME'>();
      expectTypeOf<
        toPropertyName<'age', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'AGE'>();
      expectTypeOf<
        toPropertyName<'emailAddress', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'EMAIL_ADDRESS'>();
    });
  });

  describe('toFieldName', () => {
    test('should convert to field name with _FIELD suffix', () => {
      expectTypeOf<
        toFieldName<'userName', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'USER_NAME_FIELD'>();
      expectTypeOf<
        toFieldName<'age', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'AGE_FIELD'>();
      expectTypeOf<
        toFieldName<'email', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'EMAIL_FIELD'>();
    });
  });

  describe('toObjectFieldName', () => {
    test('should convert to object field name with $ prefix', () => {
      expectTypeOf<
        toObjectFieldName<'address', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'$ADDRESS'>();
      expectTypeOf<
        toObjectFieldName<'users', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'$USERS'>();
      expectTypeOf<
        toObjectFieldName<'userProfile', { fieldNameCaseFormat: 'upper-snake-case' }>
      >().toEqualTypeOf<'$USER_PROFILE'>();
    });
  });

  describe('IsListedBefore', () => {
    test('should detect if path contains array indices', () => {
      expectTypeOf<IsListedBefore<'users.0'>>().toEqualTypeOf<true>();
      expectTypeOf<IsListedBefore<'users.0.name'>>().toEqualTypeOf<true>();
      expectTypeOf<IsListedBefore<'users.0.posts.1'>>().toEqualTypeOf<true>();
      expectTypeOf<IsListedBefore<'users'>>().toEqualTypeOf<false>();
      expectTypeOf<IsListedBefore<'user.profile.name'>>().toEqualTypeOf<false>();
    });
  });

  describe('whenString', () => {
    test('should return result when value is string', () => {
      expectTypeOf<whenString<string, 'SUCCESS'>>().toEqualTypeOf<'SUCCESS'>();
      expectTypeOf<whenString<'literal', 'SUCCESS'>>().toEqualTypeOf<'SUCCESS'>();
    });

    test('should return never when value is not string', () => {
      expectTypeOf<whenString<number, 'SUCCESS'>>().toEqualTypeOf<never>();
      expectTypeOf<whenString<object, 'SUCCESS'>>().toEqualTypeOf<never>();
      expectTypeOf<whenString<[], 'SUCCESS'>>().toEqualTypeOf<never>();
    });
  });

  describe('whenListed', () => {
    test('should return result when path has indices', () => {
      expectTypeOf<whenListed<'users.0', 'SUCCESS'>>().toEqualTypeOf<'SUCCESS'>();
      expectTypeOf<whenListed<'users.0.posts.1', 'SUCCESS'>>().toEqualTypeOf<'SUCCESS'>();
    });

    test('should return fallback when path has no indices', () => {
      expectTypeOf<whenListed<'users', 'SUCCESS', 'FALLBACK'>>().toEqualTypeOf<'FALLBACK'>();
      expectTypeOf<whenListed<'user.profile', 'SUCCESS', 'FALLBACK'>>().toEqualTypeOf<'FALLBACK'>();
    });

    test('should return never when path has no indices and no fallback', () => {
      expectTypeOf<whenListed<'users', 'SUCCESS'>>().toEqualTypeOf<never>();
    });
  });

  describe('whenIsEmptyString', () => {
    test('should return WhenEmpty for empty string', () => {
      expectTypeOf<whenIsEmptyString<'', 'EMPTY', 'NOT_EMPTY'>>().toEqualTypeOf<'EMPTY'>();
    });

    test('should return NotEmpty for non-empty string', () => {
      expectTypeOf<whenIsEmptyString<'text', 'EMPTY', 'NOT_EMPTY'>>().toEqualTypeOf<'NOT_EMPTY'>();
      expectTypeOf<whenIsEmptyString<'a', 'EMPTY', 'NOT_EMPTY'>>().toEqualTypeOf<'NOT_EMPTY'>();
    });
  });

  describe('whenDictNestedValues', () => {
    test('should return result for nested dict values', () => {
      type NestedObject = { name: string };
      type NestedArray = [{ id: string }];

      expectTypeOf<whenDictNestedValues<NestedObject, 'SUCCESS'>>().toEqualTypeOf<'SUCCESS'>();
      expectTypeOf<whenDictNestedValues<NestedArray, 'SUCCESS'>>().toEqualTypeOf<'SUCCESS'>();
    });

    test('should return fallback for non-nested values', () => {
      expectTypeOf<
        whenDictNestedValues<string, 'SUCCESS', 'FALLBACK'>
      >().toEqualTypeOf<'FALLBACK'>();
    });
  });

  describe('whenDictObjectValue', () => {
    test('should return result for object values', () => {
      type ObjectValue = { name: string; age: string };

      expectTypeOf<whenDictObjectValue<ObjectValue, 'SUCCESS'>>().toEqualTypeOf<'SUCCESS'>();
    });

    test('should not return result for object values', () => {
      type ObjectValue = { name: string; age: number };

      expectTypeOf<
        whenDictObjectValue<ObjectValue, 'SUCCESS', 'FALLBACK'>
      >().toEqualTypeOf<'FALLBACK'>();
    });

    test('should return fallback for non-object values', () => {
      expectTypeOf<
        whenDictObjectValue<string, 'SUCCESS', 'FALLBACK'>
      >().toEqualTypeOf<'FALLBACK'>();
      expectTypeOf<
        whenDictObjectValue<[{ id: string }], 'SUCCESS', 'FALLBACK'>
      >().toEqualTypeOf<'FALLBACK'>();
    });
  });

  describe('whenDictArrayValue', () => {
    test('should return result for array values', () => {
      type ArrayValue = [{ id: string }];

      expectTypeOf<whenDictArrayValue<ArrayValue, 'SUCCESS'>>().toEqualTypeOf<'SUCCESS'>();
    });

    test('should return fallback for non-array values', () => {
      expectTypeOf<whenDictArrayValue<string, 'SUCCESS', 'FALLBACK'>>().toEqualTypeOf<'FALLBACK'>();
      expectTypeOf<
        whenDictArrayValue<{ id: string }, 'SUCCESS', 'FALLBACK'>
      >().toEqualTypeOf<'FALLBACK'>();
    });
  });

  describe('ExceptNumber', () => {
    test('should return never for numeric keys', () => {
      expectTypeOf<ExceptNumber<'0', 'RESULT'>>().toEqualTypeOf<never>();
      expectTypeOf<ExceptNumber<'123', 'RESULT'>>().toEqualTypeOf<never>();
    });

    test('should return result for non-numeric keys', () => {
      expectTypeOf<ExceptNumber<'name', 'RESULT'>>().toEqualTypeOf<'RESULT'>();
      expectTypeOf<ExceptNumber<'user', 'RESULT'>>().toEqualTypeOf<'RESULT'>();
    });
  });

  describe('SubArrayElement', () => {
    test('should extract array element type', () => {
      type ArrayType = [{ id: string; name: string }];

      expectTypeOf<SubArrayElement<ArrayType>>().toEqualTypeOf<{ id: string; name: string }>();
    });

    test('should return never for non-array types', () => {
      expectTypeOf<SubArrayElement<string>>().toEqualTypeOf<never>();
      expectTypeOf<SubArrayElement<{ id: string }>>().toEqualTypeOf<never>();
    });
  });

  describe('HasArrayElements', () => {
    test('should return true for array types', () => {
      type ArrayType = [{ id: string }];

      expectTypeOf<HasArrayElements<ArrayType>>().toEqualTypeOf<true>();
    });

    test('should return false for non-array types', () => {
      expectTypeOf<HasArrayElements<string>>().toEqualTypeOf<false>();
      expectTypeOf<HasArrayElements<{ id: string }>>().toEqualTypeOf<false>();
    });
  });
});
