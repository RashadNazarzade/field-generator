# TypeScript Fields Generator

**Type-safe field path generation for nested objects and arrays with zero runtime overhead.**

Build compile-time validated field accessors from your data schemas. Eliminate string literal typos, maintain consistency during refactoring, and leverage TypeScript's type system for complete autocompletion support.

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

---

## Motivation

Modern applications frequently require string-based path access to deeply nested data structures. This pattern appears in form libraries, validation schemas, database queries, and state management. Manual string construction introduces several problems:

**Common Issues with String Paths:**

```typescript
// Prone to typos - no compile-time validation
<input {...register('user.profile.firstName')} />

// Refactoring breaks existing code
// Renaming 'firstName' requires finding all string references
<input {...register('user.profile.firstName')} />

// No autocomplete support
db.select('user.addresses.0.city')
```

**Solution with Type-Safe Field Generation:**

```typescript
// Full TypeScript support with autocomplete
<input {...register(fields.$USER.$PROFILE.FIRST_NAME_FIELD)} />

// Refactoring safety - TypeScript errors guide updates
errors[fields.$USER.$PROFILE.FIRST_NAME_FIELD]

// IDE assistance for discovering available fields
db.select(fields.$USER.$ADDRESSES.CITY_FIELD(0))
```

---

## Installation

```bash
npm install @glitchproof/form-field-generator
```

**Requirements:**

- TypeScript 4.5 or higher
- Node.js 18 or higher

---

## Core Concepts

### Field Name Transformation

Input field names automatically transform to SCREAMING_SNAKE_CASE constants, following common constant naming conventions in JavaScript applications.

```typescript
const fields = generateFields({
  email: 'email',
  firstName: 'firstName',
  dateOfBirth: 'dateOfBirth',
});

fields.EMAIL; // 'email'
fields.FIRST_NAME; // 'firstName'
fields.DATE_OF_BIRTH; // 'dateOfBirth'
```

### Field Accessors

Each field generates two properties:

1. **Value Constant**: Direct access to the field name
2. **Path Accessor**: Suffixed with `_FIELD`, provides the full path to the field

```typescript
fields.EMAIL; // 'email' - useful for object keys
fields.EMAIL_FIELD; // 'email' - useful for path-based APIs
```

### Nested Object Navigation

Nested objects receive a dollar sign prefix to distinguish them from field constants. This convention clearly indicates structural navigation points versus terminal field values.

```typescript
const fields = generateFields({
  user: {
    profile: {
      name: 'name',
      email: 'email',
    },
  },
});

fields.$USER.$PROFILE.NAME_FIELD; // 'user.profile.name'
fields.$USER.$PROFILE.EMAIL_FIELD; // 'user.profile.email'
```

**Additional Properties:**

- `KEY`: Returns the original object key
- `PATH`: Returns the path to the object

```typescript
fields.$USER.KEY; // 'user'
fields.$USER.PATH; // 'user'
```

### Array Field Handling

Array fields become functions accepting numeric indices. This design supports dynamic index values while maintaining type safety.

```typescript
const fields = generateFields({
  users: [
    {
      name: 'name',
      email: 'email',
    },
  ],
});

fields.$USERS.NAME_FIELD(0); // 'users.0.name'
fields.$USERS.EMAIL_FIELD(5); // 'users.5.email'
fields.$USERS.ELEMENT_AT(3); // 'users.3'
```

### Deeply Nested Arrays

Multiple array nesting levels require multiple index arguments, with each argument corresponding to its nesting depth.

```typescript
const fields = generateFields({
  orders: [
    {
      items: [
        {
          productId: 'productId',
          quantity: 'quantity',
        },
      ],
    },
  ],
});

// First argument: order index, Second argument: item index
fields.$ORDERS.$ITEMS.PRODUCT_ID_FIELD(0, 2);
// Result: 'orders.0.items.2.productId'
```

---

## API Reference

### `generateFields(schema)`

**Input:** Object schema where values are field names (strings), nested objects, or arrays.

**Output:** Generated field accessors with type safety.

#### Generated Properties

