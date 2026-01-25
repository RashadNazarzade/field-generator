import { describe, expectTypeOf, test } from 'vitest';

import type { GenerateFields } from '@/types/generate-fields';

describe('GenerateFields Type', () => {
  test('should generate fields for simple schema', () => {
    type Schema = { name: 'name'; age: 'age' };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<Result>().toHaveProperty('NAME');
    expectTypeOf<Result>().toHaveProperty('AGE');
    expectTypeOf<Result>().toHaveProperty('NAME_FIELD');
    expectTypeOf<Result>().toHaveProperty('AGE_FIELD');

    expectTypeOf<Result['NAME']>().toEqualTypeOf<'name'>();
    expectTypeOf<Result['AGE']>().toEqualTypeOf<'age'>();
    expectTypeOf<Result['NAME_FIELD']>().toEqualTypeOf<'name'>();
    expectTypeOf<Result['AGE_FIELD']>().toEqualTypeOf<'age'>();
  });

  test('should generate nested fields for objects', () => {
    type Schema = {
      name: string;
      address: {
        street: string;
        city: string;
      };
    };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<Result>().toHaveProperty('NAME');
    expectTypeOf<Result>().toHaveProperty('NAME_FIELD');
    expectTypeOf<Result>().toHaveProperty('$ADDRESS');

    expectTypeOf<Result['$ADDRESS']>().toHaveProperty('STREET');
    expectTypeOf<Result['$ADDRESS']>().toHaveProperty('CITY');
    expectTypeOf<Result['$ADDRESS']>().toHaveProperty('STREET_FIELD');
    expectTypeOf<Result['$ADDRESS']>().toHaveProperty('CITY_FIELD');
    expectTypeOf<Result['$ADDRESS']>().toHaveProperty('KEY');
    expectTypeOf<Result['$ADDRESS']>().toHaveProperty('PATH');
  });

  test('should generate fields for arrays', () => {
    type Schema = {
      users: [{ name: string; email: string }];
    };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<Result>().toHaveProperty('$USERS');
    expectTypeOf<Result['$USERS']>().toHaveProperty('NAME');
    expectTypeOf<Result['$USERS']>().toHaveProperty('EMAIL');
    expectTypeOf<Result['$USERS']>().toHaveProperty('NAME_FIELD');
    expectTypeOf<Result['$USERS']>().toHaveProperty('EMAIL_FIELD');
    expectTypeOf<Result['$USERS']>().toHaveProperty('ELEMENT_AT');
    expectTypeOf<Result['$USERS']>().toHaveProperty('KEY');
    expectTypeOf<Result['$USERS']>().toHaveProperty('PATH');

    expectTypeOf<Result['$USERS']['NAME_FIELD']>().toBeFunction();
    expectTypeOf<Result['$USERS']['EMAIL_FIELD']>().toBeFunction();
    expectTypeOf<Result['$USERS']['ELEMENT_AT']>().toBeFunction();
  });

  test('should generate fields for nested arrays', () => {
    type Schema = {
      companies: [
        {
          name: string;
          employees: [{ id: string; role: string }];
        },
      ];
    };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<Result>().toHaveProperty('$COMPANIES');
    expectTypeOf<Result['$COMPANIES']>().toHaveProperty('NAME_FIELD');
    expectTypeOf<Result['$COMPANIES']>().toHaveProperty('$EMPLOYEES');
    expectTypeOf<Result['$COMPANIES']['$EMPLOYEES']>().toHaveProperty('ID_FIELD');
    expectTypeOf<Result['$COMPANIES']['$EMPLOYEES']>().toHaveProperty('ROLE_FIELD');
    expectTypeOf<Result['$COMPANIES']['$EMPLOYEES']>().toHaveProperty('ELEMENT_AT');

    expectTypeOf<Result['$COMPANIES']['NAME_FIELD']>().toBeFunction();
    expectTypeOf<Result['$COMPANIES']['$EMPLOYEES']['ID_FIELD']>().toBeFunction();
    expectTypeOf<Result['$COMPANIES']['$EMPLOYEES']['ROLE_FIELD']>().toBeFunction();
  });

  test('should handle mixed nested structures', () => {
    type Schema = {
      user: {
        profile: {
          name: 'name';
        };
        posts: [
          {
            title: 'title';
            comments: [{ text: 'text' }];
          },
        ];
      };
    };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<Result>().toHaveProperty('$USER');
    expectTypeOf<Result['$USER']>().toHaveProperty('$PROFILE');
    expectTypeOf<Result['$USER']['$PROFILE']>().toHaveProperty('NAME_FIELD');
    expectTypeOf<Result['$USER']>().toHaveProperty('$POSTS');
    expectTypeOf<Result['$USER']['$POSTS']>().toHaveProperty('TITLE_FIELD');
    expectTypeOf<Result['$USER']['$POSTS']>().toHaveProperty('$COMMENTS');
    expectTypeOf<Result['$USER']['$POSTS']['$COMMENTS']>().toHaveProperty('TEXT_FIELD');

    expectTypeOf<Result['$USER']['$PROFILE']['NAME_FIELD']>().toEqualTypeOf<'user.profile.name'>();
    expectTypeOf<Result['$USER']['$POSTS']['TITLE_FIELD']>().toBeFunction();
    expectTypeOf<Result['$USER']['$POSTS']['$COMMENTS']['TEXT_FIELD']>().toBeFunction();
  });

  test('should handle camelCase field names', () => {
    type Schema = {
      firstName: string;
      lastName: string;
      emailAddress: string;
    };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<Result>().toHaveProperty('FIRST_NAME');
    expectTypeOf<Result>().toHaveProperty('LAST_NAME');
    expectTypeOf<Result>().toHaveProperty('EMAIL_ADDRESS');
    expectTypeOf<Result>().toHaveProperty('FIRST_NAME_FIELD');
    expectTypeOf<Result>().toHaveProperty('LAST_NAME_FIELD');
    expectTypeOf<Result>().toHaveProperty('EMAIL_ADDRESS_FIELD');
  });

  test('should generate correct literal types', () => {
    type Schema = {
      name: 'name';
      age: 'age';
    };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<Result['NAME']>().toEqualTypeOf<'name'>();
    expectTypeOf<Result['AGE']>().toEqualTypeOf<'age'>();
    expectTypeOf<Result['NAME_FIELD']>().toEqualTypeOf<'name'>();
    expectTypeOf<Result['AGE_FIELD']>().toEqualTypeOf<'age'>();
  });

  test('should handle deeply nested objects', () => {
    type Schema = {
      level1: {
        level2: {
          level3: {
            value: 'value_field';
          };
        };
      };
    };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<
      Result['$LEVEL1']['$LEVEL2']['$LEVEL3']['VALUE_FIELD']
    >().toEqualTypeOf<'level1.level2.level3.value_field'>();
  });

  test('should preserve KEY and PATH properties', () => {
    type Schema = {
      user: {
        name: string;
      };
    };
    type Result = GenerateFields<
      Schema,
      { listFieldsReturnType: 'default'; fieldNameCaseFormat: 'upper-snake-case' }
    >;

    expectTypeOf<Result['$USER']['KEY']>().toEqualTypeOf<'user'>();
    expectTypeOf<Result['$USER']['PATH']>().toEqualTypeOf<'user'>();
  });
});
