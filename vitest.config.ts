import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['apps/**/*.ts', 'packages/**/*.ts'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
});