| Pattern            | Type                   | Example                     |
| ------------------ | ---------------------- | --------------------------- |
| `FIELD_NAME`       | `string`               | `EMAIL` → `'email'`         |
| `FIELD_NAME_FIELD` | `string` or `function` | `EMAIL_FIELD` → `'email'`   |
| `$NESTED`          | `object`               | Nested field accessors      |
| `KEY`              | `string`               | Original key name           |
| `PATH`             | `string` or `function` | Full path to field          |
| `AT`               | `function`             | Only listed object fields   |
|                    |                        | have this method to get     |
|                    |                        | object path from nested or  |
|                    |                        | list inside                 |
|                    |                        |                             |
| `ELEMENT_AT`       | `function`             | Only array fields has       |
|                    |                        | array fields to get array   |
|                    |                        | specific element like       |
|                    |                        | fields.$USERS.ELEMENT_AT(3) |
|                    |                        | provide path `users.3`      |

## Evaluation Strategies

The library provides two evaluation strategies, each optimized for different usage patterns.

### Eager Evaluation (Default)

Eager evaluation computes all field paths immediately during generation. This approach delivers optimal performance when accessing most or all fields in a schema.

**Characteristics:**

- All field paths computed at generation time
- Minimal overhead during field access
- Best performance for complete field access patterns
- Recommended for form libraries and validation schemas

**Usage:**

```typescript
import { generateFields } from '@glitchproof/form-field-generator';

const fields = generateFields({
  user: {
    profile: { name: 'name', email: 'email' },
  },
});
```

**Optimal Use Cases:**

- Form field registration requiring all paths
- Validation schemas accessing multiple fields
- Small to medium schemas (under 100 fields)
- Repeated access to the same fields

### Lazy Evaluation

Lazy evaluation defers field path computation until first access, caching results for subsequent requests. This strategy excels with large schemas where only a subset of fields require access.

**Characteristics:**

- Field paths computed on-demand
- Results cached after first access
- Lower initial memory footprint
- Best performance for sparse field access patterns

**Usage:**

```typescript
import { generateFields } from '@glitchproof/form-field-generator';

const fields = generateFields(
  {
    /* schema */
  },
  { lazy: true },
);
```

**Optimal Use Cases:**

- Large schemas (100+ fields)
- Accessing less than 20% of available fields
- Dynamic or conditional field access
- Deep nesting with selective field requirements

### Strategy Selection Guide

| Scenario                        | Recommended Strategy | Reasoning                                      |
| ------------------------------- | -------------------- | ---------------------------------------------- |
| Form with all fields visible    | Eager                | Access pattern covers entire schema            |
| Large dashboard with tabs       | Lazy                 | User views only active tab fields              |
| Validation of complete dataset  | Eager                | Validation requires all field paths            |
| Conditional field rendering     | Lazy                 | Subset of fields rendered per condition        |
| Small schemas (under 20 fields) | Eager                | Negligible performance difference              |
| Large schemas (100+ fields)     | Lazy                 | Significant memory and generation time savings |

### Explicit Strategy APIs

For scenarios requiring a fixed strategy regardless of configuration:

```typescript
import { generateFieldsEager, generateFieldsLazy } from '@glitchproof/form-field-generator';

// Explicitly eager
const eagerFields = generateFieldsEager(schema);

// Explicitly lazy
const lazyFields = generateFieldsLazy(schema);
```

---

## Configuration Options

### Lazy Evaluation Control

Toggle between eager and lazy evaluation strategies.

```typescript
const fields = generateFields(schema, {
  lazy: true, // Enable lazy evaluation
});
```

**Default:** `false` (eager evaluation)

### List Field Return Type

Control type precision for array field accessors.

```typescript
const fields = generateFields(schema, {
  listFieldsReturnType: 'exact',
});

// With 'exact': Type is literal string
fields.$USERS.NAME_FIELD(0); // Type: 'users.0.name'

// With 'default': Type is string
fields.$USERS.NAME_FIELD(0); // Type: string
```

**Options:**

- `'exact'`: Provides literal string types with precise paths
- `'default'`: Returns generic string type

**Default:** `'default'`

**Consideration:** The `'exact'` option increases type complexity. Use only when precise type information provides measurable value.

### Field Name Case Format

Customize the case transformation applied to field names.

```typescript
// SCREAMING_SNAKE_CASE (default)
const fields = generateFields(schema, {
  fieldNameCaseFormat: 'upper-snake-case',
});
fields.FIRST_NAME_FIELD; // Generated from 'firstName'

// snake_case
const fields = generateFields(schema, {
  fieldNameCaseFormat: 'snake-case',
});
fields.first_name_field; // Generated from 'firstName'

// No transformation
const fields = generateFields(schema, {
  fieldNameCaseFormat: 'no-case',
});
fields.firstName_field; // Preserves original case
```

