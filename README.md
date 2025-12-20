# TypeScript Fields Generator

> Type-safe field path generation for nested objects and arrays

Build compile-time validated field accessors from your data schemas. Eliminate typos, refactoring errors, and manual path string management.

```typescript
const fields = generateFields({
  user: {
    profile: { firstName: 'firstName', email: 'email' },
    addresses: [{ street: 'street', city: 'city' }],
  },
});

fields.$USER.$PROFILE.FIRST_NAME_FIELD; // 'user.profile.firstName'
fields.$USER.$ADDRESSES.STREET_FIELD(0); // 'user.addresses.0.street'
```

## Why?

**The Problem:**

```typescript
// Brittle string paths everywhere
<input {...register('user.profile.firstName')} />
db.select('user.addresses.0.city')
errors['user.profile.email']  // typo? good luck finding it
```

**The Solution:**

```typescript
// Type-safe, refactor-friendly, autocomplete-enabled
<input {...register(fields.$USER.$PROFILE.FIRST_NAME_FIELD)} />
db.select(fields.$USER.$ADDRESSES.CITY_FIELD(0))
errors[fields.$USER.$PROFILE.EMAIL_FIELD]  // TypeScript catches typos
```

## Installation

```bash
npm install @glitchproof/form-field-generator
```

## Core Concepts

### Simple Fields

Input values become uppercase constants and field paths:

```typescript
const fields = generateFields({
  email: 'email',
  firstName: 'firstName',
});

fields.EMAIL; // 'email' - the value
fields.EMAIL_FIELD; // 'email' - the path
fields.FIRST_NAME_FIELD; // 'firstName' - camelCase → SCREAMING_SNAKE_CASE
```

### Nested Objects

Nested structures get `$` prefixed accessors:

```typescript
const fields = generateFields({
  user: {
    name: 'name',
    email: 'email',
  },
});

fields.$USER.NAME_FIELD; // 'user.name'
fields.$USER.EMAIL_FIELD; // 'user.email'
fields.$USER.KEY; // 'user' - original key
```

### Arrays

Array fields become functions that accept indices:

```typescript
const fields = generateFields({
  users: [{ name: 'name', email: 'email' }],
});

fields.$USERS.NAME_FIELD(0); // 'users.0.name'
fields.$USERS.EMAIL_FIELD(5); // 'users.5.email'
fields.USERS_FIELD(); // '.users' - the array itself
```

### Nested Arrays

Multiple indices for deeply nested arrays:

```typescript
const fields = generateFields({
  orders: [
    {
      items: [{ productId: 'productId', qty: 'qty' }],
    },
  ],
});

fields.$ORDERS.$ITEMS.PRODUCT_ID_FIELD(0, 2); // 'orders.0.items.2.productId'
//                                     ^  ^
//                                  order item
```

## Real-World Usage

### React Hook Form

Stop hardcoding form field paths:

```typescript
import { useForm } from 'react-hook-form';

const formFields = generateFields({
  email: 'email',
  password: 'password',
  profile: {
    firstName: 'firstName',
    lastName: 'lastName'
  }
});

function RegistrationForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <form>
      <input {...register(formFields.EMAIL_FIELD)} />
      {errors[formFields.EMAIL] && <span>Email required</span>}

      <input {...register(formFields.$PROFILE.FIRST_NAME_FIELD)} />
      <input {...register(formFields.$PROFILE.LAST_NAME_FIELD)} />
    </form>
  );
}
```

**Benefits:**

- Rename `firstName` → `givenName`? Change once in schema, works everywhere
- TypeScript autocomplete guides you
- Impossible to typo field names

### Database Queries

Build type-safe query builders:

