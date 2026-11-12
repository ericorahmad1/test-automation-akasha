import type { APIRequestContext } from '@playwright/test';
import { FIRST_PARTY_HOSTS, FLOW_HOSTS } from '../config/sites';
import { firstLine } from './text';

export interface LinkStatus {
  status: number; // 0 = network error
  finalUrl: string;
  error?: string;
}

/** Only Akasha + booking links are checked (set CHECK_EXTERNAL=1 to check every link). */
export function shouldCheckLink(href: string) {
  if (!/^https?:/i.test(href)) return false;
  if (process.env.CHECK_EXTERNAL === '1') return true;
  const host = new URL(href).hostname;
  return FIRST_PARTY_HOSTS.includes(host) || FLOW_HOSTS.some((h) => host === h || host.endsWith('.' + h));
}

/** Cached per worker: the same footer link on 200 pages is requested once. */
const cache = new Map<string, Promise<LinkStatus>>();

export function checkLink(request: APIRequestContext, href: string): Promise<LinkStatus> {
  const url = href.split('#')[0];
  let result = cache.get(url);
  if (!result) {
    result = fetchStatus(request, url);
    cache.set(url, result);
  }
  return result;
}

async function fetchStatus(request: APIRequestContext, url: string): Promise<LinkStatus> {
  const options = { maxRedirects: 10, timeout: 30_000, failOnStatusCode: false };
  try {
    const res = await request.get(url, options);
    return { status: res.status(), finalUrl: res.url() };
  } catch (e) {
    // Large files (PDF brochures, videos) can abort a GET: confirm with HEAD before reporting.
    try {
      const res = await request.head(url, options);
      return { status: res.status(), finalUrl: res.url() };
    } catch {
      return { status: 0, finalUrl: url, error: firstLine((e as Error).message) };
    }
  }
}