**Options:**

- `'upper-snake-case'`: SCREAMING_SNAKE_CASE transformation
- `'snake-case'`: snake_case transformation
- `'no-case'`: Preserves original casing

**Default:** `'upper-snake-case'`

### Field Accessor Suffix

Customize the suffix appended to field path accessors.

```typescript
const fields = generateFields(schema, {
  fieldAccessorSuffix: '_path',
});

fields.EMAIL_PATH; // 'email'
fields.$USER.NAME_PATH; // 'user.name'
```

**Default:** `'_FIELD'`

**Note:** The suffix case automatically adjusts based on the selected field name case format.

### Combined Configuration

All options combine seamlessly for complete customization:

```typescript
const fields = generateFields(schema, {
  lazy: true,
  listFieldsReturnType: 'exact',
  fieldNameCaseFormat: 'snake-case',
  fieldAccessorSuffix: '_path',
});
```

---

## Integration Examples

### React Hook Form Integration

React Hook Form requires string paths for field registration and error access. Type-safe field generation eliminates manual path construction.

```typescript
import { useForm } from 'react-hook-form';
import { generateFields } from '@glitchproof/form-field-generator';

const formFields = generateFields({
  email: 'email',
  password: 'password',
  profile: {
    firstName: 'firstName',
    lastName: 'lastName',
    addresses: [{
      street: 'street',
      city: 'city',
      zipCode: 'zipCode',
    }],
  },
});

function RegistrationForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <form>
      <input {...register(formFields.EMAIL_FIELD)} />
      {errors[formFields.EMAIL] && (
        <span>Email address is required</span>
      )}

      <input {...register(formFields.PASSWORD_FIELD)} />

      <input {...register(formFields.$PROFILE.FIRST_NAME_FIELD)} />
      <input {...register(formFields.$PROFILE.LAST_NAME_FIELD)} />

      <input {...register(formFields.$PROFILE.$ADDRESSES.STREET_FIELD(0))} />
      <input {...register(formFields.$PROFILE.$ADDRESSES.CITY_FIELD(0))} />
      <input {...register(formFields.$PROFILE.$ADDRESSES.ZIP_CODE_FIELD(0))} />
    </form>
  );
}
```

**Benefits:**

- TypeScript catches field name changes during refactoring
- Autocomplete suggests available fields
- Consistent path construction across the application
- Reduced runtime errors from typos

### Schema Validation with Zod

Validation libraries like Zod require matching field names between schema and validation rules. Type-safe fields ensure consistency.

```typescript
import { z } from 'zod';
import { generateFields } from '@glitchproof/form-field-generator';

const userFields = generateFields({
  email: 'email',
  password: 'password',
  profile: {
    age: 'age',
    bio: 'bio',
  },
});

const validationSchema = z.object({
  [userFields.EMAIL]: z.string().email('Invalid email format'),
  [userFields.PASSWORD]: z.string().min(8, 'Minimum 8 characters required'),
  [userFields.$PROFILE.AGE]: z.number().min(18, 'Must be 18 or older'),
  [userFields.$PROFILE.BIO]: z.string().max(500).optional(),
});

// Type-safe validation
const result = validationSchema.parse(formData);
```

### Database Query Construction

Database query builders benefit from consistent field naming and path construction.

```typescript
import { generateFields } from '@glitchproof/form-field-generator';

const postFields = generateFields({
  id: 'id',
  title: 'title',
  content: 'content',
  author: {
    name: 'name',
    email: 'email',
  },
  tags: [
    {
      name: 'name',
      slug: 'slug',
    },
  ],
});

// Prisma query example
const posts = await prisma.post.findMany({
  select: {
    [postFields.ID]: true,
    [postFields.TITLE]: true,
    [postFields.$AUTHOR.NAME]: true,
  },
  where: {
    [postFields.$AUTHOR.EMAIL_FIELD]: 'user@example.com',
  },
  orderBy: {
    [postFields.ID]: 'desc',
  },
});
```

### State Management

State management libraries like Zustand or Redux require consistent property access patterns.

