import { expectTypeOf } from 'expect-type';
import { describe, test } from 'vitest';

import type { ListFieldAccessor } from '@/types/accessors';

describe('Type Accessors', () => {
  describe('ListFieldAccessor', () => {
    test('should create accessor for single array index', () => {
      type Accessor = ListFieldAccessor<'users.0.name', { listFieldsReturnType: 'exact' }>;

      expectTypeOf<Accessor>().toBeFunction();
      expectTypeOf<Accessor>().parameters.toEqualTypeOf<[number]>();
      expectTypeOf<ReturnType<Accessor>>().toBeString();

      type Result0 = ReturnType<Accessor>;
      expectTypeOf<Result0>().toEqualTypeOf<`users.${number}.name`>();
    });

    test('should create accessor for double array indices', () => {
      type Accessor = ListFieldAccessor<'users.0.posts.1.title', { listFieldsReturnType: 'exact' }>;

      expectTypeOf<Accessor>().toBeFunction();
      expectTypeOf<Accessor>().parameters.toEqualTypeOf<[number, number]>();
      expectTypeOf<ReturnType<Accessor>>().toBeString();
    });

    test('should create accessor for triple array indices', () => {
      type Accessor = ListFieldAccessor<
        'users.0.posts.1.comments.2.text',
        { listFieldsReturnType: 'exact' }
      >;

      expectTypeOf<Accessor>().toBeFunction();
      expectTypeOf<Accessor>().parameters.toEqualTypeOf<[number, number, number]>();
      expectTypeOf<ReturnType<Accessor>>().toBeString();
    });

    test('should handle ELEMENT_AT pattern', () => {
      type Accessor = ListFieldAccessor<'users.0', { listFieldsReturnType: 'default' }>;

      expectTypeOf<Accessor>().toBeFunction();
      expectTypeOf<Accessor>().parameters.toEqualTypeOf<[number]>();
    });

    test('should handle nested ELEMENT_AT pattern', () => {
      type Accessor = ListFieldAccessor<'users.0.posts.1', { listFieldsReturnType: 'default' }>;

      expectTypeOf<Accessor>().toBeFunction();
      expectTypeOf<Accessor>().parameters.toEqualTypeOf<[number, number]>();
    });

    test('should handle AT pattern with nested lists', () => {
      type Accessor = ListFieldAccessor<'users.0.profile', { listFieldsReturnType: 'default' }>;

      expectTypeOf<Accessor>().toBeFunction();
      expectTypeOf<Accessor>().parameters.toEqualTypeOf<[number]>();
    });

    test('should handle complex nested paths', () => {
      type Accessor = ListFieldAccessor<
        'orders.0.items.1.product.details.sku',
        { listFieldsReturnType: 'default' }
      >;

      expectTypeOf<Accessor>().toBeFunction();
      expectTypeOf<Accessor>().parameters.toEqualTypeOf<[number, number]>();
    });

    test('should handle deeply nested arrays', () => {
      type Accessor = ListFieldAccessor<
        'a.0.b.1.c.2.d.3.value',
        { listFieldsReturnType: 'default' }
      >;

      expectTypeOf<Accessor>().toBeFunction();
      expectTypeOf<Accessor>().parameters.toEqualTypeOf<[number, number, number, number]>();
    });
  });
});
