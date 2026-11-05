import { defineConfig, devices } from '@playwright/test';

/**
 * Vídeo de apresentação: um único teste longo que passa por todas as funcionalidades e grava a tela com o
 * `recordVideo` do Playwright. Roda isolado do ambiente de desenvolvimento:
 *
 * - API: container avulso do white-label-stock-api com o banco `<DB_DATABASE>_demo`, na porta DEMO_API_PORT
 *   (`tests/demo/support/demo-api.sh`). O teste recria esse banco do zero no começo.
 * - Web: o build de produção (`dist/`) servido pelo Express na porta DEMO_PORT, com proxy para a API acima.
 *
 *   npm run demo:video                     compila, sobe a API e o web e grava em videos/
 *   DEMO_SKIP_BUILD=1 npm run demo:video   reaproveita o último build
 *
 * Precisa do white-label-stock-api no ar (`make up` lá: o Postgres dele hospeda o banco de demonstração).
 */
const PORT = Number(process.env['DEMO_PORT'] ?? 3200);
const API_PORT = Number(process.env['DEMO_API_PORT'] ?? 8099);
const BASE_URL = `http://localhost:${PORT}`;

const build = process.env['DEMO_SKIP_BUILD'] ? '' : 'npx ng build && ';

export default defineConfig({
  testDir: 'tests/demo',
  testMatch: '**/*.demo.ts',
  outputDir: 'test-results-demo',
  globalTeardown: './tests/demo/support/global-teardown.ts',
  // A gravação inteira é um teste só.
  timeout: 20 * 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: BASE_URL,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    colorScheme: 'light',
    // Cada ação um pouco mais lenta, para ser acompanhada no vídeo.
    launchOptions: { slowMo: 60 },
    // Nenhuma ação espera para sempre: falha rápido e guarda a tela.
    actionTimeout: 15_000,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'bash tests/demo/support/demo-api.sh',
      url: `http://localhost:${API_PORT}/up`,
      reuseExistingServer: true,
      timeout: 300_000,
      stdout: 'ignore',
      stderr: 'pipe',
      env: { DEMO_API_PORT: String(API_PORT) },
    },
    {
      command: `${build}node dist/white-label-stock-web/server/server.mjs`,
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 300_000,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        PORT: String(PORT),
        API_URL: `http://localhost:${API_PORT}`,
        NG_ALLOWED_HOSTS: 'localhost,127.0.0.1',
      },
    },
  ],
});
