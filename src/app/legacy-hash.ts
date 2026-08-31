/** Resolve old hash-router bookmarks without permitting off-site redirects. */
export function legacyHashTarget(hash: string, basePath = '/', outerSearch = ''): string | null {
  if (!hash.startsWith('#/') || hash.startsWith('#//') || hash.includes('\\')) return null;
  const origin = 'https://wts-calendar.invalid';
  const target = new URL(hash.slice(1), origin);
  if (target.origin !== origin || !basePath.startsWith('/') || basePath.startsWith('//'))
    return null;
  const query = new URLSearchParams(outerSearch);
  target.searchParams.forEach((value, key) => query.set(key, value));
  const path = target.pathname.replace(/\/+$/, '') + '/';
  const search = query.toString();
  return basePath.replace(/\/+$/, '') + path + (search ? '?' + search : '') + target.hash;
}
