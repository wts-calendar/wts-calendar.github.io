import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { baseHref, directory, indexFiles, parse, siteOrigin } from './pages-lib.mjs';

const titles = new Set();
const canonicals = new Set();
const premiumIds = new Set(
  JSON.parse(
    readFileSync(new URL('../src/app/premium-feature-data.json', import.meta.url), 'utf8'),
  ).map((feature) => feature.id),
);
const premiumPages = new Set();
let redirects = 0;
for (const file of indexFiles()) {
  const dom = parse(file);
  const document = dom.window.document;
  const route = relative(directory, dirname(file)).replaceAll('\\', '/');
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  if (document.querySelector('meta[http-equiv="refresh"]')) {
    assert.match(document.querySelector('meta[name="robots"]')?.content ?? '', /noindex/);
    assert.ok(canonical?.startsWith(siteOrigin + '/'));
    redirects++;
    dom.window.close();
    continue;
  }
  assert.equal(
    document.querySelector('base')?.getAttribute('href'),
    baseHref,
    'Incorrect Pages base',
  );
  assert.equal(
    canonical,
    siteOrigin + '/' + (route ? route + '/' : ''),
    'Incorrect canonical: ' + route,
  );
  assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
  assert.ok(!titles.has(document.title), 'Duplicate page title: ' + route);
  titles.add(document.title);
  canonicals.add(canonical);
  const description = document.querySelector('meta[name="description"]')?.content;
  assert.ok(
    description?.length >= 60 && description.length <= 250,
    'Missing/oversized description: ' + route,
  );
  assert.ok(
    document.querySelector('main h1')?.textContent.trim(),
    'Missing prerendered heading: ' + route,
  );
  assert.ok(
    document.querySelector('main')?.textContent.trim().length > 100,
    'Missing prerendered content: ' + route,
  );
  assert.ok(!document.querySelector('meta[name="robots"]')?.content.includes('noindex'));
  if (route.startsWith('premium/')) {
    const id = route.slice('premium/'.length);
    assert.ok(premiumIds.has(id), 'Unexpected Premium route: ' + route);
    premiumPages.add(id);
    const article = document.querySelector('[data-premium-feature="' + id + '"]');
    assert.ok(article, 'Missing feature-specific guide: ' + route);
    assert.equal(
      article.querySelector('.premium-feature-figure img')?.getAttribute('src'),
      'previews/premium/' + id + '.jpg',
    );
    assert.ok(article.querySelector('.premium-feature-figure img')?.getAttribute('alt'));
    for (const section of ['configuration', 'integration', 'behavior', 'boundaries', 'licensing'])
      assert.ok(
        article.querySelector('#' + section)?.textContent.trim().length > 60,
        'Empty Premium section: ' + route + '#' + section,
      );
    assert.ok(
      !article.querySelector('wts-calendar-angular,.wts-calender,input,form'),
      'Premium runtime or credential form: ' + route,
    );
    assert.ok(
      article
        .querySelector('#integration pre[data-code-kind="premium-integration"] code')
        ?.textContent.includes('YOUR_WTS_LICENSE_KEY'),
      'Missing static integration code: ' + route,
    );
    assert.ok(
      article.querySelector('#integration button.copy-code-button'),
      'Missing integration copy button: ' + route,
    );
    assert.ok(
      article.querySelector('a[href^="mailto:"]'),
      'Missing email-only license contact: ' + route,
    );
    assert.ok(
      !article.querySelector('a[href$="/pricing"]'),
      'Premium guide must not redirect users to pricing: ' + route,
    );
  }
  for (const card of document.querySelectorAll('.feature-card[data-tier="Premium"]')) {
    assert.ok(card.querySelector('img.feature-preview'), 'Premium card needs a package screenshot');
    assert.ok(
      card
        .querySelector('a')
        ?.getAttribute('href')
        .startsWith(baseHref + 'premium/'),
      'Premium card needs a documentation route',
    );
  }
  assert.equal(document.querySelector('meta[property="og:url"]')?.content, canonical);
  assert.equal(document.querySelector('meta[property="og:title"]')?.content, document.title);
  assert.equal(document.querySelector('meta[name="twitter:card"]')?.content, 'summary_large_image');
  assert.equal(
    document.querySelector('meta[property="og:image"]')?.content,
    siteOrigin + '/social-preview.png',
  );
  const schemas = document.querySelectorAll('script[type="application/ld+json"]');
  assert.equal(schemas.length, 1, 'Missing/duplicate structured data: ' + route);
  const schema = JSON.parse(schemas[0].textContent);
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@graph'].find((item) => item['@type'] === 'WebPage')?.url, canonical);
  assert.ok(
    !/"aggregateRating"|"review"|"price"/.test(schemas[0].textContent),
    'Unverified commercial schema',
  );
  for (const link of document.querySelectorAll('a[href]')) {
    const href = link.getAttribute('href');
    assert.ok(!href.startsWith('#/'), 'Hash-router link remains: ' + route);
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    assert.ok(href.startsWith(baseHref), 'Internal link escapes the deployment base: ' + href);
    const localPath = new URL(href, siteOrigin).pathname.slice(baseHref.length).replace(/\/+$/, '');
    assert.ok(
      existsSync(join(directory, localPath, 'index.html')),
      'Internal link has no static page: ' + href,
    );
  }
  for (const asset of document.querySelectorAll(
    'script[src],link[rel="stylesheet"],link[rel="icon"],img[src]',
  )) {
    const value = asset.getAttribute('src') ?? asset.getAttribute('href');
    if (/^(?:https?:|data:)/.test(value)) continue;
    const path = new URL(value, siteOrigin + baseHref).pathname.slice(baseHref.length);
    assert.ok(existsSync(join(directory, path)), 'Missing asset: ' + value);
  }
  dom.window.close();
}
assert.ok(canonicals.size > 4, 'Examples were not prerendered');
assert.deepEqual(premiumPages, premiumIds, 'Every Premium feature must have a prerendered guide');
assert.equal(redirects, 5, 'Example-index and four old List routes must remain reachable');
const sitemap = new JSDOM(readFileSync(join(directory, 'sitemap.xml'), 'utf8'), {
  contentType: 'text/xml',
});
const locations = [...sitemap.window.document.querySelectorAll('loc')].map(
  (item) => item.textContent,
);
assert.deepEqual(new Set(locations), canonicals, 'Sitemap does not match canonical pages');
assert.equal(locations.length, canonicals.size, 'Duplicate sitemap entries');
sitemap.window.close();
assert.match(
  readFileSync(join(directory, 'robots.txt'), 'utf8'),
  /Sitemap: https:\/\/wts-calendar.github.io\/sitemap.xml/,
);
assert.ok(existsSync(join(directory, '.nojekyll')));
assert.ok(existsSync(join(directory, '3rdpartylicenses.txt')));
assert.ok(!existsSync(join(directory, 'index.csr.html')));
const notFound = parse(join(directory, '404.html'));
assert.match(
  notFound.window.document.querySelector('meta[name="robots"]')?.content ?? '',
  /noindex/,
);
notFound.window.close();
const image = readFileSync(join(directory, 'social-preview.png'));
assert.equal(image.subarray(1, 4).toString(), 'PNG');
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
console.log(
  'Verified ' +
    canonicals.size +
    ' prerendered SEO pages, clean links, redirects, sitemap, assets and social preview.',
);
