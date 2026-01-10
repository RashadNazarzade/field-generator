import { expectTypeOf } from 'expect-type';
import { describe, expect, test } from 'vitest';

import { generateFieldsLazy } from '@/index';

describe('convertLazy', () => {
  test('should convert a dictionary to a fields object', () => {
    const fields = generateFieldsLazy({ name: 'name', age: 'age' });

    expect(fields).toBeDefined();
    expect(fields).toEqual({
      NAME_FIELD: 'name',
      AGE_FIELD: 'age',
      NAME: 'name',
      AGE: 'age',
    });

    expectTypeOf(fields).toBeObject();
    expectTypeOf(fields.AGE_FIELD).toBeString();
    expectTypeOf(fields.NAME_FIELD).toBeString();
    expectTypeOf(fields.NAME).toBeString();
    expectTypeOf(fields.AGE).toBeString();
    expectTypeOf(fields.AGE_FIELD).toEqualTypeOf<'age'>();
    expectTypeOf(fields.NAME_FIELD).toEqualTypeOf<'name'>();
    expectTypeOf(fields.NAME).toEqualTypeOf<'name'>();
    expectTypeOf(fields.AGE).toEqualTypeOf<'age'>();
  });

  test('should convert a nested dictionary to a fields object', () => {
    const fields = generateFieldsLazy({
      name: 'name',
      age: 'age',
      address: { street: 'street', city: 'city' },
    });

    expect(fields).toBeDefined();
    expect(fields).toMatchObject({
      NAME: 'name',
      AGE: 'age',
      $ADDRESS: {
        STREET: 'street',
        CITY: 'city',
        STREET_FIELD: 'address.street',
        CITY_FIELD: 'address.city',
      },
    });

    expectTypeOf(fields.AGE_FIELD).toBeString();
    expectTypeOf(fields.NAME_FIELD).toBeString();
    expectTypeOf(fields.NAME).toBeString();
    expectTypeOf(fields.AGE).toBeString();
    expectTypeOf(fields.AGE_FIELD).toEqualTypeOf<'age'>();
    expectTypeOf(fields.NAME_FIELD).toEqualTypeOf<'name'>();
    expectTypeOf(fields.NAME).toEqualTypeOf<'name'>();
    expectTypeOf(fields.AGE).toEqualTypeOf<'age'>();
    expectTypeOf(fields.$ADDRESS.STREET).toEqualTypeOf<'street'>();
    expectTypeOf(fields.$ADDRESS.CITY).toEqualTypeOf<'city'>();
    expectTypeOf(fields.$ADDRESS.STREET_FIELD).toEqualTypeOf<'address.street'>();
    expectTypeOf(fields.$ADDRESS.CITY_FIELD).toEqualTypeOf<'address.city'>();
  });

  test('should convert 4 layer nested dictionary to a fields object', () => {
    const fields = generateFieldsLazy({
      name: 'name',
      age: 'age',
      address: {
        street: 'street',
        city: 'city',
        tags: {
          value: 'value',
          name: 'name',
          oop: {
            value: 'value',
          },
        },
      },
    });

    expect(fields).toBeDefined();
    expect(fields).toMatchObject({
      NAME: 'name',
      AGE: 'age',
      $ADDRESS: {
        STREET: 'street',
        CITY: 'city',
        $TAGS: {
          VALUE: 'value',
          VALUE_FIELD: 'address.tags.value',
          NAME: 'name',
          NAME_FIELD: 'address.tags.name',
          $OOP: {
            VALUE: 'value',
            VALUE_FIELD: 'address.tags.oop.value',
          },
        },
      },
    });

    expectTypeOf(fields.AGE_FIELD).toBeString();
    expectTypeOf(fields.NAME_FIELD).toBeString();
    expectTypeOf(fields.NAME).toBeString();
    expectTypeOf(fields.AGE).toBeString();
    expectTypeOf(fields.AGE_FIELD).toEqualTypeOf<'age'>();
    expectTypeOf(fields.NAME_FIELD).toEqualTypeOf<'name'>();
    expectTypeOf(fields.NAME).toEqualTypeOf<'name'>();
    expectTypeOf(fields.AGE).toEqualTypeOf<'age'>();
    expectTypeOf(fields.$ADDRESS.STREET).toEqualTypeOf<'street'>();
    expectTypeOf(fields.$ADDRESS.CITY).toEqualTypeOf<'city'>();
    expectTypeOf(fields.$ADDRESS.STREET_FIELD).toEqualTypeOf<'address.street'>();
    expectTypeOf(fields.$ADDRESS.CITY_FIELD).toEqualTypeOf<'address.city'>();
    expectTypeOf(fields.$ADDRESS.$TAGS.VALUE).toEqualTypeOf<'value'>();
    expectTypeOf(fields.$ADDRESS.$TAGS.VALUE_FIELD).toEqualTypeOf<'address.tags.value'>();
    expectTypeOf(fields.$ADDRESS.$TAGS.NAME).toEqualTypeOf<'name'>();
    expectTypeOf(fields.$ADDRESS.$TAGS.NAME_FIELD).toEqualTypeOf<'address.tags.name'>();
    expectTypeOf(fields.$ADDRESS.$TAGS.$OOP.VALUE).toEqualTypeOf<'value'>();
    expectTypeOf(fields.$ADDRESS.$TAGS.$OOP.VALUE_FIELD).toEqualTypeOf<'address.tags.oop.value'>();
  });

  test('should convert list fields to a fields object', () => {
    const fields = generateFieldsLazy(
      {
        name: 'name',
        age: 'age',
        addresses: [{ street: 'street', city: 'city' }],
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expect(fields).toBeDefined();
    expect(fields).toMatchObject({
      NAME: 'name',
      AGE: 'age',
      $ADDRESSES: {
        STREET: 'street',
        CITY: 'city',
        STREET_FIELD: expect.any(Function),
        ELEMENT_AT: expect.any(Function),
      },
    });

    Array.from({ length: 10 }).forEach((_, index) => {
      expect(fields.$ADDRESSES.STREET_FIELD(index)).toBe(`addresses.${index}.street`);
      expect(fields.$ADDRESSES.CITY_FIELD(index)).toBe(`addresses.${index}.city`);
      expect(fields.$ADDRESSES.ELEMENT_AT(index)).toBe(`addresses.${index}`);
    });

    expectTypeOf(fields.AGE_FIELD).toBeString();
    expectTypeOf(fields.NAME_FIELD).toBeString();
    expectTypeOf(fields.NAME).toBeString();
    expectTypeOf(fields.AGE).toBeString();
    expectTypeOf(fields.AGE_FIELD).toEqualTypeOf<'age'>();
    expectTypeOf(fields.NAME_FIELD).toEqualTypeOf<'name'>();
    expectTypeOf(fields.NAME).toEqualTypeOf<'name'>();
    expectTypeOf(fields.AGE).toEqualTypeOf<'age'>();
    expectTypeOf(fields.$ADDRESSES.STREET).toEqualTypeOf<'street'>();
    expectTypeOf(fields.$ADDRESSES.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.STREET_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$ADDRESSES.STREET_FIELD(0)).toEqualTypeOf<'addresses.0.street'>();
    expectTypeOf(fields.$ADDRESSES.CITY).toEqualTypeOf<'city'>();
    expectTypeOf(fields.$ADDRESSES.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.CITY_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$ADDRESSES.CITY_FIELD(0)).toEqualTypeOf<'addresses.0.city'>();
    expectTypeOf(fields.$ADDRESSES.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.ELEMENT_AT).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$ADDRESSES.ELEMENT_AT(0)).toEqualTypeOf<'addresses.0'>();
  });

  test('should convert 3 layer nested list fields to a fields object', () => {
    const fields = generateFieldsLazy(
      {
        name: 'name',
        age: 'age',
        addresses: [
          {
            street: 'street',
            city: 'city',
            tags: [{ value: 'value', name: 'name', oop: [{ value: 'value' }] }],
          },
        ],
      },
      { listFieldsReturnType: 'exact' },
    );

    expect(fields).toBeDefined();
    expect(fields).toMatchObject({
      NAME: 'name',
      AGE: 'age',
      $ADDRESSES: {
        STREET: 'street',
        CITY: 'city',
        STREET_FIELD: expect.any(Function),
        ELEMENT_AT: expect.any(Function),
        $TAGS: {
          VALUE: 'value',
          VALUE_FIELD: expect.any(Function),
          ELEMENT_AT: expect.any(Function),
          NAME: 'name',
          NAME_FIELD: expect.any(Function),

          $OOP: {
            VALUE: 'value',
            VALUE_FIELD: expect.any(Function),
            ELEMENT_AT: expect.any(Function),
          },
        },
      },
    });

    expect(fields.$ADDRESSES.STREET_FIELD(0)).toBe('addresses.0.street');
    expect(fields.$ADDRESSES.CITY_FIELD(0)).toBe('addresses.0.city');
    expect(fields.$ADDRESSES.ELEMENT_AT(0)).toBe('addresses.0');
    expect(fields.$ADDRESSES.$TAGS.VALUE_FIELD(0, 2)).toBe('addresses.0.tags.2.value');
    expect(fields.$ADDRESSES.$TAGS.NAME_FIELD(0, 1)).toBe('addresses.0.tags.1.name');
    expect(fields.$ADDRESSES.$TAGS.$OOP.VALUE_FIELD(13, 3, 12)).toBe(
      'addresses.13.tags.3.oop.12.value',
    );
    expect(fields.$ADDRESSES.$TAGS.ELEMENT_AT(0, 2)).toBe('addresses.0.tags.2');
    expect(fields.$ADDRESSES.$TAGS.$OOP.ELEMENT_AT(13, 3, 12)).toBe('addresses.13.tags.3.oop.12');

    expectTypeOf(fields.$ADDRESSES.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.STREET_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$ADDRESSES.STREET_FIELD(0)).toEqualTypeOf<'addresses.0.street'>();
    expectTypeOf(fields.$ADDRESSES.CITY).toEqualTypeOf<'city'>();
    expectTypeOf(fields.$ADDRESSES.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.CITY_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$ADDRESSES.CITY_FIELD(0)).toEqualTypeOf<'addresses.0.city'>();
    expectTypeOf(fields.$ADDRESSES.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.ELEMENT_AT).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$ADDRESSES.ELEMENT_AT(0)).toEqualTypeOf<'addresses.0'>();
    expectTypeOf(fields.$ADDRESSES.$TAGS.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.VALUE_FIELD).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(
      fields.$ADDRESSES.$TAGS.VALUE_FIELD(0, 2),
    ).toEqualTypeOf<'addresses.0.tags.2.value'>();
    expectTypeOf(fields.$ADDRESSES.$TAGS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.NAME_FIELD).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(
      fields.$ADDRESSES.$TAGS.NAME_FIELD(0, 1),
    ).toEqualTypeOf<'addresses.0.tags.1.name'>();
    expectTypeOf(fields.$ADDRESSES.$TAGS.$OOP.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.$OOP.VALUE_FIELD).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$TAGS.$OOP.VALUE_FIELD(13, 3, 12),
    ).toEqualTypeOf<'addresses.13.tags.3.oop.12.value'>();
    expectTypeOf(fields.$ADDRESSES.$TAGS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.ELEMENT_AT).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(fields.$ADDRESSES.$TAGS.ELEMENT_AT(0, 2)).toEqualTypeOf<'addresses.0.tags.2'>();
    expectTypeOf(fields.$ADDRESSES.$TAGS.$OOP.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.$OOP.ELEMENT_AT).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$TAGS.$OOP.ELEMENT_AT(13, 3, 12),
    ).toEqualTypeOf<'addresses.13.tags.3.oop.12'>();
  });

  test('should convert nested list fields and object fields to a fields object', () => {
    const fields = generateFieldsLazy(
      {
        name: 'name',
        age: 'age',
        addresses: [
          {
            street: 'street',
            city: 'city',
            down: {
              names: 'names',
              upper: [
                {
                  value: 'value',
                  name: 'name',
                  oop: [
                    {
                      value: 'value',
                      name: 'name',
                      rules: {
                        max: 'max',
                        min: 'min',
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expect(fields).toBeDefined();
    expect(fields).toMatchObject({
      NAME: 'name',
      AGE: 'age',
      $ADDRESSES: {
        STREET: 'street',
        CITY: 'city',
        STREET_FIELD: expect.any(Function),
        ELEMENT_AT: expect.any(Function),
        $DOWN: {
          NAMES: 'names',
          NAMES_FIELD: expect.any(Function),
          AT: expect.any(Function),
          $UPPER: {
            VALUE: 'value',
            VALUE_FIELD: expect.any(Function),
            ELEMENT_AT: expect.any(Function),
            NAME: 'name',
            NAME_FIELD: expect.any(Function),
            $OOP: {
              VALUE: 'value',
              VALUE_FIELD: expect.any(Function),
              ELEMENT_AT: expect.any(Function),
              $RULES: {
                MAX: 'max',
                MIN: 'min',
                MAX_FIELD: expect.any(Function),
                MIN_FIELD: expect.any(Function),
                AT: expect.any(Function),
              },
            },
          },
        },
      },
    });

    expect(fields.$ADDRESSES.$DOWN.NAMES_FIELD(0)).toBe('addresses.0.down.names');
    expect(fields.$ADDRESSES.$DOWN.$UPPER.VALUE_FIELD(0, 2)).toBe('addresses.0.down.upper.2.value');
    expect(fields.$ADDRESSES.$DOWN.$UPPER.NAME_FIELD(0, 2)).toBe('addresses.0.down.upper.2.name');
    expect(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.VALUE_FIELD(13, 3, 12)).toBe(
      'addresses.13.down.upper.3.oop.12.value',
    );
    expect(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.NAME_FIELD(13, 3, 12)).toBe(
      'addresses.13.down.upper.3.oop.12.name',
    );
    expect(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MAX_FIELD(13, 3, 12)).toBe(
      'addresses.13.down.upper.3.oop.12.rules.max',
    );
    expect(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MIN_FIELD(13, 3, 12)).toBe(
      'addresses.13.down.upper.3.oop.12.rules.min',
    );
    expect(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.AT(13, 3, 12)).toBe(
      'addresses.13.down.upper.3.oop.12.rules',
    );

    expectTypeOf(fields.$ADDRESSES.$DOWN.NAMES_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.NAMES_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$ADDRESSES.$DOWN.NAMES_FIELD(0)).toEqualTypeOf<'addresses.0.down.names'>();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.VALUE_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$DOWN.$UPPER.VALUE_FIELD(0, 2),
    ).toEqualTypeOf<'addresses.0.down.upper.2.value'>();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.NAME_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$DOWN.$UPPER.NAME_FIELD(0, 2),
    ).toEqualTypeOf<'addresses.0.down.upper.2.name'>();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.VALUE_FIELD).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$DOWN.$UPPER.$OOP.VALUE_FIELD(13, 3, 12),
    ).toEqualTypeOf<'addresses.13.down.upper.3.oop.12.value'>();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.NAME_FIELD).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$DOWN.$UPPER.$OOP.NAME_FIELD(13, 3, 12),
    ).toEqualTypeOf<'addresses.13.down.upper.3.oop.12.name'>();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MAX_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MAX_FIELD).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MAX_FIELD(13, 3, 12),
    ).toEqualTypeOf<'addresses.13.down.upper.3.oop.12.rules.max'>();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MIN_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MIN_FIELD).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MIN_FIELD(13, 3, 12),
    ).toEqualTypeOf<'addresses.13.down.upper.3.oop.12.rules.min'>();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.AT).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.AT).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.AT(13, 3, 12),
    ).toEqualTypeOf<'addresses.13.down.upper.3.oop.12.rules'>();
  });

  test('should handle empty object', () => {
    const fields = generateFieldsLazy({});

    expect(fields).toBeDefined();
    expect(fields).toEqual({});
    expectTypeOf(fields).toBeObject();
  });

  test('should handle single property', () => {
    const fields = generateFieldsLazy({ email: 'email' });

    expect(fields).toBeDefined();
    expect(fields).toMatchObject({
      EMAIL: 'email',
      EMAIL_FIELD: 'email',
    });

    expectTypeOf(fields.EMAIL).toEqualTypeOf<'email'>();
    expectTypeOf(fields.EMAIL_FIELD).toEqualTypeOf<'email'>();
  });

  test('should handle deeply nested objects', () => {
    const fields = generateFieldsLazy(
      {
        level1: {
          level2: {
            level3: {
              level4: {
                value: 'value',
              },
            },
          },
        },
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expect(fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.VALUE_FIELD).toBe(
      'level1.level2.level3.level4.value',
    );

    expectTypeOf(
      fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.VALUE_FIELD,
    ).toEqualTypeOf<'level1.level2.level3.level4.value'>();
  });

  test('should handle multiple sibling lists', () => {
    const fields = generateFieldsLazy(
      {
        users: [{ name: 'name', age: 'age' }],
        products: [{ title: 'title', price: 'price' }],
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expect(fields.$USERS.NAME_FIELD(0)).toBe('users.0.name');
    expect(fields.$USERS.AGE_FIELD(1)).toBe('users.1.age');
    expect(fields.$PRODUCTS.TITLE_FIELD(0)).toBe('products.0.title');
    expect(fields.$PRODUCTS.PRICE_FIELD(2)).toBe('products.2.price');

    expectTypeOf(fields.$USERS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.NAME_FIELD(0)).toEqualTypeOf<'users.0.name'>();
    expectTypeOf(fields.$PRODUCTS.TITLE_FIELD).toBeFunction();
    expectTypeOf(fields.$PRODUCTS.PRICE_FIELD(2)).toEqualTypeOf<'products.2.price'>();
  });

  test('should handle object with list containing nested objects and lists', () => {
    const fields = generateFieldsLazy(
      {
        company: {
          departments: [
            {
              name: 'name',
              employees: [{ id: 'id', role: 'role' }],
            },
          ],
        },
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expect(fields.$COMPANY.$DEPARTMENTS.NAME_FIELD(0)).toBe('company.departments.0.name');
    expect(fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ID_FIELD(0, 1)).toBe(
      'company.departments.0.employees.1.id',
    );
    expect(fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ROLE_FIELD(2, 3)).toBe(
      'company.departments.2.employees.3.role',
    );

    expectTypeOf(fields.$COMPANY.$DEPARTMENTS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$COMPANY.$DEPARTMENTS.NAME_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$COMPANY.$DEPARTMENTS.NAME_FIELD(0),
    ).toEqualTypeOf<'company.departments.0.name'>();
    expectTypeOf(fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ID_FIELD).toBeFunction();
    expectTypeOf(fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ID_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ID_FIELD(0, 1),
    ).toEqualTypeOf<'company.departments.0.employees.1.id'>();
  });

  test('should handle alternating list and object nesting', () => {
    const fields = generateFieldsLazy(
      {
        items: [
          {
            meta: {
              tags: [{ label: 'label' }],
            },
          },
        ],
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expect(fields.$ITEMS.$META.$TAGS.LABEL_FIELD(0, 1)).toBe('items.0.meta.tags.1.label');
    expect(fields.$ITEMS.$META.$TAGS.ELEMENT_AT(2, 3)).toBe('items.2.meta.tags.3');
    expect(fields.$ITEMS.$META.AT(1)).toBe('items.1.meta');

    expectTypeOf(fields.$ITEMS.$META.$TAGS.LABEL_FIELD).toBeFunction();
    expectTypeOf(fields.$ITEMS.$META.$TAGS.LABEL_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$ITEMS.$META.$TAGS.LABEL_FIELD(0, 1),
    ).toEqualTypeOf<'items.0.meta.tags.1.label'>();
    expectTypeOf(fields.$ITEMS.$META.$TAGS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$ITEMS.$META.$TAGS.ELEMENT_AT(2, 3)).toEqualTypeOf<'items.2.meta.tags.3'>();
    expectTypeOf(fields.$ITEMS.$META.AT(1)).toEqualTypeOf<'items.1.meta'>();
  });

  test('should handle complex real-world structure', () => {
    const fields = generateFieldsLazy(
      {
        user: {
          profile: {
            name: 'name',
            settings: {
              theme: 'theme',
              notifications: [{ type: 'type', enabled: 'enabled' }],
            },
          },
          posts: [
            {
              title: 'title',
              comments: [{ text: 'text', author: 'author' }],
            },
          ],
        },
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expect(fields.$USER.$PROFILE.NAME_FIELD).toBe('user.profile.name');
    expect(fields.$USER.$PROFILE.$SETTINGS.THEME_FIELD).toBe('user.profile.settings.theme');
    expect(fields.$USER.$PROFILE.$SETTINGS.$NOTIFICATIONS.TYPE_FIELD(0)).toBe(
      'user.profile.settings.notifications.0.type',
    );
    expect(fields.$USER.$POSTS.TITLE_FIELD(1)).toBe('user.posts.1.title');
    expect(fields.$USER.$POSTS.$COMMENTS.TEXT_FIELD(2, 3)).toBe('user.posts.2.comments.3.text');
    expect(fields.$USER.$POSTS.$COMMENTS.AUTHOR_FIELD(0, 1)).toBe('user.posts.0.comments.1.author');

    expectTypeOf(fields.$USER.$PROFILE.NAME_FIELD).toEqualTypeOf<'user.profile.name'>();
    expectTypeOf(
      fields.$USER.$PROFILE.$SETTINGS.THEME_FIELD,
    ).toEqualTypeOf<'user.profile.settings.theme'>();
    expectTypeOf(fields.$USER.$PROFILE.$SETTINGS.$NOTIFICATIONS.TYPE_FIELD).toBeFunction();
    expectTypeOf(
      fields.$USER.$PROFILE.$SETTINGS.$NOTIFICATIONS.TYPE_FIELD(0),
    ).toEqualTypeOf<'user.profile.settings.notifications.0.type'>();
    expectTypeOf(fields.$USER.$POSTS.TITLE_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$POSTS.TITLE_FIELD(1)).toEqualTypeOf<'user.posts.1.title'>();
    expectTypeOf(fields.$USER.$POSTS.$COMMENTS.TEXT_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$POSTS.$COMMENTS.TEXT_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$USER.$POSTS.$COMMENTS.TEXT_FIELD(2, 3),
    ).toEqualTypeOf<'user.posts.2.comments.3.text'>();
  });

  test('should handle object nested inside list at multiple levels', () => {
    const fields = generateFieldsLazy(
      {
        orders: [
          {
            items: [
              {
                product: {
                  details: {
                    sku: 'sku',
                    price: 'price',
                  },
                },
              },
            ],
          },
        ],
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expect(fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.SKU_FIELD(0, 1)).toBe(
      'orders.0.items.1.product.details.sku',
    );
    expect(fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.PRICE_FIELD(2, 3)).toBe(
      'orders.2.items.3.product.details.price',
    );
    expect(fields.$ORDERS.$ITEMS.$PRODUCT.AT(1, 2)).toBe('orders.1.items.2.product');

    expectTypeOf(fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.SKU_FIELD).toBeFunction();
    expectTypeOf(fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.SKU_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.SKU_FIELD(0, 1),
    ).toEqualTypeOf<'orders.0.items.1.product.details.sku'>();
    expectTypeOf(fields.$ORDERS.$ITEMS.$PRODUCT.AT).toBeFunction();
    expectTypeOf(
      fields.$ORDERS.$ITEMS.$PRODUCT.AT(1, 2),
    ).toEqualTypeOf<'orders.1.items.2.product'>();
  });
});
