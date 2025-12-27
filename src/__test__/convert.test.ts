import { test, expect, describe } from 'vitest';
import { convert } from '../core/convert.js';

describe('convert', () => {
  test('should convert a dictionary to a fields object', () => {
    const fields = convert({ name: 'name', age: 'age' });

    expect(fields).toEqual({
      NAME_FIELD: 'name',
      AGE_FIELD: 'age',
      NAME: 'name',
      AGE: 'age',
    });
  });

  test('should convert a nested dictionary to a fields object ', () => {
    const fields = convert({
      name: 'name',
      age: 'age',
      address: { street: 'street', city: 'city', state: 'state', zip: 'zip' },
    });

    expect(fields).toEqual({
      AGE: 'age',
      NAME: 'name',
      AGE_FIELD: 'age',
      NAME_FIELD: 'name',

      $ADDRESS: {
        KEY: 'address',
        STREET: 'street',
        STREET_FIELD: 'address.street',
        CITY: 'city',
        PATH: 'address',
        CITY_FIELD: 'address.city',
        STATE: 'state',
        STATE_FIELD: 'address.state',
        ZIP: 'zip',
        ZIP_FIELD: 'address.zip',
      },
    });
  });

  test('should convert a list to fields object', () => {
    const fields = convert({
      name: 'name',
      age: 'age',
      address: { street: 'street', city: 'city', state: 'state', zip: 'zip' },
      routes: [
        {
          name: 'name',
          age: 'age',
          innerRoutes: [{ name: 'name', age: 'age' }],
        },
      ],
    });

    expect(fields).toMatchObject({
      AGE: 'age',
      NAME: 'name',
      AGE_FIELD: 'age',
      NAME_FIELD: 'name',
      $ADDRESS: {
        KEY: 'address',
        STREET: 'street',
        STREET_FIELD: 'address.street',
        CITY: 'city',
        CITY_FIELD: 'address.city',
        STATE: 'state',
        STATE_FIELD: 'address.state',
        ZIP: 'zip',
        ZIP_FIELD: 'address.zip',
      },
      $ROUTES: {
        KEY: 'routes',
        NAME: 'name',
        AGE: 'age',
        ELEMENT_AT: expect.any(Function),
        NAME_FIELD: expect.any(Function),
        AGE_FIELD: expect.any(Function),
        $INNER_ROUTES: {
          KEY: 'innerRoutes',
          PATH: expect.any(Function),
          NAME: 'name',
          AGE: 'age',
          ELEMENT_AT: expect.any(Function),
          NAME_FIELD: expect.any(Function),
          AGE_FIELD: expect.any(Function),
        },
      },
    });
  });

  test('should convert a inner object of list to fields object', () => {
    const fields = convert({
      routes: [
        {
          places: {
            place1: 'place1',
            place2: 'place2',
          },
        },
      ],
    });

    expect(fields).toMatchObject({
      $ROUTES: {
        KEY: 'routes',
        ELEMENT_AT: expect.any(Function),
        $PLACES: {
          KEY: 'places',
          PATH: expect.any(Function),
          PLACE1: 'place1',
          PLACE2: 'place2',
          AT: expect.any(Function),
          PLACE1_FIELD: expect.any(Function),
          PLACE2_FIELD: expect.any(Function),
        },
      },
    });
  });

  test('should convert empty object', () => {
    const fields = convert({});
    expect(fields).toEqual({});
  });

  test('should convert object with single string field', () => {
    const fields = convert({ name: 'name' });
    expect(fields).toEqual({
      NAME: 'name',
      NAME_FIELD: 'name',
    });
  });

  test('should convert object with camelCase keys', () => {
    const fields = convert({
      firstName: 'firstName',
      lastName: 'lastName',
      userAge: 'userAge',
    });

    expect(fields).toEqual({
      FIRST_NAME: 'firstName',
      FIRST_NAME_FIELD: 'firstName',
      LAST_NAME: 'lastName',
      LAST_NAME_FIELD: 'lastName',
      USER_AGE: 'userAge',
      USER_AGE_FIELD: 'userAge',
    });
  });

  test('should convert object with array at top level', () => {
    const fields = convert([
      {
        id: 'id',
        name: 'name',
      },
    ]);

    expect(fields).toMatchObject({
      ID: 'id',
      NAME: 'name',
      ID_FIELD: expect.any(Function),
      NAME_FIELD: expect.any(Function),
    });

    expect(fields.ID_FIELD()).toBe('.id');
    expect(fields.NAME_FIELD()).toBe('.name');
  });

  test('should convert array with nested arrays (multi-level lists)', () => {
    const fields = convert({
      matrix: [
        [
          {
            value: 'value',
          },
        ],
      ],
    });

    expect(fields).toMatchObject({
      $MATRIX: {
        KEY: 'matrix',
      },
    });

    expect(fields.$MATRIX.KEY).toBe('matrix');
  });

  test('should convert object with nested object containing array', () => {
    const fields = convert({
      user: {
        name: 'name',
        tags: [{ value: 'value' }],
      },
    });

    expect(fields).toMatchObject({
      $USER: {
        KEY: 'user',
        NAME: 'name',
        NAME_FIELD: 'user.name',
        $TAGS: {
          KEY: 'tags',
          VALUE: 'value',
        },
      },
    });

    expect(fields.$USER.$TAGS.PATH).toBe('user.tags');
    expect(typeof fields.$USER.$TAGS.PATH).not.toBe('function');
    expect(fields.$USER.$TAGS.VALUE_FIELD(0)).toBe('user.tags.0.value');
  });

  test('should convert object with multiple arrays at same level', () => {
    const fields = convert({
      users: [{ name: 'name' }],
      posts: [{ title: 'title' }],
      comments: [{ text: 'text' }],
    });

    expect(fields).toMatchObject({
      $USERS: {
        KEY: 'users',
        NAME: 'name',
      },
      $POSTS: {
        KEY: 'posts',
        TITLE: 'title',
      },
      $COMMENTS: {
        KEY: 'comments',
        TEXT: 'text',
      },
    });

    expect(fields.$USERS.KEY).toBe('users');
    expect(fields.$POSTS.KEY).toBe('posts');
    expect(fields.$COMMENTS.KEY).toBe('comments');
    expect(fields.$USERS.NAME_FIELD(0)).toBe('users.0.name');
    expect(fields.$POSTS.TITLE_FIELD(1)).toBe('posts.1.title');
    expect(fields.$COMMENTS.TEXT_FIELD(2)).toBe('comments.2.text');
  });

  test('should convert deeply nested object structure', () => {
    const fields = convert({
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

    expect(fields).toMatchObject({
      $LEVEL1: {
        KEY: 'level1',
        $LEVEL2: {
          KEY: 'level2',
          $LEVEL3: {
            KEY: 'level3',
            $LEVEL4: {
              KEY: 'level4',
              VALUE: 'value',
              VALUE_FIELD: 'level1.level2.level3.level4.value',
            },
          },
        },
      },
    });

    expect(fields.$LEVEL1.$LEVEL2.PATH).toBe('level1.level2');
    expect(fields.$LEVEL1.$LEVEL2.$LEVEL3.PATH).toBe('level1.level2.level3');
    expect(fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.PATH).toBe(
      'level1.level2.level3.level4',
    );

    expect(fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.VALUE_FIELD).toBe(
      'level1.level2.level3.level4.value',
    );
  });

  test('should convert array with deeply nested structure', () => {
    const fields = convert({
      items: [
        {
          metadata: {
            tags: [{ name: 'name', value: 'value' }],
          },
        },
      ],
    });

    expect(fields).toMatchObject({
      $ITEMS: {
        KEY: 'items',
        $METADATA: {
          KEY: 'metadata',
          $TAGS: {
            KEY: 'tags',
            NAME: 'name',
            VALUE: 'value',
          },
        },
      },
    });

    expect(fields.$ITEMS.KEY).toBe('items');
    expect(fields.$ITEMS.$METADATA.$TAGS.NAME_FIELD(0, 1)).toBe(
      'items.0.metadata.tags.1.name',
    );
    expect(fields.$ITEMS.$METADATA.$TAGS.VALUE_FIELD(0, 1)).toBe(
      'items.0.metadata.tags.1.value',
    );
  });

  test('should convert object with array containing objects with arrays', () => {
    const fields = convert({
      orders: [
        {
          id: 'id',
          items: [{ productId: 'productId', quantity: 'quantity' }],
        },
      ],
    });

    expect(fields).toMatchObject({
      $ORDERS: {
        KEY: 'orders',
        ID: 'id',
        $ITEMS: {
          KEY: 'items',
          PRODUCT_ID: 'productId',
          QUANTITY: 'quantity',
        },
      },
    });

    expect(fields.$ORDERS.KEY).toBe('orders');
    expect(fields.$ORDERS.ID_FIELD(0)).toBe('orders.0.id');

    expect(fields.$ORDERS.$ITEMS.ELEMENT_AT(0, 0)).toBe('orders.0.items.0');

    expect(fields.$ORDERS.$ITEMS.PRODUCT_ID_FIELD(0, 1)).toBe(
      'orders.0.items.1.productId',
    );
    expect(fields.$ORDERS.$ITEMS.QUANTITY_FIELD(0, 1)).toBe(
      'orders.0.items.1.quantity',
    );
  });

  test('should convert object with mixed nested objects and arrays', () => {
    const fields = convert({
      user: {
        profile: {
          firstName: 'firstName',
          lastName: 'lastName',
        },
        addresses: [{ street: 'street', city: 'city' }],
        contacts: [
          {
            type: 'type',
            phones: [{ number: 'number' }],
          },
        ],
      },
    });

    expect(fields).toMatchObject({
      $USER: {
        KEY: 'user',
        $PROFILE: {
          KEY: 'profile',
          FIRST_NAME: 'firstName',
          FIRST_NAME_FIELD: 'user.profile.firstName',
          LAST_NAME: 'lastName',
          LAST_NAME_FIELD: 'user.profile.lastName',
        },
        $ADDRESSES: {
          KEY: 'addresses',
          STREET: 'street',
          CITY: 'city',
        },
        $CONTACTS: {
          KEY: 'contacts',
          TYPE: 'type',
          $PHONES: {
            KEY: 'phones',
            NUMBER: 'number',
          },
        },
      },
    });

    expect(fields.$USER.$ADDRESSES.PATH).toBe('user.addresses');
    expect(fields.$USER.$ADDRESSES.STREET_FIELD(0)).toBe(
      'user.addresses.0.street',
    );
    expect(fields.$USER.$ADDRESSES.CITY_FIELD(0)).toBe('user.addresses.0.city');
    expect(fields.$USER.$CONTACTS.KEY).toBe('contacts');
    expect(fields.$USER.$CONTACTS.TYPE_FIELD(0)).toBe('user.contacts.0.type');
    expect(fields.$USER.$CONTACTS.$PHONES.PATH(0)).toBe(
      'user.contacts.0.phones',
    );

    expect(fields.$USER.$CONTACTS.$PHONES.NUMBER_FIELD(0, 1)).toBe(
      'user.contacts.0.phones.1.number',
    );
  });

  test('should convert object with array of primitives (strings)', () => {
    const fields = convert({
      tags: [{ value: 'value' }],
    });

    expect(fields).toMatchObject({
      $TAGS: {
        KEY: 'tags',
        VALUE: 'value',
      },
    });

    expect(fields.$TAGS.KEY).toBe('tags');
    expect(fields.$TAGS.VALUE_FIELD(0)).toBe('tags.0.value');
  });

  test('should convert object with complex multi-level array nesting', () => {
    const fields = convert({
      data: [
        {
          rows: [
            {
              cells: [{ content: 'content' }],
            },
          ],
        },
      ],
    });

    expect(fields).toMatchObject({
      $DATA: {
        KEY: 'data',
        $ROWS: {
          KEY: 'rows',
          $CELLS: {
            KEY: 'cells',
            CONTENT: 'content',
          },
        },
      },
    });

    expect(fields.$DATA.KEY).toBe('data');

    expect(fields.$DATA.$ROWS.PATH(0)).toBe('data.0.rows');

    expect(fields.$DATA.$ROWS.$CELLS.PATH(0, 1)).toBe('data.0.rows.1.cells');
    expect(fields.$DATA.$ROWS.$CELLS.CONTENT_FIELD(0, 1, 2)).toBe(
      'data.0.rows.1.cells.2.content',
    );
  });

  test('should convert object with nested path structure', () => {
    const fields = convert({
      api: {
        endpoints: [
          {
            method: 'method',
            paths: 'paths',
            params: [{ name: 'name' }],
          },
        ],
      },
    });

    expect(fields).toMatchObject({
      $API: {
        KEY: 'api',
        $ENDPOINTS: {
          KEY: 'endpoints',
          METHOD: 'method',
          $PARAMS: {
            KEY: 'params',
            NAME: 'name',
          },
        },
      },
    });

    expect(fields.$API.$ENDPOINTS).toHaveProperty('PATH');
    expect(fields.$API.$ENDPOINTS.PATH).toBeDefined();

    expect(fields.$API.$ENDPOINTS.PATH).toBe('api.endpoints');
    expect(fields.$API.$ENDPOINTS.METHOD_FIELD(0)).toBe(
      'api.endpoints.0.method',
    );
    expect(fields.$API.$ENDPOINTS.PATHS_FIELD(0)).toBe('api.endpoints.0.paths');

    expect(fields.$API.$ENDPOINTS.$PARAMS.PATH(0)).toBe(
      'api.endpoints.0.params',
    );

    expect(fields.$API.$ENDPOINTS.$PARAMS.NAME_FIELD(0, 1)).toBe(
      'api.endpoints.0.params.1.name',
    );
  });

  test('should have ELEMENT_AT method for array fields', () => {
    const fields = convert({
      users: [{ name: 'name', email: 'email' }],
    });

    expect(fields.$USERS).toHaveProperty('ELEMENT_AT');
    expect(typeof fields.$USERS.ELEMENT_AT).toBe('function');
    expect(fields.$USERS.ELEMENT_AT(0)).toBe('users.0');
    expect(fields.$USERS.ELEMENT_AT(5)).toBe('users.5');
    expect(fields.$USERS.ELEMENT_AT(10)).toBe('users.10');
  });

  test('should have ELEMENT_AT method for nested array fields', () => {
    const fields = convert({
      orders: [
        {
          items: [{ productId: 'productId', quantity: 'quantity' }],
        },
      ],
    });

    expect(fields.$ORDERS.$ITEMS).toHaveProperty('ELEMENT_AT');
    expect(typeof fields.$ORDERS.$ITEMS.ELEMENT_AT).toBe('function');
    expect(fields.$ORDERS.$ITEMS.ELEMENT_AT(0, 2)).toBe('orders.0.items.2');
    expect(fields.$ORDERS.$ITEMS.ELEMENT_AT(1, 5)).toBe('orders.1.items.5');
  });

  test('should have ELEMENT_AT method for deeply nested arrays', () => {
    const fields = convert({
      data: [
        {
          rows: [
            {
              cells: [{ content: 'content' }],
            },
          ],
        },
      ],
    });

    expect(fields.$DATA.$ROWS.$CELLS).toHaveProperty('ELEMENT_AT');
    expect(typeof fields.$DATA.$ROWS.$CELLS.ELEMENT_AT).toBe('function');
    expect(fields.$DATA.$ROWS.$CELLS.ELEMENT_AT(0, 1, 2)).toBe(
      'data.0.rows.1.cells.2',
    );
    expect(fields.$DATA.$ROWS.$CELLS.ELEMENT_AT(5, 10, 15)).toBe(
      'data.5.rows.10.cells.15',
    );
  });

  test('should have AT method for nested objects inside arrays', () => {
    const fields = convert({
      users: [
        {
          profile: {
            firstName: 'firstName',
            lastName: 'lastName',
          },
        },
      ],
    });

    expect(fields.$USERS.$PROFILE).toHaveProperty('AT');
    expect(typeof fields.$USERS.$PROFILE.AT).toBe('function');
    expect(fields.$USERS.$PROFILE.AT(0)).toBe('users.0.profile');
    expect(fields.$USERS.$PROFILE.AT(5)).toBe('users.5.profile');
  });

  test('should have AT method for deeply nested objects inside arrays', () => {
    const fields = convert({
      orders: [
        {
          customer: {
            address: {
              street: 'street',
              city: 'city',
            },
          },
        },
      ],
    });

    expect(fields.$ORDERS.$CUSTOMER.$ADDRESS).toHaveProperty('AT');
    expect(typeof fields.$ORDERS.$CUSTOMER.$ADDRESS.AT).toBe('function');
    expect(fields.$ORDERS.$CUSTOMER.$ADDRESS.AT(0)).toBe(
      'orders.0.customer.address',
    );
    expect(fields.$ORDERS.$CUSTOMER.$ADDRESS.AT(3)).toBe(
      'orders.3.customer.address',
    );
  });

  test('should have AT method for nested objects inside multiple levels of arrays', () => {
    const fields = convert({
      data: [
        {
          metadata: {
            tags: [{ name: 'name', value: 'value' }],
          },
        },
      ],
    });

    expect(fields.$DATA.$METADATA).toHaveProperty('AT');
    expect(typeof fields.$DATA.$METADATA.AT).toBe('function');
    expect(fields.$DATA.$METADATA.AT(0)).toBe('data.0.metadata');
    expect(fields.$DATA.$METADATA.AT(2)).toBe('data.2.metadata');
  });

  test('should not have AT method for top-level nested objects (not in arrays)', () => {
    const fields = convert({
      user: {
        profile: {
          firstName: 'firstName',
          lastName: 'lastName',
        },
      },
    });

    expect(fields.$USER.$PROFILE).not.toHaveProperty('AT');
  });

  test('should have ELEMENT_AT for arrays nested inside arrays', () => {
    const fields = convert({
      users: [
        {
          name: 'name',
          addresses: [{ street: 'street', city: 'city' }],
        },
      ],
    });

    expect(fields.$USERS.$ADDRESSES).toHaveProperty('ELEMENT_AT');
    expect(fields.$USERS.$ADDRESSES.ELEMENT_AT(0, 1)).toBe(
      'users.0.addresses.1',
    );
  });

  test('should use ELEMENT_AT and AT together for complex nested arrays', () => {
    const fields = convert({
      orders: [
        {
          customer: {
            name: 'name',
          },
          items: [{ productId: 'productId' }],
        },
      ],
    });

    expect(fields.$ORDERS.$ITEMS.ELEMENT_AT(0, 2)).toBe('orders.0.items.2');
    expect(fields.$ORDERS.$CUSTOMER.AT(0)).toBe('orders.0.customer');
    expect(fields.$ORDERS.$CUSTOMER.AT(5)).toBe('orders.5.customer');
  });

  test('should throw error if reserved key is used', () => {
    expect(() =>
      convert({
        key: 'key',
      }),
    ).toThrow('Error: "key" is a reserved key and cannot be used');

    expect(() =>
      convert({
        path: 'path',
      }),
    ).toThrow('Error: "path" is a reserved key and cannot be used');

    expect(() =>
      convert({
        elementAt: 'elementAt',
      }),
    ).toThrow(
      'Error: "elementAt" is a reserved key and cannot be used as a field name',
    );

    expect(() =>
      convert({
        at: 'at',
      }),
    ).toThrow(
      'Error: "at" is a reserved key and cannot be used as a field name',
    );
  });
});
