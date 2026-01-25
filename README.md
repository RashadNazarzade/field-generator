# TypeScript Fields Generator

**Type-safe field path generation for nested objects and arrays with zero runtime overhead.**

Eliminate string literal typos, maintain consistency during refactoring, and leverage TypeScript's type system for complete autocompletion.

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

## Why Use This?

Manual string paths are error-prone and break during refactoring:

```typescript
// ❌ Typos, no autocomplete, breaks on refactor
<input {...register('user.profile.firstName')} />
{errors['user.profile.firstName'] && <span>Error</span>}

// ✅ Type-safe, autocomplete, refactor-friendly
<input {...register(fields.$USER.$PROFILE.FIRST_NAME_FIELD)} />
{errors[fields.$USER.$PROFILE.FIRST_NAME_FIELD] && <span>Error</span>}
```

---

## Installation

```bash
npm install @glitchproof/form-field-generator
```

**Requirements:** TypeScript 4.5+, Node.js 18+

---

## Core Concepts

### Field Name Transformation

Fields transform to SCREAMING_SNAKE_CASE constants:

```typescript
const fields = generateFields({
  email: 'email-field',
  firstName: 'firstName',
});

fields.EMAIL_FIELD;       // 'email-field'
fields.FIRST_NAME_FIELD;  // 'firstName'
```

### Nested Objects

Nested objects get `$` prefix and include `KEY` and `PATH` properties:

```typescript
const fields = generateFields({
  user: {
    profile: { name: 'name', email: 'email' },
  },
});

fields.$USER.$PROFILE.NAME_FIELD;  // 'user.profile.name'
fields.$USER.KEY;                  // 'user'
fields.$USER.PATH;                 // 'user'
```

### Arrays

Array fields become functions accepting indices:

```typescript
const fields = generateFields({
  users: [{ name: 'name', email: 'email' }],
  orders: [[{ productId: 'productId' }]], // Nested arrays
});

fields.$USERS.NAME_FIELD(0);              // 'users.0.name'
fields.$USERS.ELEMENT_AT(3);              // 'users.3'
fields.$ORDERS.PRODUCT_ID_FIELD(0, 2);    // 'orders.0.2.productId'
```

---

## Configuration

### Lazy Evaluation

Defer computation until first access. Best for large schemas with sparse field usage:

```typescript
const fields = generateFields(schema, { lazy: true });
```

**Use lazy when:**
- Schema has 100+ fields
- Accessing < 20% of fields
- Deep nesting with selective access

**Use eager (default) when:**
- Accessing most fields
- Small schemas
- Form libraries needing all paths

### List Field Return Type

Control type precision for array accessors:

```typescript
const fields = generateFields(schema, {
  listFieldsReturnType: 'exact', // literal: 'users.0.name' this is need more process in typescript usage
  // or 'default' (default)        // `users.${number}.name`
});
```

### Field Name Format

Customize casing and suffix:

```typescript
const fields = generateFields(schema, {
  fieldNameCaseFormat: 'snake-case',     // Options: 'upper-snake-case', 'snake-case', 'no-case'
  fieldAccessorSuffix: '_path',          // Default: '_FIELD'
});

fields.first_name_path; // 'firstName'
```

---

## Integration Examples

### React Hook Form

```typescript
import { useForm } from 'react-hook-form';

const fields = generateFields({
  email: 'email',
  profile: {
    firstName: 'firstName',
    addresses: [{ street: 'street', city: 'city' }],
  },
});

function Form() {
  const { register, formState: { errors } } = useForm();

  return (
    <form>
      <input {...register(fields.EMAIL_FIELD)} />
      {errors[fields.EMAIL] && <span>Required</span>}
      
      <input {...register(fields.$PROFILE.FIRST_NAME_FIELD)} />
      <input {...register(fields.$PROFILE.$ADDRESSES.STREET_FIELD(0))} />
    </form>
  );
}
```

### Zod Validation

```typescript
import { z } from 'zod';

const fields = generateFields({
  email: 'email',
  password: 'password',
  profile: { age: 'age' },
});

const schema = z.object({
  [fields.EMAIL]: z.string().email(),
  [fields.PASSWORD]: z.string().min(8),
  [fields.$PROFILE.AGE]: z.number().min(18),
});
```

## API Reference

### Core Functions

#### `generateFields(schema, options?)`

The primary function that generates type-safe field accessors from your schema. Supports both eager and lazy evaluation strategies.

