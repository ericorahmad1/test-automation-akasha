/** First line of an error message, without terminal colour codes. */
export function firstLine(message: string, max = 300) {
  // eslint-disable-next-line no-control-regex
  return message.replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0].slice(0, max);
}

/** Turn a console/JS error into a stable grouping key (strip ids, query strings, numbers). */
export function normalizeMessage(msg: string) {
  return msg
    .replace(/https?:\/\/([^/\s'"]+)[^\s'"]*/g, 'https://$1/…')
    .replace(/[0-9a-f]{8,}/gi, '…')
    .replace(/\d{3,}/g, 'N')
    .slice(0, 160);
}

/** "$1,250.00 USD" → "1,250.00": used to compare prices shown in different places. */
export const moneyDigits = (s: string | null | undefined) => (s ?? '').replace(/[^\d.,]/g, '');

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Path without trailing slash ("/" for the homepage). */
export const pathOf = (url: string) => new URL(url).pathname.replace(/\/$/, '') || '/';