```typescript
const schema = generateFields({
  id: 'id',
  title: 'title',
  author: {
    name: 'name',
    email: 'email',
  },
  tags: [{ name: 'name' }],
});

// Prisma-style
db.posts.findMany({
  select: {
    [schema.ID]: true,
    [schema.TITLE]: true,
    [schema.$AUTHOR.NAME]: true,
  },
  where: {
    [schema.$AUTHOR.EMAIL_FIELD]: 'user@example.com',
  },
});

// SQL builder
query()
  .select(schema.TITLE_FIELD)
  .where(schema.$AUTHOR.NAME_FIELD, '=', 'John')
  .orderBy(schema.ID_FIELD);
```

### Validation Schemas

Stop duplicating field paths:

```typescript
import { z } from 'zod';

const userFields = generateFields({
  email: 'email',
  password: 'password',
  profile: {
    age: 'age',
  },
});

// Define validation once
const schema = z.object({
  [userFields.EMAIL]: z.string().email(),
  [userFields.PASSWORD]: z.string().min(8),
  [userFields.$PROFILE.AGE]: z.number().min(18),
});

// Use in forms, API validation, etc.
schema.parse(formData);
```

### State Management

Type-safe selectors and reducers:

```typescript
const stateFields = generateFields({
  user: {
    profile: { name: 'name' },
    preferences: { theme: 'theme' },
  },
  session: {
    token: 'token',
    expiresAt: 'expiresAt',
  },
});

// Redux selectors
const selectUserName = (state) =>
  state[stateFields.$USER.$PROFILE.KEY][stateFields.$USER.$PROFILE.NAME];

// Zustand
const useStore = create((set) => ({
  [stateFields.$USER.KEY]: {},
  [stateFields.$SESSION.KEY]: {},
}));
```

### API Field Selection

Control exactly what data you fetch:

```typescript
const apiFields = generateFields({
  user: {
    id: 'id',
    email: 'email',
    posts: [
      {
        title: 'title',
        comments: [{ text: 'text' }],
      },
    ],
  },
});

// GraphQL
const query = gql`
  query {
    user {
      ${apiFields.$USER.ID}
      ${apiFields.$USER.EMAIL}
      posts {
        ${apiFields.$USER.$POSTS.TITLE}
      }
    }
  }
`;

// REST with query params
fetch(
  `/api/user?fields=${[
    apiFields.$USER.EMAIL_FIELD,
    apiFields.$USER.$POSTS.TITLE_FIELD,
  ].join(',')}`,
);
```

## API Reference

### `generateFields(schema)`

**Input:** Object schema where values are field names (strings), nested objects, or arrays.

**Output:** Generated field accessors with type safety.

#### Generated Properties

| Pattern            | Type                   | Example                    |
| ------------------ | ---------------------- | -------------------------- |
| `FIELD_NAME`       | `string`               | `EMAIL` → `'email'`        |
| `FIELD_NAME_FIELD` | `string` or `function` | `EMAIL_FIELD` → `'email'`  |
| `$NESTED`          | `object`               | Nested field accessors     |
| `KEY`              | `string`               | Original key name          |
| `PATH`             | `string` or `function` | Full path to field         |
| `AT`               | `function`             | Only listed object fields  |
|                    |                        | have this method to get    |
|                    |                        | object path from nested or |
|                    |                        | list inside                |
|                    |                        |                            |
| `ELEMENT_AT`       | `function`             | Only array fields has      |
|                    |                        | array fields to get array  |
|                    |                        | specific element like      |
|                    |                        | fields.$USERS.ELEMENT_AT(3)|
|                    |                        | provide path `users.3`     |

**Notes:**

- Field names convert to `SCREAMING_SNAKE_CASE`
- Nested objects prefix with `$`
- Array fields become functions accepting indices
- `_FIELD` suffix provides full path

## TypeScript Support

Requires TypeScript 4.5+.

Full type inference and autocomplete:

```typescript
const fields = generateFields({
  user: {
    name: 'name',
    tags: [{ value: 'value' }],
  },
});

// ✅ Valid - TypeScript knows these exist
fields.$USER.NAME_FIELD;
fields.$USER.$TAGS.VALUE_FIELD(0);

// ❌ Type error - property doesn't exist
fields.$USER.INVALID_FIELD;

// ❌ Type error - wrong arity
fields.$USER.$TAGS.VALUE_FIELD(); // Expected 1 argument
```

