import { generateFields, generateFieldsLazy } from '@/index';
import { bench, describe, expect, it } from 'vitest';

const schemas = {
  small: {
    id: 'id',
    name: 'name',
    email: 'email',
  },

  medium: {
    user: {
      id: 'id',
      email: 'email',
      profile: {
        firstName: 'firstName',
        lastName: 'lastName',
      },
    },
    settings: {
      theme: 'theme',
      language: 'language',
    },
  },

  large: (() => {
    const schema: any = { id: 'id', email: 'email' };
    for (let i = 0; i < 50; i++) {
      schema[`field${i}`] = `field${i}`;
    }
    schema.nested = {
      user: {
        profile: { name: 'name', bio: 'bio' },
        addresses: [{ street: 'street', city: 'city' }],
      },
    };
    return schema;
  })(),
};

describe('Generation Performance', () => {
  bench('small schema (3 fields)', () => {
    generateFields(schemas.small);
  });

  bench('medium schema (10 fields)', () => {
    generateFields(schemas.medium);
  });

  bench('large schema (50+ fields)', () => {
    generateFields(schemas.large);
  });
});

describe('Field Access Performance', () => {
  const fields = generateFields(schemas.medium);

  bench('simple field access', () => {
    const _ = fields.$USER.EMAIL_FIELD;
  });

  bench('nested field access', () => {
    const _ = fields.$USER.$PROFILE.FIRST_NAME_FIELD;
  });

  bench('repeated access (cached)', () => {
    for (let i = 0; i < 100; i++) {
      const _ = fields.$USER.EMAIL_FIELD;
    }
  });
});

describe('Real-World Usage', () => {
  bench('form initialization', () => {
    const fields = generateFields(schemas.medium);

    // Simulate registering all fields
    const paths = [
      fields.$USER.ID_FIELD,
      fields.$USER.EMAIL_FIELD,
      fields.$USER.$PROFILE.FIRST_NAME_FIELD,
      fields.$USER.$PROFILE.LAST_NAME_FIELD,
      fields.$SETTINGS.THEME_FIELD,
      fields.$SETTINGS.LANGUAGE_FIELD,
    ];
  });

  bench('validation errors lookup', () => {
    const fields = generateFields(schemas.medium);

    for (let i = 0; i < 10; i++) {
      const _ = fields.$USER.EMAIL_FIELD;
    }
  });

  bench('sparse access (1 field only)', () => {
    const fields = generateFields(schemas.large);
    const _ = fields.EMAIL_FIELD;
  });
});

describe('Performance Requirements', () => {
  it('should generate small schema in < 5ms', () => {
    const start = performance.now();
    generateFields(schemas.small);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5);
  });

  it('should generate large schema in < 20ms', () => {
    const start = performance.now();
    generateFields(schemas.large);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(20);
  });

  it('should access nested fields in < 1ms', () => {
    const fields = generateFields(schemas.medium);

    const start = performance.now();
    const _ = fields.$USER.$PROFILE.FIRST_NAME_FIELD;
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1);
  });

  it('should handle 1000 repeated accesses in < 10ms', () => {
    const fields = generateFields(schemas.medium);

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      const _ = fields.$USER.EMAIL_FIELD;
    }
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(10);
  });
});

// ============================================
// STRATEGY COMPARISON (if you have lazy/eager)
// ============================================

describe('Strategy Comparison', () => {
  bench('eager: generation only', () => {
    generateFields(schemas.large);
  });

  bench('lazy: generation only', () => {
    generateFieldsLazy(schemas.large);
  });

  bench('eager: generation + full access', () => {
    const fields = generateFields(schemas.medium);
    fields.$USER.EMAIL_FIELD;
    fields.$USER.$PROFILE.FIRST_NAME_FIELD;
    fields.$SETTINGS.THEME_FIELD;
  });

  bench('lazy: generation + full access', () => {
    const fields = generateFieldsLazy(schemas.medium);
    fields.$USER.EMAIL_FIELD;
    fields.$USER.$PROFILE.FIRST_NAME_FIELD;
    fields.$SETTINGS.THEME_FIELD;
  });

  bench('eager: generation + sparse access', () => {
    const fields = generateFields(schemas.large);
    fields.EMAIL_FIELD; // Only access 1 field
  });

  bench('lazy: generation + sparse access', () => {
    const fields = generateFieldsLazy(schemas.large);
    fields.EMAIL_FIELD; // Only access 1 field
  });
});

// ============================================
// ARRAY FIELD BENCHMARKS
// ============================================

describe('Array Field Performance', () => {
  const arraySchema = {
    users: [
      {
        id: 'id',
        name: 'name',
        email: 'email',
        profile: {
          bio: 'bio',
          avatar: 'avatar',
        },
      },
    ],
  } as const;

  const fields = generateFields(arraySchema);

  bench('array field access', () => {
    const _ = fields.$USERS.NAME_FIELD(0);
  });

  bench('nested array field access', () => {
    const _ = fields.$USERS.$PROFILE.BIO_FIELD(0);
  });

  bench('multiple array indices', () => {
    for (let i = 0; i < 10; i++) {
      const _ = fields.$USERS.EMAIL_FIELD(i);
    }
  });
});

// ============================================
// DEEP NESTING BENCHMARKS
// ============================================

describe('Deep Nesting Performance', () => {
  const deepSchema = {
    level1: {
      level2: {
        level3: {
          level4: {
            level5: {
              field: 'field',
            },
          },
        },
      },
    },
  };

  bench('deep nesting generation', () => {
    generateFields(deepSchema);
  });

  bench('deep nesting access', () => {
    const fields = generateFields(deepSchema);
    const _ = fields.$LEVEL1.$LEVEL2.$LEVEL3.$LEVEL4.$LEVEL5.FIELD_FIELD;
  });
});

// ============================================
// TYPE COMPLEXITY (compile time test)
// ============================================

describe('Type System Performance', () => {
  it('should handle complex types without excessive compilation time', () => {
    // This test passes if the file compiles in reasonable time

    const complexSchema = {
      user: {
        id: 'id',
        profile: {
          personal: {
            firstName: 'firstName',
            lastName: 'lastName',
          },
          social: {
            twitter: 'twitter',
            github: 'github',
          },
        },
        posts: [
          {
            id: 'id',
            title: 'title',
            tags: [{ name: 'name' }],
          },
        ],
      },
    } as const;

    const fields = generateFields(complexSchema);

    // If this compiles and runs, type system is working
    expect(fields.$USER.$PROFILE.$PERSONAL.FIRST_NAME_FIELD).toBe(
      'user.profile.personal.firstName',
    );
  });
});
