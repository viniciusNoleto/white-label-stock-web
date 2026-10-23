import { cleanupE2EData } from './db';

export default async function globalSetup() {
  await cleanupE2EData();
}
