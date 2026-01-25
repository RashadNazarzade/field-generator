import { describe, expectTypeOf, test } from 'vitest';

import type {
  AddOneToNumber,
  BuildTuple,
  CamelToSnakeCase,
  CountArrayIndices,
} from '@/types/utilities';

describe('Type Utilities', () => {
  describe('CamelToSnakeCase', () => {
    test('should convert camelCase to snake_case', () => {
      expectTypeOf<CamelToSnakeCase<'userName'>>().toEqualTypeOf<'user_name'>();
      expectTypeOf<CamelToSnakeCase<'userId'>>().toEqualTypeOf<'user_id'>();
      expectTypeOf<CamelToSnakeCase<'firstName'>>().toEqualTypeOf<'first_name'>();
      expectTypeOf<CamelToSnakeCase<'addressStreet'>>().toEqualTypeOf<'address_street'>();
    });

    test('should handle single word', () => {
      expectTypeOf<CamelToSnakeCase<'name'>>().toEqualTypeOf<'name'>();
      expectTypeOf<CamelToSnakeCase<'age'>>().toEqualTypeOf<'age'>();
      expectTypeOf<CamelToSnakeCase<'email'>>().toEqualTypeOf<'email'>();
    });

    test('should handle multiple capitals', () => {
      expectTypeOf<CamelToSnakeCase<'userIDNumber'>>().toEqualTypeOf<'user_i_d_number'>();
      expectTypeOf<CamelToSnakeCase<'HTTPRequest'>>().toEqualTypeOf<'h_t_t_p_request'>();
    });

    test('should handle already lowercase', () => {
      expectTypeOf<CamelToSnakeCase<'alreadylower'>>().toEqualTypeOf<'alreadylower'>();
    });

    test('should handle numbers in string', () => {
      expectTypeOf<CamelToSnakeCase<'user123Name'>>().toEqualTypeOf<'user123_name'>();
    });
  });

  describe('BuildTuple', () => {
    test('should build tuple of specified length', () => {
      expectTypeOf<BuildTuple<number, 0>>().toEqualTypeOf<[]>();
      expectTypeOf<BuildTuple<number, 1>>().toEqualTypeOf<[number]>();
      expectTypeOf<BuildTuple<number, 2>>().toEqualTypeOf<[number, number]>();
      expectTypeOf<BuildTuple<number, 3>>().toEqualTypeOf<[number, number, number]>();
      expectTypeOf<BuildTuple<number, 5>>().toEqualTypeOf<
        [number, number, number, number, number]
      >();
    });

    test('should build tuple with different types', () => {
      expectTypeOf<BuildTuple<string, 2>>().toEqualTypeOf<[string, string]>();
      expectTypeOf<BuildTuple<boolean, 3>>().toEqualTypeOf<[boolean, boolean, boolean]>();
    });
  });

  describe('AddOneToNumber', () => {
    test('should increment number types', () => {
      expectTypeOf<AddOneToNumber<0>>().toEqualTypeOf<1>();
      expectTypeOf<AddOneToNumber<1>>().toEqualTypeOf<2>();
      expectTypeOf<AddOneToNumber<2>>().toEqualTypeOf<3>();
      expectTypeOf<AddOneToNumber<5>>().toEqualTypeOf<6>();
      expectTypeOf<AddOneToNumber<10>>().toEqualTypeOf<11>();
    });
  });

  describe('CountArrayIndices', () => {
    test('should count array indices in path', () => {
      expectTypeOf<CountArrayIndices<'users'>>().toEqualTypeOf<0>();
      expectTypeOf<CountArrayIndices<'users.0'>>().toEqualTypeOf<1>();
      expectTypeOf<CountArrayIndices<'users.0.name'>>().toEqualTypeOf<1>();
      expectTypeOf<CountArrayIndices<'users.0.posts.1'>>().toEqualTypeOf<2>();
      expectTypeOf<CountArrayIndices<'users.0.posts.1.comments.2'>>().toEqualTypeOf<3>();
    });

    test('should handle paths without indices', () => {
      expectTypeOf<CountArrayIndices<'user.profile.name'>>().toEqualTypeOf<0>();
      expectTypeOf<CountArrayIndices<'company.address.city'>>().toEqualTypeOf<0>();
    });

    test('should handle complex paths', () => {
      expectTypeOf<CountArrayIndices<'a.0.b.1.c.2.d'>>().toEqualTypeOf<3>();
      expectTypeOf<CountArrayIndices<'orders.5.items.10.details'>>().toEqualTypeOf<2>();
    });
  });
});
