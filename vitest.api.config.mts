import { defineConfig } from 'vitest/config';

/**
 * Testes de integração da API (src/server/**) contra um Postgres real
 * (`${POSTGRES_DB}_test`). Os testes de componentes/utils do Angular rodam
 * pelo `ng test` (src/**\/*.spec.ts).
 */
export default defineConfig({
  test: {
    name: 'api',
    environment: 'node',
    include: ['tests/api/**/*.test.ts'],
    globalSetup: ['./tests/api/support/global-setup.ts'],
    setupFiles: ['./tests/api/support/setup.ts'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage/api',
      include: ['src/server/**/*.ts', 'db/schema/**/*.ts'],
    },
  },
});
