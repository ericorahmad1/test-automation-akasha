/**
 * Global setup: refuse to start when another test run is already active in this folder.
 * Two parallel runs overwrite each other's data/urls.json, test-results/ and reports/.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const LOCK = '.qa-run.lock';

function isAlive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export default function globalSetup() {
  if (existsSync(LOCK)) {
    const pid = Number(readFileSync(LOCK, 'utf8'));
    if (pid && pid !== process.pid && isAlive(pid)) {
      throw new Error(
        `Another test run is already active (pid ${pid}). Wait for it to finish, ` +
          `or delete ${LOCK} if that process is gone.`,
      );
    }
  }
  writeFileSync(LOCK, String(process.pid));
  return () => rmSync(LOCK, { force: true });
}