```typescript
import { create } from 'zustand';
import { generateFields } from '@glitchproof/form-field-generator';

const stateFields = generateFields({
  user: {
    profile: {
      name: 'name',
      email: 'email',
    },
    preferences: {
      theme: 'theme',
      language: 'language',
    },
  },
  session: {
    token: 'token',
    expiresAt: 'expiresAt',
  },
});

interface StoreState {
  [stateFields.$USER.KEY]: {
    profile: { name: string; email: string };
    preferences: { theme: string; language: string };
  };
  [stateFields.$SESSION.KEY]: {
    token: string | null;
    expiresAt: number | null;
  };
  updateUserName: (name: string) => void;
}

const useStore = create<StoreState>((set) => ({
  [stateFields.$USER.KEY]: {
    profile: { name: '', email: '' },
    preferences: { theme: 'light', language: 'en' },
  },
  [stateFields.$SESSION.KEY]: {
    token: null,
    expiresAt: null,
  },
  updateUserName: (name: string) =>
    set((state) => ({
      [stateFields.$USER.KEY]: {
        ...state[stateFields.$USER.KEY],
        profile: {
          ...state[stateFields.$USER.KEY].profile,
          [stateFields.$USER.$PROFILE.NAME]: name,
        },
      },
    })),
}));
```

### GraphQL Query Construction

GraphQL queries benefit from consistent field selection and nested field access.

```typescript
import { gql } from '@apollo/client';
import { generateFields } from '@glitchproof/form-field-generator';

const apiFields = generateFields({
  user: {
    id: 'id',
    email: 'email',
    posts: [
      {
        title: 'title',
        content: 'content',
        comments: [
          {
            text: 'text',
            author: 'author',
          },
        ],
      },
    ],
  },
});

const GET_USER_QUERY = gql`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      ${apiFields.$USER.ID}
      ${apiFields.$USER.EMAIL}
      posts {
        ${apiFields.$USER.$POSTS.TITLE}
        ${apiFields.$USER.$POSTS.CONTENT}
        comments {
          ${apiFields.$USER.$POSTS.$COMMENTS.TEXT}
          ${apiFields.$USER.$POSTS.$COMMENTS.AUTHOR}
        }
      }
    }
  }
`;
```

---

## Performance Characteristics

### Generation Performance

Performance measurements based on 1000+ iteration averages:

| Schema Size        | Operations/Second | Time per Operation | Classification |
| ------------------ | ----------------- | ------------------ | -------------- |
| Small (3 fields)   | 579,498           | 0.0017ms           | Negligible     |
| Medium (10 fields) | 157,046           | 0.0064ms           | Negligible     |
| Large (50+ fields) | 21,106            | 0.047ms            | Minimal        |

### Field Access Performance

| Access Pattern         | Operations/Second | Time per Operation | Classification |
| ---------------------- | ----------------- | ------------------ | -------------- |
| Simple field           | 23,951,282        | 0.00004ms          | Instant        |
| Nested field           | 24,297,187        | 0.00004ms          | Instant        |
| Array field            | 4,558,006         | 0.0002ms           | Instant        |
| Repeated access (100x) | 14,078,469        | 0.00007ms          | Instant        |

### Strategy Comparison

| Operation               | Eager           | Lazy            | Performance Delta |
| ----------------------- | --------------- | --------------- | ----------------- |
| Generation only         | 25,304 ops/sec  | 18,511 ops/sec  | Eager 37% faster  |
| Full field access       | 171,091 ops/sec | 68,303 ops/sec  | Eager 2.5x faster |
| Sparse access (1 field) | 10,674 ops/sec  | 17,499 ops/sec  | Lazy 64% faster   |
| Deep nesting generation | 210,160 ops/sec | 770,849 ops/sec | Lazy 3.7x faster  |

### Real-World Scenario Performance

| Scenario              | Operations/Second | Time per Operation | Typical Usage         |
| --------------------- | ----------------- | ------------------ | --------------------- |
| Form initialization   | 166,923           | 0.006ms            | React Hook Form setup |
| Validation checks     | 117,730           | 0.008ms            | Zod schema validation |
| Conditional rendering | 163,562           | 0.006ms            | Dynamic field display |

### Running Benchmarks

Execute the performance benchmark suite:

```bash
npm run bench
```

This command runs comprehensive performance tests across multiple scenarios and generates detailed reports.

---

## Best Practices

### Centralize Field Definitions

Maintain field definitions in dedicated modules for reusability and consistency across your application.

```typescript
// src/fields/user.fields.ts
export const UserFields = generateFields({
  id: 'id',
  email: 'email',
  profile: {
    firstName: 'firstName',
    lastName: 'lastName',
    dateOfBirth: 'dateOfBirth',
  },
});

// Usage across application
import { UserFields } from '@/fields/user.fields';
```

