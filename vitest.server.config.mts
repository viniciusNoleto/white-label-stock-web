import { defineConfig } from 'vitest/config';

/**
 * Testes do servidor Express do web (src/server/**): proxy de /api e middleware
 * de sessão das páginas, contra uma API falsa. A API real (Laravel) tem a própria
 * suíte no white-label-stock-api. Os testes do Angular rodam pelo `ng test`.
 */
export default defineConfig({
  test: {
    name: 'server',
    environment: 'node',
    include: ['tests/server/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage/server',
      include: ['src/server/**/*.ts'],
    },
  },
});