```typescript
function generateFields<T extends Dict>(
  schema: T,
  options?: {
    lazy?: boolean;
    listFieldsReturnType?: 'exact' | 'default';
    fieldNameCaseFormat?: 'upper-snake-case' | 'snake-case' | 'no-case';
    fieldAccessorSuffix?: `_${string}`;
  }
): GeneratedFields<T>
```

**Parameters:**
- `schema` — Your data structure definition. Use `as const` for full type inference.
- `options.lazy` — When `true`, computes paths on-demand. Default: `false`
- `options.listFieldsReturnType` — `'exact'` returns literal types, `'default'` returns string. Default: `'default'`
- `options.fieldNameCaseFormat` — Transform field names to specified case. Default: `'upper-snake-case'`
- `options.fieldAccessorSuffix` — Customize the suffix for field paths. Default: `'_FIELD'`

**Example:**

```typescript
const fields = generateFields({
  email: 'email',
  user: { profile: { name: 'name' } }
}, { lazy: true });
```

#### `generateFieldsEager(schema, options?)`

Explicitly uses eager evaluation, computing all paths immediately at generation time. Recommended for small-to-medium schemas where most fields will be accessed.

```typescript
function generateFieldsEager<T extends Dict>(
  schema: T,
  options?: Omit<GenerateFieldsOptions, 'lazy'>
): GeneratedFields<T>
```

**Example:**

```typescript
const fields = generateFieldsEager({
  firstName: 'firstName',
  lastName: 'lastName'
});
```

#### `generateFieldsLazy(schema, options?)`

Explicitly uses lazy evaluation, deferring path computation until first access. Optimal for large schemas with selective field access patterns.

```typescript
function generateFieldsLazy<T extends Dict>(
  schema: T,
  options?: Omit<GenerateFieldsOptions, 'lazy'>
): GeneratedFields<T>
```

**Example:**

```typescript
const fields = generateFieldsLazy(largeSchema); // 100+ fields
```

---

### Generated Field Properties

The library generates different properties based on the field type in your schema:

#### Simple Fields

For primitive field values, two properties are generated:

```typescript
const fields = generateFields({
  email: 'email',
  firstName: 'firstName'
});

fields.EMAIL;            // 'email' — Direct value access
fields.EMAIL_FIELD;      // 'email' — Path accessor
fields.FIRST_NAME;       // 'firstName'
fields.FIRST_NAME_FIELD; // 'firstName'
```

**Use cases:**
- `FIELD_NAME`: For object keys, dynamic access, property names
- `FIELD_NAME_FIELD`: For form registration, validation paths, query strings

#### Nested Object Fields

Nested objects receive a `$` prefix and include structural properties:

```typescript
const fields = generateFields({
  user: {
    profile: { name: 'name', email: 'email' }
  }
});

fields.$USER.KEY;                    // 'user' — Original key name
fields.$USER.PATH;                   // 'user' — Full path to this object
fields.$USER.$PROFILE.NAME_FIELD;    // 'user.profile.name' — Nested field path
fields.$USER.$PROFILE.EMAIL_FIELD;   // 'user.profile.email'
```

**Properties:**
- `KEY`: Returns the original object key name from your schema
- `PATH`: Returns the full dot-notation path to this nested object

#### Array Fields

Array fields become functions that accept index arguments:

```typescript
const fields = generateFields({
  users: [{ name: 'name', email: 'email' }]
});

fields.$USERS.NAME_FIELD(0);   // 'users.0.name' — Field at specific index
fields.$USERS.EMAIL_FIELD(5);  // 'users.5.email'
fields.$USERS.ELEMENT_AT(3);   // 'users.3' — Array element path
fields.$USERS.KEY;             // 'users' — Array field name
fields.$USERS.PATH;            // 'users' — Path to array
```

**Properties:**
- `FIELD_NAME(index)`: Returns path to field at specified array index
- `ELEMENT_AT(index)`: Returns path to the array element itself
- `KEY`: Original array field name
- `PATH`: Full path to the array

#### Deeply Nested Arrays

For arrays within arrays, provide one index per nesting level:

```typescript
const fields = generateFields({
  orders: [{
    items: [{ productId: 'productId', quantity: 'quantity' }]
  }]
});

// Syntax: FIELD_NAME(level1Index, level2Index, ...)
fields.$ORDERS.$ITEMS.PRODUCT_ID_FIELD(0, 2);  // 'orders.0.items.2.productId'
fields.$ORDERS.$ITEMS.QUANTITY_FIELD(1, 3);    // 'orders.1.items.3.quantity'
fields.$ORDERS.ELEMENT_AT(2);                   // 'orders.2'
```

