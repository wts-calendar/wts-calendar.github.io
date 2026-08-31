import { copyFileSync, existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import {
  baseHref,
  buildRoot,
  directory,
  escapeHtml,
  indexFiles,
  parse,
  siteOrigin,
} from './pages-lib.mjs';

const urls = new Set();
let redirects = 0;
for (const file of indexFiles()) {
  const dom = parse(file);
  const document = dom.window.document;
  const refresh = document.querySelector('meta[http-equiv="refresh"]');
  if (refresh) {
    const match = refresh.content.match(/^0;\s*url=(.+)$/i);
    assert.ok(match, 'Unexpected prerendered redirect: ' + file);
    const target = new URL(match[1], siteOrigin);
    assert.equal(target.origin, siteOrigin, 'Off-site redirect in build');
    target.pathname = target.pathname.replace(/\/+$/, '') + '/';
    const canonicalPath =
      baseHref !== '/' && target.pathname.startsWith(baseHref)
        ? '/' + target.pathname.slice(baseHref.length)
        : target.pathname;
    const destination = target.pathname + target.search + target.hash;
    writeFileSync(
      file,
      '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>Redirecting | WTS Calendar</title><meta name="robots" content="noindex, follow">' +
        '<link rel="canonical" href="' +
        escapeHtml(siteOrigin + canonicalPath) +
        '">' +
        '<meta http-equiv="refresh" content="0; url=' +
        escapeHtml(destination) +
        '">' +
        '</head><body><p>This example has moved. <a href="' +
        escapeHtml(destination) +
        '">Continue to WTS Calendar</a>.</p></body></html>\n',
    );
    redirects++;
  } else {
    assert.equal(
      document.querySelector('base')?.getAttribute('href'),
      baseHref,
      'Incorrect Pages base',
    );
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    assert.ok(canonical?.startsWith(siteOrigin + '/'), 'Missing branded canonical: ' + file);
    if (!document.querySelector('meta[name="robots"]')?.content.includes('noindex'))
      urls.add(canonical);
  }
  dom.window.close();
}
assert.ok(urls.size > 4, 'Prerendered calendar examples are missing');
writeFileSync(
  join(directory, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...urls]
      .sort()
      .map((url) => '  <url><loc>' + escapeHtml(url) + '</loc></url>')
      .join('\n') +
    '\n</urlset>\n',
);
writeFileSync(
  join(directory, 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: ' + siteOrigin + '/sitemap.xml\n',
);
writeFileSync(
  join(directory, '404.html'),
  '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Page Not Found | WTS Calendar</title><meta name="robots" content="noindex, follow">' +
    '<meta name="description" content="This page is not available. Explore WTS Calendar documentation and examples.">' +
    '<style>body{margin:0;background:#f8fbf8;color:#193c33;font:18px/1.6 system-ui,sans-serif}' +
    'main{max-width:640px;margin:15vh auto;padding:32px}h1{font-size:48px;line-height:1.2}' +
    'a{color:#13685a;text-underline-offset:4px}nav{display:flex;gap:28px;flex-wrap:wrap}</style></head>' +
    '<body><main><p>WTS CALENDAR</p><h1>Page not found</h1><p>This address does not exist. Find documentation or explore the calendar examples.</p>' +
    '<nav aria-label="Find a page"><a href="' +
    baseHref +
    '">Home</a><a href="' +
    baseHref +
    'docs/">Documentation</a><a href="' +
    baseHref +
    'examples/month/">Examples</a></nav></main></body></html>\n',
);
copyFileSync(join(buildRoot, '3rdpartylicenses.txt'), join(directory, '3rdpartylicenses.txt'));
// This build-only fallback is not a public, indexable duplicate of the home page.
const csrFile = join(directory, 'index.csr.html');
if (existsSync(csrFile)) unlinkSync(csrFile);
console.log(
  'Prepared ' +
    urls.size +
    ' indexable pages, ' +
    redirects +
    ' legacy redirects, sitemap, robots and 404.',
);
