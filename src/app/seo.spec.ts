import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { legacyHashTarget } from './legacy-hash';
import { SEO_PAGES, SITE_ORIGIN, seoForUrl, structuredData } from './seo-data';
import { SeoService } from './seo.service';
import { DEMOS, PREMIUM_FEATURES } from './site-data';
import { appConfig } from './app.config';

describe('Clean URL routing', () => {
  it('uses path URLs in the real app configuration', () => {
    TestBed.configureTestingModule({ providers: [...appConfig.providers] });
    expect(TestBed.inject(LocationStrategy)).toBeInstanceOf(PathLocationStrategy);
  });
  it('keeps the default router free of hash fragments', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    expect(TestBed.inject(LocationStrategy).prepareExternalUrl('/docs')).not.toContain('#');
  });
  it('migrates existing bookmarks and merges query parameters', () => {
    expect(legacyHashTarget('#/docs')).toBe('/docs/');
    expect(legacyHashTarget('#/')).toBe('/');
    expect(legacyHashTarget('#/examples/list?period=day', '/', '?utm_source=old&period=year')).toBe(
      '/examples/list/?utm_source=old&period=day',
    );
    expect(legacyHashTarget('#/docs#api', '/wts-calendar-angular-example/')).toBe(
      '/wts-calendar-angular-example/docs/#api',
    );
  });
  it('ignores section anchors and prevents external redirects', () => {
    for (const hash of [
      '',
      '#api',
      '#//example.com/path',
      '#/\\example.com',
      '#https://example.com',
    ]) {
      expect(legacyHashTarget(hash)).toBeNull();
    }
    expect(legacyHashTarget('#/docs', '//example.com/')).toBeNull();
  });
});

describe('Portal SEO', () => {
  it('gives every public page distinct metadata', () => {
    expect(SEO_PAGES.length).toBe(DEMOS.length + PREMIUM_FEATURES.length + 9);
    expect(new Set(SEO_PAGES.map((page) => page.path)).size).toBe(SEO_PAGES.length);
    expect(new Set(SEO_PAGES.map((page) => page.title)).size).toBe(SEO_PAGES.length);
    expect(new Set(SEO_PAGES.map((page) => page.description)).size).toBe(SEO_PAGES.length);
    for (const page of SEO_PAGES) {
      expect(page.description.length).toBeGreaterThanOrEqual(60);
      expect(page.description.length).toBeLessThanOrEqual(250);
      expect(page.title).toContain('WTS Calendar');
    }
  });
  it('normalizes canonical paths and excludes query variants', () => {
    expect(seoForUrl('/docs').path).toBe('/docs/');
    expect(seoForUrl('/docs/api?query=timeZone').path).toBe('/docs/api/');
    expect(seoForUrl('/docs/api/server?query=If-Match').path).toBe('/docs/api/server/');
    expect(seoForUrl('/docs/?utm_source=share#api').path).toBe('/docs/');
    expect(seoForUrl('/examples/list?period=day').path).toBe('/examples/list/');
    expect(seoForUrl('/missing').noindex).toBe(true);
    expect(seoForUrl('/examples/premium-resource').noindex).toBe(true);
    expect(seoForUrl('/premium/not-a-feature').noindex).toBe(true);
    expect(seoForUrl('/premium/resource-grid#configuration').path).toBe('/premium/resource-grid/');
  });
  it('keeps structured data factual and aligned with each page', () => {
    for (const page of SEO_PAGES) {
      const serialized = JSON.stringify(structuredData(page));
      expect(serialized).toContain(SITE_ORIGIN + page.path);
      expect(serialized).not.toMatch(/"aggregateRating"|"review"|"price"/);
    }
  });
  it('updates metadata during SPA navigation without duplicates and clears 404 schema', () => {
    const seo = TestBed.inject(SeoService);
    for (const path of ['/docs', '/pricing', '/examples/month', '/docs?utm_source=test'])
      seo.update(path);
    expect(document.title).toBe(seoForUrl('/docs').title);
    expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      SITE_ORIGIN + '/docs/',
    );
    expect(document.head.querySelectorAll('#portal-structured-data').length).toBe(1);
    expect(document.head.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      SITE_ORIGIN + '/docs/',
    );
    seo.update('/missing');
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain(
      'noindex',
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('#portal-structured-data')).toBeNull();
    seo.update('/');
    expect(
      document.head.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).not.toContain('noindex');
  });
});
