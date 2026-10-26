import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config({ path: '.env', quiet: true });

const baseURL = process.env['APP_URL'] ?? `http://localhost:${process.env['APP_PORT'] ?? 3005}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './tests/e2e/support/global-setup.ts',
  globalTeardown: './tests/e2e/support/global-teardown.ts',
  use: {
    baseURL,
    locale: 'pt-BR',
    storageState: './tests/e2e/.auth/state.json',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // o app roda no Docker (ver Makefile); só sobe quando ainda não está no ar
    command: 'make up',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
