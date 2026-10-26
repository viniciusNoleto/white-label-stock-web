import { chromium, type FullConfig } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { cleanupE2EData, createE2EUser, E2E_USER } from './db';

/** Limpa dados antigos, cria o usuário e2e e salva a sessão (cookies httpOnly) para os testes. */
export default async function globalSetup(config: FullConfig) {
  await cleanupE2EData();
  await createE2EUser();

  const { baseURL, storageState } = config.projects[0].use;

  mkdirSync('./tests/e2e/.auth', { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  const response = await page.request.post('/api/auth/login', { data: { email: E2E_USER.email, password: E2E_USER.password } });
  if (!response.ok()) throw new Error(`e2e login failed: ${response.status()}`);

  await page.context().storageState({ path: storageState as string });
  await browser.close();
}