## Design Decisions

**Why `$` prefix for nested objects?**  
Distinguishes between value constants (`EMAIL`) and nested accessors (`$PROFILE`). Makes structure immediately visible.

**Why functions for arrays?**  
Arrays need dynamic indices. Functions provide type-safe, flexible access: `ITEMS_FIELD(index)`.

**Why both `NAME` and `NAME_FIELD`?**

- `NAME` - the value: `'name'` (useful for object keys)
- `NAME_FIELD` - the path: `'user.name'` (useful for form libraries)

**Why `SCREAMING_SNAKE_CASE`?**

- Distinguishes generated constants from regular variables
- Convention in many libraries (Redux actions, etc.)
- Easier to spot in large codebases

## Performance

- **Zero runtime overhead** - pure type-level transformations
- **Tree-shakeable** - dead code elimination works perfectly
- **No dependencies** - ~2KB gzipped
- **Fast TypeScript compilation** - efficient recursive types

## Patterns & Best Practices

### Central Field Definitions

```typescript
// src/fields/user.fields.ts
export const UserFields = generateFields({
  id: 'id',
  email: 'email',
  profile: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
});

// Use everywhere
import { UserFields } from '@/fields/user.fields';
```

### Combining Multiple Schemas

```typescript
const productFields = generateFields({
  /* ... */
});
const orderFields = generateFields({
  /* ... */
});

// Use separately or together
const allFields = { productFields, orderFields };
```

### Conditional Field Access

```typescript
const fields = generateFields({
  user: {
    role: 'role',
    adminSettings: { permission: 'permission' },
  },
});

// Type-safe conditional access
const getSettingsPath = (isAdmin: boolean) =>
  isAdmin ? fields.$USER.$ADMIN_SETTINGS.PERMISSION_FIELD : null;
```

### Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('UserFields', () => {
  it('generates correct paths', () => {
    expect(UserFields.EMAIL_FIELD).toBe('email');
    expect(UserFields.$PROFILE.FIRST_NAME_FIELD).toBe('profile.firstName');
  });

  it('handles array indices', () => {
    expect(UserFields.$ADDRESSES.STREET_FIELD(0)).toBe('addresses.0.street');
  });
});
```

## Migration Guide

### From Hardcoded Strings

```typescript
// Before
const emailField = 'user.profile.email';
const addressField = (index) => `user.addresses.${index}.street`;

// After
const fields = generateFields({
  user: {
    profile: { email: 'email' },
    addresses: [{ street: 'street' }],
  },
});

const emailField = fields.$USER.$PROFILE.EMAIL_FIELD;
const addressField = (index) => fields.$USER.$ADDRESSES.STREET_FIELD(index);
```

### From Constants

```typescript
// Before
export const FIELDS = {
  EMAIL: 'email',
  PROFILE_NAME: 'profile.name',
};

// After
export const FIELDS = generateFields({
  email: 'email',
  profile: { name: 'name' },
});
// Access: FIELDS.EMAIL, FIELDS.$PROFILE.NAME_FIELD
```

## Limitations

- Requires TypeScript 4.5+ for full type support
- Very deep nesting (10+ levels) may slow TypeScript compilation
- Arrays of primitives not supported (wrap in objects: `[{ value: string }]`)
- Dynamic keys not supported (must be known at compile time)

## Troubleshooting

**TypeScript shows `any` type:**

- Ensure you're using TypeScript 4.5+
- Add `as const` to your schema: `generateFields({ ... } as const)`

**"Expected N arguments" error:**

- Check array nesting level
- Each array level adds one required index argument

**Slow compilation:**

- Reduce nesting depth
- Split large schemas into smaller pieces

## Contributing

Contributions welcome! Please:

- Add tests for new features
- Update TypeScript types accordingly
- Follow existing code style
- Update documentation

## License

MIT
