import { expectTypeOf } from 'expect-type';
import { describe, expect, test } from 'vitest';

import { generateFields } from '@/index';

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

    expectTypeOf(fields.$ADDRESS.CITY_FIELD).toEqualTypeOf<'address.city_name'>();
    expectTypeOf(fields.$ADDRESS.STREET_FIELD).toEqualTypeOf<'address.street_name'>();
    expectTypeOf(fields.$ADDRESS.CITY).toEqualTypeOf<'city_name'>();
    expectTypeOf(fields.$ADDRESS.STREET).toEqualTypeOf<'street_name'>();
    expectTypeOf(fields.$ADDRESS.KEY).toEqualTypeOf<'address'>();
    expectTypeOf(fields.$ADDRESS.PATH).toEqualTypeOf<'address'>();
  });

  test('should generate list field with correct types', () => {
    const fields = generateFields(
      {
        users: [{ name: 'name_field', age: 'age_field' }],
      },
      { listFieldsReturnType: 'exact' },
    );

    expectTypeOf(fields.$USERS.AGE).toEqualTypeOf<'age_field'>();
    expectTypeOf(fields.$USERS.NAME).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.$USERS.AGE_FIELD(0)).toEqualTypeOf<'users.0.age_field'>();
    expectTypeOf(fields.$USERS.NAME_FIELD(1)).toEqualTypeOf<'users.1.name_field'>();
    expectTypeOf(fields.$USERS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.AGE_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.NAME_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.AGE_FIELD).parameters.toEqualTypeOf<[number]>();

    expectTypeOf(fields.$USERS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USERS.ELEMENT_AT).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.ELEMENT_AT(0)).toEqualTypeOf<'users.0'>();
  });

  test('should generate nested list field with correct types', () => {
    const fields = generateFields(
      {
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
      },
      { listFieldsReturnType: 'exact' },
    );

    expectTypeOf(fields.$USERS.$ADDRESSES.STREET).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USERS.$ADDRESSES.CITY).toEqualTypeOf<'city_field'>();
    expectTypeOf(fields.$USERS.$ADDRESSES.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.$ADDRESSES.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.$ADDRESSES.STREET_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(fields.$USERS.$ADDRESSES.CITY_FIELD).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(fields.$USERS.$ADDRESSES.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USERS.$ADDRESSES.ELEMENT_AT).parameters.toEqualTypeOf<[number, number]>();
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
    expectTypeOf(fields.$USER.$LOCATION.STREET_FIELD).toEqualTypeOf<'user.location.street_field'>();
    expectTypeOf(fields.$USER.$LOCATION.CITY_FIELD).toEqualTypeOf<'user.location.city_field'>();
    expectTypeOf(fields.$USER.$LOCATION.KEY).toEqualTypeOf<'location'>();
    expectTypeOf(fields.$USER.$LOCATION.PATH).toEqualTypeOf<'user.location'>();
  });

  test('should generate nested object or array field and extra fields with correct types and methods', () => {
    const fields = generateFields(
      {
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
      },
      { listFieldsReturnType: 'exact' },
    );

    // User object fields

    expectTypeOf(fields.$USER.NAME).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.$USER.AGE).toEqualTypeOf<'age_field'>();
    expectTypeOf(fields.$USER.NAME_FIELD).toEqualTypeOf<'user.name_field'>();
    expectTypeOf(fields.$USER.AGE_FIELD).toEqualTypeOf<'user.age_field'>();

    expectTypeOf(fields.$USER.$LOCATIONS.KEY).toEqualTypeOf<'locations'>();
    expectTypeOf(fields.$USER.$LOCATIONS.PATH).toEqualTypeOf<'user.locations'>();

    expectTypeOf(fields.$USER.$LOCATIONS).not.toHaveProperty('AT');

    expectTypeOf(fields.$USER.$LOCATIONS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.ELEMENT_AT).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USER.$LOCATIONS.ELEMENT_AT(12)).toEqualTypeOf<'user.locations.12'>();

    expectTypeOf(fields.$USER.$LOCATIONS.CITY).toEqualTypeOf<'city_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.CITY_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.CITY_FIELD(36),
    ).toEqualTypeOf<'user.locations.36.city_field'>();

    expectTypeOf(fields.$USER.$LOCATIONS.STREET).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.STREET_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.STREET_FIELD(12),
    ).toEqualTypeOf<'user.locations.12.street_field'>();

    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.KEY).toEqualTypeOf<'address'>();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.PATH).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.PATH).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.PATH(12),
    ).toEqualTypeOf<'user.locations.12.address'>();

    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.CITY).toEqualTypeOf<'city_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.CITY_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.CITY_FIELD(12),
    ).toEqualTypeOf<'user.locations.12.address.city_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.STREET).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.STREET_FIELD).parameters.toEqualTypeOf<
      [number]
    >();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.STREET_FIELD(12),
    ).toEqualTypeOf<'user.locations.12.address.street_field'>();

    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS).toHaveProperty('AT');
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.AT).toBeFunction();
    expectTypeOf(fields.$USER.$LOCATIONS.$ADDRESS.AT).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$USER.$LOCATIONS.$ADDRESS.AT(12),
    ).toEqualTypeOf<'user.locations.12.address'>();

    // Users list fields

    expectTypeOf(fields.$USERS.NAME).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.$USERS.AGE).toEqualTypeOf<'age_field'>();
    expectTypeOf(fields.$USERS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.NAME_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.NAME_FIELD(12)).toEqualTypeOf<'users.12.name_field'>();
    expectTypeOf(fields.$USERS.AGE_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.AGE_FIELD).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.AGE_FIELD(12)).toEqualTypeOf<'users.12.age_field'>();
    expectTypeOf(fields.$USERS.KEY).toEqualTypeOf<'users'>();
    expectTypeOf(fields.$USERS.PATH).toEqualTypeOf<'users'>();

    expectTypeOf(fields.$USERS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USERS.ELEMENT_AT).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.ELEMENT_AT(12)).toEqualTypeOf<'users.12'>();

    expectTypeOf(fields.$USERS.$LOCATIONS.KEY).toEqualTypeOf<'locations'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.PATH).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.PATH).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$USERS.$LOCATIONS.PATH(12)).toEqualTypeOf<'users.12.locations'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.CITY).toEqualTypeOf<'city_field'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.CITY_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.CITY_FIELD).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.CITY_FIELD(12, 36),
    ).toEqualTypeOf<'users.12.locations.36.city_field'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.STREET).toEqualTypeOf<'street_field'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.STREET_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.STREET_FIELD).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.STREET_FIELD(12, 36),
    ).toEqualTypeOf<'users.12.locations.36.street_field'>();
    expectTypeOf(fields.$USERS.$LOCATIONS).toHaveProperty('ELEMENT_AT');
    expectTypeOf(fields.$USERS.$LOCATIONS.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.ELEMENT_AT).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.ELEMENT_AT(12, 36),
    ).toEqualTypeOf<'users.12.locations.36'>();
    expectTypeOf(fields.$USERS.$LOCATIONS).not.toHaveProperty('AT');

    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS).not.toHaveProperty('ELEMENT_AT');

    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS).toHaveProperty('AT');
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.AT).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.AT).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.AT(12, 36),
    ).toEqualTypeOf<'users.12.locations.36.address'>();

    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.KEY).toEqualTypeOf<'address'>();
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.PATH).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.PATH).parameters.toEqualTypeOf<
      [number, number]
    >();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.PATH(12, 36),
    ).toEqualTypeOf<'users.12.locations.36.address'>();

    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP).not.toHaveProperty('ELEMENT_AT');
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP).toHaveProperty('AT');
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.AT).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.AT).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.AT(12, 36, 112),
    ).toEqualTypeOf<'users.12.locations.36.address.tags.112.oop'>();

    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.NAME_FIELD).parameters.toEqualTypeOf<
      [number, number, number]
    >();
    expectTypeOf(
      fields.$USERS.$LOCATIONS.$ADDRESS.$TAGS.$OOP.NAME_FIELD(12, 36, 112),
    ).toEqualTypeOf<'users.12.locations.36.address.tags.112.oop.name_field'>();
  });

  test('should generate fields with no-case field name format', () => {
    const fields = generateFields(
      {
        names: 'name_field',
        nameToBack: 'name_to_back',
      },
      {
        fieldNameCaseFormat: 'no-case',
      },
    );

    expectTypeOf(fields.names).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.names_field).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.nameToBack).toEqualTypeOf<'name_to_back'>();
    expectTypeOf(fields.nameToBack_field).toEqualTypeOf<'name_to_back'>();

    expect(fields.names).toBe('name_field');
    expect(fields.names_field).toBe('name_field');
    expect(fields.nameToBack).toBe('name_to_back');
    expect(fields.nameToBack_field).toBe('name_to_back');
  });

  test('should generate fields with snake-case field name format', () => {
    const fields = generateFields(
      {
        userName: 'user_name',
        userAge: 'user_age',
        userEmail: 'email_address',
      },
      {
        fieldNameCaseFormat: 'snake-case',
        fieldAccessorSuffix: '_field',
      },
    );

    expectTypeOf(fields.user_name).toEqualTypeOf<'user_name'>();
    expectTypeOf(fields.user_name_field).toEqualTypeOf<'user_name'>();
    expectTypeOf(fields.user_age).toEqualTypeOf<'user_age'>();
    expectTypeOf(fields.user_age_field).toEqualTypeOf<'user_age'>();
    expectTypeOf(fields.user_email).toEqualTypeOf<'email_address'>();
    expectTypeOf(fields.user_email_field).toEqualTypeOf<'email_address'>();

    expect(fields.user_name).toBe('user_name');
    expect(fields.user_name_field).toBe('user_name');
    expect(fields.user_age).toBe('user_age');
    expect(fields.user_age_field).toBe('user_age');
    expect(fields.user_email).toBe('email_address');
    expect(fields.user_email_field).toBe('email_address');
  });

  test('should generate fields with upper-snake-case field name format (default)', () => {
    const fields = generateFields({
      userName: 'user_name',
      userAge: 'user_age',
    });

    expectTypeOf(fields.USER_NAME).toEqualTypeOf<'user_name'>();
    expectTypeOf(fields.USER_NAME_FIELD).toEqualTypeOf<'user_name'>();
    expectTypeOf(fields.USER_AGE).toEqualTypeOf<'user_age'>();
    expectTypeOf(fields.USER_AGE_FIELD).toEqualTypeOf<'user_age'>();

    expect(fields.USER_NAME).toBe('user_name');
    expect(fields.USER_NAME_FIELD).toBe('user_name');
    expect(fields.USER_AGE).toBe('user_age');
    expect(fields.USER_AGE_FIELD).toBe('user_age');
  });

  test('should generate fields with custom field accessor suffix', () => {
    const fields = generateFields(
      {
        name: 'name_value',
        email: 'email_value',
      },
      {
        fieldAccessorSuffix: '_accessor',
      },
    );

    expectTypeOf(fields.NAME).toEqualTypeOf<'name_value'>();
    expectTypeOf(fields.NAME_ACCESSOR).toEqualTypeOf<'name_value'>();
    expectTypeOf(fields.EMAIL).toEqualTypeOf<'email_value'>();
    expectTypeOf(fields.EMAIL_ACCESSOR).toEqualTypeOf<'email_value'>();

    expect(fields.NAME).toBe('name_value');
    expect(fields.NAME_ACCESSOR).toBe('name_value');
    expect(fields.EMAIL).toBe('email_value');
    expect(fields.EMAIL_ACCESSOR).toBe('email_value');
  });

  test('should generate nested object fields with no-case format', () => {
    const fields = generateFields(
      {
        userProfile: {
          firstName: 'first_name',
          lastName: 'last_name',
        },
      },
      {
        fieldNameCaseFormat: 'no-case',
        fieldAccessorSuffix: '_val',
      },
    );

    expectTypeOf(fields.$userProfile.firstName).toEqualTypeOf<'first_name'>();
    expectTypeOf(fields.$userProfile.firstName_val).toEqualTypeOf<'userProfile.first_name'>();
    expectTypeOf(fields.$userProfile.lastName).toEqualTypeOf<'last_name'>();
    expectTypeOf(fields.$userProfile.lastName_val).toEqualTypeOf<'userProfile.last_name'>();
    expectTypeOf(fields.$userProfile.key).toEqualTypeOf<'userProfile'>();
    expectTypeOf(fields.$userProfile.path).toEqualTypeOf<'userProfile'>();

    expect(fields.$userProfile.firstName).toBe('first_name');
    expect(fields.$userProfile.firstName_val).toBe('userProfile.first_name');
    expect(fields.$userProfile.lastName).toBe('last_name');
    expect(fields.$userProfile.lastName_val).toBe('userProfile.last_name');
    expect(fields.$userProfile.key).toBe('userProfile');
    expect(fields.$userProfile.path).toBe('userProfile');
  });

  test('should generate nested object fields with snake-case format', () => {
    const fields = generateFields(
      {
        userProfile: {
          firstName: 'first_name',
          lastName: 'last_name',
        },
      },
      {
        fieldNameCaseFormat: 'snake-case',
      },
    );

    expectTypeOf(fields.$user_profile.first_name).toEqualTypeOf<'first_name'>();
    expectTypeOf(fields.$user_profile.first_name_field).toEqualTypeOf<'userProfile.first_name'>();
    expectTypeOf(fields.$user_profile.last_name).toEqualTypeOf<'last_name'>();
    expectTypeOf(fields.$user_profile.last_name_field).toEqualTypeOf<'userProfile.last_name'>();

    expect(fields.$user_profile.first_name).toBe('first_name');
    expect(fields.$user_profile.first_name_field).toBe('userProfile.first_name');
    expect(fields.$user_profile.last_name).toBe('last_name');
    expect(fields.$user_profile.last_name_field).toBe('userProfile.last_name');
  });

  test('should generate list fields with default return type', () => {
    const fields = generateFields({
      users: [{ name: 'name_field', age: 'age_field' }],
    });

    expectTypeOf(fields.$USERS.NAME).toEqualTypeOf<'name_field'>();
    expectTypeOf(fields.$USERS.AGE).toEqualTypeOf<'age_field'>();
    expectTypeOf(fields.$USERS.NAME_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.AGE_FIELD).toBeFunction();
    expectTypeOf(fields.$USERS.NAME_FIELD(0)).toEqualTypeOf<`users.${number}.name_field`>();
    expectTypeOf(fields.$USERS.AGE_FIELD(0)).toEqualTypeOf<`users.${number}.age_field`>();

    expect(fields.$USERS.NAME).toBe('name_field');
    expect(fields.$USERS.AGE).toBe('age_field');
    expect(fields.$USERS.NAME_FIELD(0)).toBe('users.0.name_field');
    expect(fields.$USERS.NAME_FIELD(5)).toBe('users.5.name_field');
    expect(fields.$USERS.AGE_FIELD(10)).toBe('users.10.age_field');
  });

  test('should generate list fields with no-case format and custom suffix', () => {
    const fields = generateFields(
      {
        userList: [{ userName: 'user_name', userAge: 'user_age' }],
      },
      {
        fieldNameCaseFormat: 'no-case',
        fieldAccessorSuffix: '_item',
        listFieldsReturnType: 'exact',
      },
    );

    expectTypeOf(fields.$userList.userName).toEqualTypeOf<'user_name'>();
    expectTypeOf(fields.$userList.userName_item).toBeFunction();
    expectTypeOf(fields.$userList.userName_item).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$userList.userName_item(0)).toEqualTypeOf<'userList.0.user_name'>();
    expectTypeOf(fields.$userList.element_at).toBeFunction();
    expectTypeOf(fields.$userList.element_at(0)).toEqualTypeOf<'userList.0'>();

    expect(fields.$userList.userName).toBe('user_name');
    expect(fields.$userList.userName_item(0)).toBe('userList.0.user_name');
    expect(fields.$userList.userName_item(3)).toBe('userList.3.user_name');
    expect(fields.$userList.userAge_item(2)).toBe('userList.2.user_age');
    expect(fields.$userList.element_at(5)).toBe('userList.5');
  });

  test('should handle complex nested structures with various options', () => {
    const fields = generateFields(
      {
        companyData: {
          employees: [
            {
              personalInfo: {
                firstName: 'first_name',
                lastName: 'last_name',
              },
            },
          ],
        },
      },
      {
        fieldNameCaseFormat: 'snake-case',
        fieldAccessorSuffix: '_path',
        listFieldsReturnType: 'exact',
      },
    );

    expectTypeOf(fields.$company_data.$employees.$personal_info.first_name_path).toBeFunction();
    expectTypeOf(
      fields.$company_data.$employees.$personal_info.first_name_path,
    ).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(
      fields.$company_data.$employees.$personal_info.first_name_path(0),
    ).toEqualTypeOf<'companyData.employees.0.personalInfo.first_name'>();

    expect(fields.$company_data.$employees.$personal_info.first_name).toBe('first_name');
    expect(fields.$company_data.$employees.$personal_info.first_name_path(0)).toBe(
      'companyData.employees.0.personalInfo.first_name',
    );
    expect(fields.$company_data.$employees.$personal_info.last_name_path(2)).toBe(
      'companyData.employees.2.personalInfo.last_name',
    );
    expect(fields.$company_data.$employees.element_at(1)).toBe('companyData.employees.1');
  });

  test('should handle nested lists with exact return type', () => {
    const fields = generateFields(
      {
        matrix: [
          {
            row: [
              {
                value: 'cell_value',
              },
            ],
          },
        ],
      },
      {
        listFieldsReturnType: 'exact',
      },
    );

    expectTypeOf(fields.$MATRIX.$ROW.VALUE_FIELD).toBeFunction();
    expectTypeOf(fields.$MATRIX.$ROW.VALUE_FIELD).parameters.toEqualTypeOf<[number, number]>();
    expectTypeOf(
      fields.$MATRIX.$ROW.VALUE_FIELD(0, 0),
    ).toEqualTypeOf<'matrix.0.row.0.cell_value'>();
    expectTypeOf(fields.$MATRIX.$ROW.ELEMENT_AT).toBeFunction();
    expectTypeOf(fields.$MATRIX.$ROW.ELEMENT_AT).parameters.toEqualTypeOf<[number, number]>();

    expect(fields.$MATRIX.$ROW.VALUE).toBe('cell_value');
    expect(fields.$MATRIX.$ROW.VALUE_FIELD(0, 0)).toBe('matrix.0.row.0.cell_value');
    expect(fields.$MATRIX.$ROW.VALUE_FIELD(1, 2)).toBe('matrix.1.row.2.cell_value');
    expect(fields.$MATRIX.$ROW.ELEMENT_AT(3, 4)).toBe('matrix.3.row.4');
  });

  test('should handle object inside list with AT method', () => {
    const fields = generateFields(
      {
        items: [
          {
            metadata: {
              tag: 'tag_value',
            },
          },
        ],
      },
      {
        listFieldsReturnType: 'exact',
        fieldNameCaseFormat: 'snake-case',
      },
    );

    expectTypeOf(fields.$items.$metadata.at).toBeFunction();
    expectTypeOf(fields.$items.$metadata.at).parameters.toEqualTypeOf<[number]>();
    expectTypeOf(fields.$items.$metadata.at(0)).toEqualTypeOf<'items.0.metadata'>();
    expectTypeOf(fields.$items.$metadata.tag_field).toBeFunction();
    expectTypeOf(
      fields.$items.$metadata.tag_field(0),
    ).toEqualTypeOf<'items.0.metadata.tag_value'>();

    expect(fields.$items.$metadata.at(0)).toBe('items.0.metadata');
    expect(fields.$items.$metadata.at(5)).toBe('items.5.metadata');
    expect(fields.$items.$metadata.tag).toBe('tag_value');
    expect(fields.$items.$metadata.tag_field(0)).toBe('items.0.metadata.tag_value');
    expect(fields.$items.$metadata.tag_field(3)).toBe('items.3.metadata.tag_value');
  });

  test('should correctly apply all options together', () => {
    const fields = generateFields(
      {
        myData: 'data_field',
        myNestedData: {
          innerValue: 'inner_value',
        },
      },
      {
        fieldNameCaseFormat: 'no-case',
        fieldAccessorSuffix: '_custom',
        listFieldsReturnType: 'default',
      },
    );

    expectTypeOf(fields.myData).toEqualTypeOf<'data_field'>();
    expectTypeOf(fields.myData_custom).toEqualTypeOf<'data_field'>();
    expectTypeOf(fields.$myNestedData.innerValue).toEqualTypeOf<'inner_value'>();
    expectTypeOf(
      fields.$myNestedData.innerValue_custom,
    ).toEqualTypeOf<'myNestedData.inner_value'>();

    expect(fields.myData).toBe('data_field');
    expect(fields.myData_custom).toBe('data_field');
    expect(fields.$myNestedData.innerValue).toBe('inner_value');
    expect(fields.$myNestedData.innerValue_custom).toBe('myNestedData.inner_value');
    expect(fields.$myNestedData.key).toBe('myNestedData');
    expect(fields.$myNestedData.path).toBe('myNestedData');
  });
});
