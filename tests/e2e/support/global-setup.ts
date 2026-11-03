import { chromium, type FullConfig } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { cleanupE2EData, createE2EUser } from './db';
import { signIn } from './helpers';

/** Limpa dados antigos, cria o usuário e2e e salva a sessão (cookies com os tokens) para os testes. */
export default async function globalSetup(config: FullConfig) {
  await cleanupE2EData();
  await createE2EUser();

  const { baseURL, storageState } = config.projects[0].use;

  mkdirSync('./tests/e2e/.auth', { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await signIn(page.context(), baseURL as string);

  await page.context().storageState({ path: storageState as string });
  await browser.close();
}
