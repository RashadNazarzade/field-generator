import { expectTypeOf } from 'expect-type';
import { test, describe } from 'vitest';

import { generateFields } from '../../index.js';

describe('generateFields', () => {
  test('should generate name of fields with correct types', () => {
    const fields = generateFields({
      name: 'name',
      age: 'age',
    });

    expectTypeOf(fields.AGE).toEqualTypeOf<'age'>();
    expectTypeOf(fields.NAME).toEqualTypeOf<'name'>();
  });

  test('should generate object field with correct types', () => {
    const fields = generateFields({
      address: {
        street: 'street_name',
        city: 'city_name',
      },
    });

    expectTypeOf(
      fields.$ADDRESS.CITY_FIELD,
    ).toEqualTypeOf<'address.city_name'>();
    expectTypeOf(
      fields.$ADDRESS.STREET_FIELD,
    ).toEqualTypeOf<'address.street_name'>();
    expectTypeOf(fields.$ADDRESS.CITY).toEqualTypeOf<'city_name'>();
    expectTypeOf(fields.$ADDRESS.STREET).toEqualTypeOf<'street_name'>();
    expectTypeOf(fields.$ADDRESS.KEY).toEqualTypeOf<'address'>();
    expectTypeOf(fields.$ADDRESS.PATH).toEqualTypeOf<'address'>();
  });

  test('should generate list field with correct types', () => {
    const fields = generateFields({
      users: [{ name: 'name_field', age: 'age_field' }],
    });

    expectTypeOf(fields.$USERS.AGE).toEqualTypeOf<'age_field'>();
    expectTypeOf(fields.$USERS.NAME).toEqualTypeOf<'name_field'>();
    expectTypeOf(
      fields.$USERS.AGE_FIELD(0),
    ).toEqualTypeOf<'users.0.age_field'>();
    expectTypeOf(
      fields.$USERS.NAME_FIELD(1),
    ).toEqualTypeOf<'users.1.name_field'>();
    expectTypeOf(fields.$USERS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.AGE_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.NAME_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.AGE_FIELD).parameters.toEqualTypeOf<[number]>();

    expectTypeOf(fields.$USERS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USERS.ELEMENT_AT).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.ELEMENT_AT(0)).toEqualTypeOf<'users.0'>();
  });

  test('should generate nested list field with correct types', () => {
    const fields = generateFields({
      users: [
        {
          name: 'name_field',
          age: 'age_field',
          addresses: [
            {
              street: 'street_field',
              city: 'city_field',
            },
          ],
        },
      ],
    });

    expectTypeOf(
      fields.$USERS.$ADDRESSES.STREET,
    ).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USERS.$ADDRESSES.CITY).toEqualTypeOf<'city_field'>();
    expectTypeOf(fields.$USERS.$ADDRESSES.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.$ADDRESSES.CITY_FIELD).toBeFunction();
    expectTypeOf(
      fields.$USERS.$ADDRESSES.STREET_FIELD,
    ).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(fields.$USERS.$ADDRESSES.CITY_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(fields.$USERS.$ADDRESSES.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USERS.$ADDRESSES.ELEMENT_AT).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$USERS.$ADDRESSES.ELEMENT_AT(0, 12),
    ).toEqualTypeOf<'users.0.addresses.12'>();
  });

  test('should generate nested object field with correct types', () => {
    const fields = generateFields({
      user: {
        name: 'name_field',
        age: 'age_field',

        location: {
          street: 'street_field',
          city: 'city_field',
        },
      },
    });

    expectTypeOf(fields.$USER.NAME).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.$USER.AGE).toEqualTypeOf<'age_field'>();
    expectTypeOf(fields.$USER.$LOCATION.STREET).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USER.$LOCATION.CITY).toEqualTypeOf<'city_field'>();
    expectTypeOf(
      fields.$USER.$LOCATION.STREET_FIELD,
    ).toEqualTypeOf<'user.location.street_field'>();
    expectTypeOf(
      fields.$USER.$LOCATION.CITY_FIELD,
    ).toEqualTypeOf<'user.location.city_field'>();
    expectTypeOf(fields.$USER.$LOCATION.KEY).toEqualTypeOf<'location'>();
    expectTypeOf(fields.$USER.$LOCATION.PATH).toEqualTypeOf<'user.location'>();
  });

  test('should generate nested object or array field and extra fields with correct types and methods', () => {
    const fields = generateFields({
      user: {
        name: 'name_field',
        age: 'age_field',
        locations: [
          {
            street: 'street_field',
            city: 'city_field',
            address: {
              street: 'street_field',
              city: 'city_field',
            },
          },
        ],
      },
      users: [
        {
          name: 'name_field',
          age: 'age_field',
          locations: [
            {
              street: 'street_field',
              city: 'city_field',
              address: {
                street: 'street_field',
                city: 'city_field',

                tags: [
                  {
                    name: 'name_field',

                    oop: {
                      name: 'name_field',
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    // User object fields

    expectTypeOf(fields.$USER.NAME).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.$USER.AGE).toEqualTypeOf<'age_field'>();
    expectTypeOf(fields.$USER.NAME_FIELD).toEqualTypeOf<'user.name_field'>();
    expectTypeOf(fields.$USER.AGE_FIELD).toEqualTypeOf<'user.age_field'>();

    expectTypeOf(fields.$USER.$LOCATIONS.KEY).toEqualTypeOf<'locations'>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.PATH,
    ).toEqualTypeOf<'user.locations'>();

    expectTypeOf(fields.$USER.$LOCATIONS).not.toHaveProperty('AT');

    expectTypeOf(fields.$USER.$LOCATIONS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.ELEMENT_AT).parameters.toEqualTypeOf<
      [number]
    >();
    expectTypeOf(
      fields.$USER.$LOCATIONS.ELEMENT_AT(12),
    ).toEqualTypeOf<'user.locations.12'>();

    expectTypeOf(fields.$USER.$LOCATIONS.CITY).toEqualTypeOf<'city_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.CITY_FIELD).parameters.toEqualTypeOf<
      [number]
    >();
    expectTypeOf(
      fields.$USER.$LOCATIONS.CITY_FIELD(36),
    ).toEqualTypeOf<'user.locations.36.city_field'>();

    expectTypeOf(
      fields.$USER.$LOCATIONS.STREET,
    ).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.STREET_FIELD).parameters.toEqualTypeOf<
      [number]
    >();
    expectTypeOf(
      fields.$USER.$LOCATIONS.STREET_FIELD(12),
    ).toEqualTypeOf<'user.locations.12.street_field'>();

    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.KEY,
    ).toEqualTypeOf<'address'>();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.PATH).toBeFunction();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.PATH,
    ).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.PATH(12),
    ).toEqualTypeOf<'user.locations.12.address'>();

    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.CITY,
    ).toEqualTypeOf<'city_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.CITY_FIELD).toBeFunction();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.CITY_FIELD,
    ).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.CITY_FIELD(12),
    ).toEqualTypeOf<'user.locations.12.address.city_field'>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.STREET,
    ).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.STREET_FIELD).toBeFunction();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.STREET_FIELD,
    ).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.STREET_FIELD(12),
    ).toEqualTypeOf<'user.locations.12.address.street_field'>();

    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS).toHaveProperty('AT');
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.AT).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.AT).parameters.toEqualTypeOf<
      [number]
    >();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.AT(12),
    ).toEqualTypeOf<'user.locations.12.address'>();

    // Users list fields

    expectTypeOf(fields.$USERS.NAME).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.$USERS.AGE).toEqualTypeOf<'age_field'>();
    expectTypeOf(fields.$USERS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.NAME_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USERS.NAME_FIELD(12),
    ).toEqualTypeOf<'users.12.name_field'>();
    expectTypeOf(fields.$USERS.AGE_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.AGE_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USERS.AGE_FIELD(12),
    ).toEqualTypeOf<'users.12.age_field'>();
    expectTypeOf(fields.$USERS.KEY).toEqualTypeOf<'users'>();
    expectTypeOf(fields.$USERS.PATH).toEqualTypeOf<'users'>();

    expectTypeOf(fields.$USERS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USERS.ELEMENT_AT).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.ELEMENT_AT(12)).toEqualTypeOf<'users.12'>();

    expectTypeOf(fields.$USERS.$LOCATIONS.KEY).toEqualTypeOf<'locations'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.PATH).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.PATH).parameters.toEqualTypeOf<
      [number]
    >();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.PATH(12),
    ).toEqualTypeOf<'users.12.locations'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.CITY).toEqualTypeOf<'city_field'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.CITY_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.CITY_FIELD(12, 36),
    ).toEqualTypeOf<'users.12.locations.36.city_field'>();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.STREET,
    ).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.STREET_FIELD).toBeFunction();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.STREET_FIELD,
    ).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.STREET_FIELD(12, 36),
    ).toEqualTypeOf<'users.12.locations.36.street_field'>();
    expectTypeOf(fields.$USERS.$LOCATIONS).toHaveProperty('ELEMENT_AT');
    expectTypeOf(fields.$USERS.$LOCATIONS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.ELEMENT_AT).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.ELEMENT_AT(12, 36),
    ).toEqualTypeOf<'users.12.locations.36'>();
    expectTypeOf(fields.$USERS.$LOCATIONS).not.toHaveProperty('AT');

    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS).not.toHaveProperty(
      'ELEMENT_AT',
    );

    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS).toHaveProperty('AT');
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.AT).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.AT).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.AT(12, 36),
    ).toEqualTypeOf<'users.12.locations.36.address'>();

    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.KEY,
    ).toEqualTypeOf<'address'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.PATH).toBeFunction();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.PATH,
    ).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.PATH(12, 36),
    ).toEqualTypeOf<'users.12.locations.36.address'>();

    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP,
    ).not.toHaveProperty('ELEMENT_AT');
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP).toHaveProperty(
      'AT',
    );
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.AT,
    ).toBeFunction();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.AT,
    ).parameters.toEqualTypeOf<[number, number, number]>();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.AT(12, 36, 112),
    ).toEqualTypeOf<'users.12.locations.36.address.tags.112.oop'>();

    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.NAME_FIELD,
    ).toBeFunction();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.NAME_FIELD,
    ).parameters.toEqualTypeOf<[number, number, number]>();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.NAME_FIELD(12, 36, 112),
    ).toEqualTypeOf<'users.12.locations.36.address.tags.112.oop.name_field'>();
  });
});
