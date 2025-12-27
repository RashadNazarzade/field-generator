import { describe, test, expect } from 'vitest';
import { pathGenerator } from '../utils/path-generator.js';

describe('pathGenerator', () => {
  test('should generate a path for a simple path string that is not listed', () => {
    const path = pathGenerator('user.name');
    expect(path).toBe('user.name');
  });

  test('should generate a path for a nested path string that is not listed', () => {
    const path = pathGenerator('user.profile.name');
    expect(path).toBe('user.profile.name');
  });

  test('should generate a path for a list path string that is listed', () => {
    const path = pathGenerator('users.#.name');
    expect(typeof path).toBe('function');
  });

  test('should generate a path for a nested list path string that is listed', () => {
    const path = pathGenerator('users.#.profile.#.name');
    expect(typeof path).toBe('function');
  });

  test('should return fallback path for path string not valid', () => {
    const path = pathGenerator('', 'users');
    expect(path).toBe('users');
  });
});