**Rule:** Number of indices must match array nesting depth

#### Object Inside Arrays

Access nested objects within array elements:

```typescript
const fields = generateFields({
  users: [{
    profile: { name: 'name', avatar: 'avatar' },
    settings: { theme: 'theme' }
  }]
});

fields.$USERS.$PROFILE.NAME_FIELD(0);      // 'users.0.profile.name'
fields.$USERS.$SETTINGS.THEME_FIELD(2);    // 'users.2.settings.theme'
fields.$USERS.$PROFILE.AT(1);              // 'users.1.profile' — Object path
```

**Special Property:**
- `AT(index)`: Returns the path to the nested object at the specified index

---

### Property Reference Table

Quick reference for all generated properties:

| Property           | Context        | Type       | Returns                                    | Example                                       |
| ------------------ | -------------- | ---------- | ------------------------------------------ | --------------------------------------------- |
| `FIELD_NAME`       | Simple field   | `string`   | Field value                                | `EMAIL` → `'email'`                           |
| `FIELD_NAME_FIELD` | Simple field   | `string`   | Field path                                 | `EMAIL_FIELD` → `'email'`                     |
| `$NESTED`          | Nested object  | `object`   | Accessor for nested structure              | `$USER.$PROFILE`                              |
| `KEY`              | Objects/Arrays | `string`   | Original key name                          | `$USER.KEY` → `'user'`                        |
| `PATH`             | Objects/Arrays | `string`   | Full path to field                         | `$USER.PATH` → `'user'`                       |
| `ELEMENT_AT`       | Arrays         | `function` | Path to array element                      | `$USERS.ELEMENT_AT(0)` → `'users.0'`          |
| `AT`               | Nested in list | `function` | Path to nested object at index             | `$USERS.$PROFILE.AT(0)` → `'users.0.profile'` |
| `FIELD_NAME(idx)`  | Array fields   | `function` | Path to field at index                     | `$USERS.NAME_FIELD(0)` → `'users.0.name'`     |

---

## Performance

| Scenario                | Operations/sec | Time/Operation | Strategy    |
| ----------------------- | -------------- | -------------- | ----------- |
| Small schema (3 fields) | 579,498        | 0.0017ms       | Negligible  |
| Large schema (50+)      | 21,106         | 0.047ms        | Minimal     |
| Simple field access     | 23,951,282     | 0.00004ms      | Instant     |
| Array field access      | 4,558,006      | 0.0002ms       | Instant     |
| Full access             | 171,091 (eager) | 0.006ms       | Eager 2.5x  |
| Sparse access (1 field) | 17,499 (lazy)  | 0.057ms        | Lazy 64%    |

Run benchmarks: `bun run bench`

---

## Troubleshooting

**TypeScript shows `any` type?**  
Add `as const` to schema:
```typescript
const fields = generateFields({ email: 'email' } as const);
```

**"Expected N arguments" error?**  
Nested arrays need one index per level:
```typescript
fields.$ORDERS.$ITEMS.FIELD(orderIdx, itemIdx); // 2 levels = 2 indices
```

**Slow compilation?**  
- Reduce nesting depth
- Split large schemas into modules
- Use type aliases

---

## Migration

**From manual strings:**

```typescript
// Before
const email = 'user.profile.email';
<input {...register(email)} />

// After
const fields = generateFields({ user: { profile: { email: 'email' } } });
<input {...register(fields.$USER.$PROFILE.EMAIL_FIELD)} />
```

---

## Contributing

```bash
git clone https://github.com/RashadNazarzade/field-generator.git
cd field-generator
bun install

bun test           # Run tests
bun bench          # Benchmarks
bun run validate   # Full validation
```

**Requirements:**
- Add tests for new features
- Maintain code style
- Update docs for API changes

---

## Links

- **Repository:** [github.com/RashadNazarzade/field-generator](https://github.com/RashadNazarzade/field-generator)
- **Package:** [npmjs.com/package/@glitchproof/form-field-generator](https://www.npmjs.com/package/@glitchproof/form-field-generator)
- **Issues:** [github.com/RashadNazarzade/field-generator/issues](https://github.com/RashadNazarzade/field-generator/issues)

---

## License

MIT License - see LICENSE file for details