### Select Appropriate Evaluation Strategy

Choose evaluation strategies based on actual usage patterns rather than assumptions.

```typescript
// Small form with complete field access
const formFields = generateFields(schema);

// Large dashboard with tabbed sections
const dashboardFields = generateFields(largeSchema, { lazy: true });

// Conditional strategy selection
const fields = generateFields(schema, {
  lazy: Object.keys(schema).length > 100,
});
```

### Leverage Type Safety

Allow TypeScript to enforce correctness rather than relying on runtime checks.

```typescript
// Recommended: Type-safe approach
const emailPath = fields.$USER.EMAIL_FIELD;

// Not recommended: Defeats type safety
const emailPath = 'user.email';
```

### Combine with Validation Libraries

Integrate field definitions with validation schemas to maintain a single source of truth.

```typescript
const userFields = generateFields({
  email: 'email',
  password: 'password',
  age: 'age',
});

const validationSchema = z.object({
  [userFields.EMAIL]: z.string().email(),
  [userFields.PASSWORD]: z.string().min(8),
  [userFields.AGE]: z.number().min(18),
});

const form = useForm({
  resolver: zodResolver(validationSchema),
});

// Single definition used for both validation and field paths
<input {...register(userFields.EMAIL_FIELD)} />
```

### Avoid Over-Configuration

Use default options unless specific requirements necessitate customization.

```typescript
// Sufficient for most applications
const fields = generateFields(schema);

// Only customize when necessary
const fields = generateFields(schema, {
  fieldNameCaseFormat: 'snake-case', // Match existing codebase convention
});
```

---

## API Reference

### Core Functions

#### generateFields

Primary function for generating field accessors with optional strategy selection.

```typescript
function generateFields<T extends Dict>(
  schema: T,
  options?: {
    lazy?: boolean;
    listFieldsReturnType?: 'exact' | 'default';
    fieldNameCaseFormat?: 'upper-snake-case' | 'snake-case' | 'no-case';
    fieldAccessorSuffix?: `_${string}`;
  },
): GeneratedFields<T>;
```

**Parameters:**

- `schema`: Object defining field structure and names
- `options`: Optional configuration object

**Returns:** Generated field accessors with type information

#### generateFieldsEager

Explicitly generates fields using eager evaluation strategy.

```typescript
function generateFieldsEager<T extends Dict>(
  schema: T,
  options?: Omit<GenerateFieldsOptions, 'lazy'>,
): GeneratedFields<T>;
```

**Use Case:** Guarantees eager evaluation regardless of configuration.

#### generateFieldsLazy

Explicitly generates fields using lazy evaluation strategy.

```typescript
function generateFieldsLazy<T extends Dict>(
  schema: T,
  options?: Omit<GenerateFieldsOptions, 'lazy'>,
): GeneratedFields<T>;
```

**Use Case:** Guarantees lazy evaluation regardless of configuration.

### Generated Properties

Each field in the schema generates specific properties based on its type:

#### Simple Fields

```typescript
fields.FIELD_NAME; // Original field value
fields.FIELD_NAME_FIELD; // Field path accessor
```

#### Nested Objects

```typescript
fields.$OBJECT.KEY; // Object key name
fields.$OBJECT.PATH; // Path to object
fields.$OBJECT.FIELD_FIELD; // Nested field accessor
```

#### Arrays

```typescript
fields.$ARRAY.ELEMENT_AT(index); // Path to array element
fields.$ARRAY.FIELD_FIELD(index); // Path to field in array element
fields.$ARRAY.KEY; // Array key name
fields.$ARRAY.PATH; // Path to array
```

---

## TypeScript Support

### Type Inference

The library provides complete type inference without explicit type annotations.

```typescript
const fields = generateFields({
  user: {
    name: 'name',
    tags: [{ value: 'value' }],
  },
});

// TypeScript knows these exist
fields.$USER.NAME_FIELD; // Valid
fields.$USER.$TAGS.VALUE_FIELD(0); // Valid

// TypeScript catches these errors
fields.$USER.INVALID_FIELD; // Type error
fields.$USER.$TAGS.VALUE_FIELD(); // Type error: requires index
```

### Type Constraints

The library enforces several type-level constraints:

**Reserved Key Detection:**

