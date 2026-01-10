import { isListed } from '@/utils';
import { describe, expect, test } from 'vitest';

describe('isListed', () => {
  test('should return true if the path is listed', () => {
    const path = 'users.#.name';
    expect(isListed(path)).toBe(true);
  });

  test('should return false if the path is not listed', () => {
    const path = 'users.name';
    expect(isListed(path)).toBe(false);
  });

  test('should return true if the path is listed with a dot', () => {
    const path = 'users.#';
    expect(isListed(path)).toBe(true);
  });
});
