import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/unit/**/*.test.ts'],
    exclude: ['src/tests/performance/**/*.bench.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/tests/unit/**/*.test.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/__tests__',
        'src/**/__mocks__',
        'src/types/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    benchmark: {
      include: ['src/tests/performance/**/*.bench.ts'],
    },
    typecheck: {
      enabled: true,
      include: ['src/tests/unit/**/*.test-d.ts'],
      exclude: ['src/tests/performance/**/*', '**/*.bench.ts', '**/*.bench.tsx'],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
