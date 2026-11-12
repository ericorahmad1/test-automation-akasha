import type { Page } from '@playwright/test';
import { FIRST_PARTY_HOSTS, KNOWN_THIRD_PARTY_NOISE } from '../config/sites';

/** Everything that went wrong in the browser while a test ran (the `errors` fixture). */
export interface CollectedErrors {
  pageErrors: string[];
  consoleErrors: string[];
  badResponses: { url: string; status: number; firstParty: boolean }[];
  failedRequests: { url: string; error: string; firstParty: boolean }[];
}

const RESOURCE_TYPES = ['document', 'script', 'stylesheet', 'image', 'fetch', 'xhr', 'font'];

export function isFirstParty(url: string) {
  try {
    return FIRST_PARTY_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

export const isKnownNoise = (msg: string) => KNOWN_THIRD_PARTY_NOISE.some((r) => r.test(msg));

/** Start listening before the first navigation. */
export function collectErrors(page: Page): CollectedErrors {
  const errors: CollectedErrors = { pageErrors: [], consoleErrors: [], badResponses: [], failedRequests: [] };

  page.on('pageerror', (e) => errors.pageErrors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.consoleErrors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && RESOURCE_TYPES.includes(r.request().resourceType())) {
      errors.badResponses.push({ url: r.url(), status: r.status(), firstParty: isFirstParty(r.url()) });
    }
  });
  page.on('requestfailed', (r) => {
    const error = r.failure()?.errorText ?? 'failed';
    if (/ERR_ABORTED|NS_BINDING_ABORTED/.test(error)) return; // navigation aborts are normal
    errors.failedRequests.push({ url: r.url(), error, firstParty: isFirstParty(r.url()) });
  });
  return errors;
}
