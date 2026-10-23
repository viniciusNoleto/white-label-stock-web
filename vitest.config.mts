import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const root = import.meta.dirname;

const alias = {
  '@/src': root,
  '@': root,
  'server-only': path.resolve(root, './tests/support/stubs/server-only.ts'),
  'js-cookie': path.resolve(root, './tests/support/stubs/js-cookie.ts'),
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'libs/**/*.{ts,tsx}',
        'resources/**/*.{ts,tsx}',
        'shared/**/*.{ts,tsx,js}',
        'utils/**/*.{ts,tsx}',
        'db/schema/**/*.ts',
      ],
      // models/ and shared/types/ only declare TypeScript interfaces (no runtime code)
      exclude: ['**/*.d.ts', 'shared/types/**', 'components/form/types.ts', 'resources/*/models/**'],
      thresholds: {
        statements: 99,
        branches: 95,
        functions: 100,
        lines: 100,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['tests/unit/**/*.test.{ts,tsx}'],
          setupFiles: ['./tests/support/setup-unit.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'api',
          environment: 'node',
          include: ['tests/api/**/*.test.ts'],
          globalSetup: ['./tests/support/global-setup-api.ts'],
          setupFiles: ['./tests/support/setup-api.ts'],
          fileParallelism: false,
        },
      },
    ],
  },
});
