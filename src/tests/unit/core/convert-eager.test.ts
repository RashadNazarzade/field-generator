import { expectTypeOf } from 'expect-type';
import { describe, expect, test } from 'vitest';

import { generateFieldsEager } from '@/index';

describe('convertEager', () => {
  test('should convert a dictionary to a fields object', () => {
    const fields = generateFieldsEager({ name: 'name', age: 'age' });
    expect(fields).toBeDefined();
    expect(fields).toMatchObject({
      NAME: 'name',
      AGE: 'age',
      NAME_FIELD: 'name',
      AGE_FIELD: 'age',
    });

    expectTypeOf(fields).toBeObject();
    expectTypeOf(fields.NAME).toBeString();
    expectTypeOf(fields.AGE).toBeString();
    expectTypeOf(fields.NAME_FIELD).toBeString();
    expectTypeOf(fields.AGE_FIELD).toBeString();
  });

  test('should convert a nested dictionary to a fields object', () => {
    const fields = generateFieldsEager({
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

    expectTypeOf(fields.NAME).toBeString();
    expectTypeOf(fields.AGE).toBeString();
    expectTypeOf(fields.$ADDRESS.STREET).toBeString();
    expectTypeOf(fields.$ADDRESS.CITY).toBeString();
    expectTypeOf(fields.$ADDRESS.STREET_FIELD).toBeString();
    expectTypeOf(fields.$ADDRESS.CITY_FIELD).toBeString();
  });

  test('should handle empty object', () => {
    const fields = generateFieldsEager({});

    expect(fields).toBeDefined();
    expect(fields).toEqual({});
    expectTypeOf(fields).toBeObject();
  });

  test('should handle single property', () => {
    const fields = generateFieldsEager({ email: 'email' });

    expect(fields).toBeDefined();
    expect(fields).toMatchObject({
      EMAIL: 'email',
      EMAIL_FIELD: 'email',
    });

    expectTypeOf(fields.EMAIL).toBeString();
    expectTypeOf(fields.EMAIL_FIELD).toBeString();
  });

  test('should convert 4 layer nested dictionary to a fields object', () => {
    const fields = generateFieldsEager({
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

    expectTypeOf(fields.AGE).toBeString();
    expectTypeOf(fields.NAME).toBeString();
    expectTypeOf(fields.$ADDRESS.STREET).toBeString();
    expectTypeOf(fields.$ADDRESS.CITY).toBeString();
    expectTypeOf(fields.$ADDRESS.$TAGS.VALUE).toBeString();
    expectTypeOf(fields.$ADDRESS.$TAGS.NAME).toBeString();
    expectTypeOf(fields.$ADDRESS.$TAGS.$OOP.VALUE).toBeString();
  });

  test('should convert list fields to a fields object', () => {
    const fields = generateFieldsEager({
      name: 'name',
      age: 'age',
      addresses: [{ street: 'street', city: 'city' }],
    });

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

    expectTypeOf(fields.NAME).toBeString();
    expectTypeOf(fields.AGE).toBeString();
    expectTypeOf(fields.$ADDRESSES.STREET).toBeString();
    expectTypeOf(fields.$ADDRESSES.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.ELEMENT_AT).toBeFunction();
  });

  test('should convert 3 layer nested list fields to a fields object', () => {
    const fields = generateFieldsEager({
      name: 'name',
      age: 'age',
      addresses: [
        {
          street: 'street',
          city: 'city',
          tags: [{ value: 'value', name: 'name', oop: [{ value: 'value' }] }],
        },
      ],
    });

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
    expectTypeOf(fields.$ADDRESSES.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.$OOP.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$TAGS.$OOP.ELEMENT_AT).toBeFunction();
  });

  test('should convert nested list fields and object fields to a fields object', () => {
    const fields = generateFieldsEager({
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
    });

    expect(fields).toBeDefined();
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
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MAX_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.MIN_FIELD).toBeFunction();
    expectTypeOf(fields.$ADDRESSES.$DOWN.$UPPER.$OOP.$RULES.AT).toBeFunction();
  });

  test('should handle deeply nested objects', () => {
    const fields = generateFieldsEager({
      level1: {
        level2: {
          level3: {
            level4: {
              value: 'value',
            },
          },
        },
      },
    });

    expect(fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.VALUE_FIELD).toBe(
      'level1.level2.level3.level4.value',
    );

    expectTypeOf(fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.VALUE_FIELD).toBeString();
  });

  test('should handle multiple sibling lists', () => {
    const fields = generateFieldsEager({
      users: [{ name: 'name', age: 'age' }],
      products: [{ title: 'title', price: 'price' }],
    });

    expect(fields.$USERS.NAME_FIELD(0)).toBe('users.0.name');
    expect(fields.$USERS.AGE_FIELD(1)).toBe('users.1.age');
    expect(fields.$PRODUCTS.TITLE_FIELD(0)).toBe('products.0.title');
    expect(fields.$PRODUCTS.PRICE_FIELD(2)).toBe('products.2.price');

    expectTypeOf(fields.$USERS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.AGE_FIELD).toBeFunction();
    expectTypeOf(fields.$PRODUCTS.TITLE_FIELD).toBeFunction();
    expectTypeOf(fields.$PRODUCTS.PRICE_FIELD).toBeFunction();
  });

  test('should handle object with list containing nested objects and lists', () => {
    const fields = generateFieldsEager({
      company: {
        departments: [
          {
            name: 'name',
            employees: [{ id: 'id', role: 'role' }],
          },
        ],
      },
    });

    expect(fields.$COMPANY.$DEPARTMENTS.NAME_FIELD(0)).toBe('company.departments.0.name');
    expect(fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ID_FIELD(0, 1)).toBe(
      'company.departments.0.employees.1.id',
    );
    expect(fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ROLE_FIELD(2, 3)).toBe(
      'company.departments.2.employees.3.role',
    );

    expectTypeOf(fields.$COMPANY.$DEPARTMENTS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ID_FIELD).toBeFunction();
    expectTypeOf(fields.$COMPANY.$DEPARTMENTS.$EMPLOYEES.ROLE_FIELD).toBeFunction();
  });

  test('should handle alternating list and object nesting', () => {
    const fields = generateFieldsEager({
      items: [
        {
          meta: {
            tags: [{ label: 'label' }],
          },
        },
      ],
    });

    expect(fields.$ITEMS.$META.$TAGS.LABEL_FIELD(0, 1)).toBe('items.0.meta.tags.1.label');
    expect(fields.$ITEMS.$META.$TAGS.ELEMENT_AT(2, 3)).toBe('items.2.meta.tags.3');
    expect(fields.$ITEMS.$META.AT(1)).toBe('items.1.meta');

    expectTypeOf(fields.$ITEMS.$META.$TAGS.LABEL_FIELD).toBeFunction();
    expectTypeOf(fields.$ITEMS.$META.$TAGS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$ITEMS.$META.AT).toBeFunction();
  });

  test('should handle complex real-world structure', () => {
    const fields = generateFieldsEager({
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
    });

    expect(fields.$USER.$PROFILE.NAME_FIELD).toBe('user.profile.name');
    expect(fields.$USER.$PROFILE.$SETTINGS.THEME_FIELD).toBe('user.profile.settings.theme');
    expect(fields.$USER.$PROFILE.$SETTINGS.$NOTIFICATIONS.TYPE_FIELD(0)).toBe(
      'user.profile.settings.notifications.0.type',
    );
    expect(fields.$USER.$POSTS.TITLE_FIELD(1)).toBe('user.posts.1.title');
    expect(fields.$USER.$POSTS.$COMMENTS.TEXT_FIELD(2, 3)).toBe('user.posts.2.comments.3.text');
    expect(fields.$USER.$POSTS.$COMMENTS.AUTHOR_FIELD(0, 1)).toBe('user.posts.0.comments.1.author');

    expectTypeOf(fields.$USER.$PROFILE.NAME_FIELD).toBeString();
    expectTypeOf(fields.$USER.$PROFILE.$SETTINGS.THEME_FIELD).toBeString();
    expectTypeOf(fields.$USER.$PROFILE.$SETTINGS.$NOTIFICATIONS.TYPE_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$POSTS.TITLE_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$POSTS.$COMMENTS.TEXT_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$POSTS.$COMMENTS.AUTHOR_FIELD).toBeFunction();
  });

  test('should handle object nested inside list at multiple levels', () => {
    const fields = generateFieldsEager({
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
    });

    expect(fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.SKU_FIELD(0, 1)).toBe(
      'orders.0.items.1.product.details.sku',
    );
    expect(fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.PRICE_FIELD(2, 3)).toBe(
      'orders.2.items.3.product.details.price',
    );
    expect(fields.$ORDERS.$ITEMS.$PRODUCT.AT(1, 2)).toBe('orders.1.items.2.product');

    expectTypeOf(fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.SKU_FIELD).toBeFunction();
    expectTypeOf(fields.$ORDERS.$ITEMS.$PRODUCT.$DETAILS.PRICE_FIELD).toBeFunction();
    expectTypeOf(fields.$ORDERS.$ITEMS.$PRODUCT.AT).toBeFunction();
  });
});