```typescript
const fields = generateFields({
  key: 'key', // Type error: 'key' is reserved
  path: 'path', // Type error: 'path' is reserved
});
```

**Array Arity Checking:**

```typescript
// Nested arrays require correct number of indices
fields.$ORDERS.$ITEMS.PRODUCT_FIELD(0, 2); // Valid: 2 indices
fields.$ORDERS.$ITEMS.PRODUCT_FIELD(0); // Type error: requires 2 indices
```

### Compatibility

- **Minimum TypeScript version:** 4.5
- **Recommended TypeScript version:** 5.0+

---

## Troubleshooting

### Common Issues

**Issue: TypeScript displays `any` type**

**Cause:** Schema not marked as constant

**Solution:** Add `as const` assertion to schema

```typescript
const fields = generateFields({
  email: 'email',
} as const);
```

**Issue: "Expected N arguments" error on array field access**

**Cause:** Incorrect number of indices for nested array depth

**Solution:** Provide one index per array nesting level

```typescript
// Two levels of nesting require two indices
fields.$ORDERS.$ITEMS.PRODUCT_FIELD(orderIndex, itemIndex);
```

**Issue: Slow TypeScript compilation**

**Cause:** Excessive nesting depth or schema size

**Solutions:**

1. Reduce schema nesting depth
2. Split large schemas into smaller modules
3. Use type aliases for complex nested structures

**Issue: Generated paths not resolving correctly**

**Cause:** Using reserved keywords as field names

**Solution:** Avoid reserved keywords: `key`, `path`, `elementAt`, `at`, `KEY`, `PATH`, `ELEMENT_AT`, `AT`

---

## Package Information

### Bundle Characteristics

- **Dependencies:** Zero runtime dependencies
- **Tree-shaking:** Fully supported

### Module Formats

The package supports both ESM and CommonJS module systems:

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/esm/index.d.ts"
    }
  }
}
```

### Runtime Requirements

- **Node.js:** Version 18 or higher
- **Browser:** ES2022 support required
- **Bun:** Fully supported
- **Deno:** Fully supported

---

## Migration Guide

### From Manual String Paths

**Before:**

```typescript
const emailField = 'user.profile.email';
const addressField = (index: number) => `user.addresses.${index}.street`;

// Usage
<input {...register(emailField)} />
```

**After:**

```typescript
const fields = generateFields({
  user: {
    profile: { email: 'email' },
    addresses: [{ street: 'street' }],
  },
});

// Usage
<input {...register(fields.$USER.$PROFILE.EMAIL_FIELD)} />
```

### From Constant Objects

**Before:**

```typescript
export const FIELDS = {
  EMAIL: 'email',
  PROFILE_NAME: 'profile.name',
  ADDRESS_STREET: (index: number) => `addresses.${index}.street`,
};
```

**After:**

```typescript
export const FIELDS = generateFields({
  email: 'email',
  profile: { name: 'name' },
  addresses: [{ street: 'street' }],
});

// Access patterns
FIELDS.EMAIL_FIELD; // 'email'
FIELDS.$PROFILE.NAME_FIELD; // 'profile.name'
FIELDS.$ADDRESSES.STREET_FIELD(index); // 'addresses.0.street'
```

---

## Contributing

Contributions are welcome. Please follow these guidelines:

### Development Setup

```bash
git clone https://github.com/RashadNazarzade/field-generator.git
cd field-generator
bun install
```

### Running Tests

```bash
bun test           # Run test suite
bun test:watch     # Watch mode
bun test:coverage  # Generate coverage report
bun bench          # Run performance benchmarks
```

### Code Quality

Ensure code meets quality standards before submitting:

```bash
bun run type-check  # TypeScript validation
bun run format      # Code formatting
bun run validate    # Complete validation
```

### Contribution Requirements

1. Add tests for new functionality
2. Update TypeScript types as needed
3. Maintain existing code style
4. Update documentation for API changes
5. Ensure all tests and benchmarks pass

---

## License

MIT License - see LICENSE file for details

---

## Links

- **Repository:** [github.com/RashadNazarzade/field-generator](https://github.com/RashadNazarzade/field-generator)
- **Package:** [npmjs.com/package/@glitchproof/form-field-generator](https://www.npmjs.com/package/@glitchproof/form-field-generator)
- **Issues:** [github.com/RashadNazarzade/field-generator/issues](https://github.com/RashadNazarzade/field-generator/issues)
