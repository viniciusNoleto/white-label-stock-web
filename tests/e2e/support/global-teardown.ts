import { cleanupE2EData } from './db';

export default async function globalTeardown() {
  await cleanupE2EData();
}
