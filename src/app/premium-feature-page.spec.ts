import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { routes } from './app.config';
import { PREMIUM_CONTACT_EMAIL, PREMIUM_FEATURES } from './site-data';
import premiumContent from './premium-feature-data.json';
import integrations from './premium-integration-data.json';

describe('Premium feature documentation', () => {
  for (const feature of PREMIUM_FEATURES) {
    it('renders the complete ' + feature.id + ' guide', async () => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/premium/' + feature.id);
      const root = harness.routeNativeElement!;
      const article = root.querySelector('[data-premium-feature="' + feature.id + '"]')!;
      const guide = premiumContent.find((item) => item.id === feature.id)!;
      expect(article).toBeTruthy();
      expect(article.querySelector('h1')?.textContent).toBe(feature.title);
      expect(article.querySelector('.badge.premium')?.textContent).toBe('Premium');
      expect(article.querySelector('app-premium-live-demo')).toBeTruthy();
      expect(article.querySelector('app-premium-live-demo img')).toBeNull();
      expect(article.querySelector('figcaption')).toBeNull();
      expect(article.querySelectorAll('#configuration dt').length).toBe(guide.configuration.length);
      expect(article.querySelectorAll('#integration li').length).toBe(0);
      expect(article.querySelectorAll('#behavior li').length).toBe(guide.behavior.length);
      expect(article.querySelectorAll('#boundaries li').length).toBe(guide.limits.length);
      expect(article.textContent).toContain('@wts-calendar/core/' + guide.module);
      expect(article.textContent).toContain(guide.entitlement);
      expect(article.querySelector('a[href^="mailto:"]')).toBeNull();
      expect(
        article.querySelector('#licensing button[aria-haspopup="dialog"]')?.textContent,
      ).toContain('Request a license');
      expect(article.textContent).not.toContain(PREMIUM_CONTACT_EMAIL);
      expect(article.querySelector('input,form,wts-calendar-angular,.wts-calender')).toBeNull();
      expect(article.querySelector('app-premium-live-demo iframe')).toBeNull();
      expect(article.querySelector('.premium-demo-host')).toBeTruthy();
      const integration = integrations.find((item) => item.id === feature.id)!;
      expect(
        article.querySelector('[data-code-kind="premium-integration"] code')?.textContent,
      ).not.toContain('connectCalendarLicense');
      expect(article.querySelector('[data-code-kind="premium-install"]')).toBeNull();
      expect(article.querySelector('[data-code-kind="premium-markup"]')).toBeNull();
      expect(article.querySelector('[data-code-kind="premium-styles"]')).toBeNull();
      expect(article.querySelectorAll('#integration .copy-code-button').length).toBe(1);
      expect(article.querySelector('#integration')?.textContent).not.toContain(
        'YOUR_WTS_LICENSE_KEY',
      );
      expect(article.querySelector('#integration')?.textContent).toContain(
        'Only the feature-specific setup is shown',
      );
      expect(
        article.querySelector('[data-code-kind="premium-integration"] code')?.textContent.length,
      ).toBeLessThan(integration.code.length);
      expect(article.querySelector('.premium-live-demo-header')).toBeNull();
      expect(article.querySelector('.premium-demo-note')).toBeNull();
      expect(article.querySelector('a[href="/pricing"]')).toBeNull();
      const selectedLink = root.querySelector('.premium-guide-navigation a[aria-current="page"]');
      expect(selectedLink?.getAttribute('href')).toBe('/premium/' + feature.id);
      expect(root.querySelectorAll('.premium-guide-navigation a').length).toBe(
        PREMIUM_FEATURES.length,
      );
    });
  }
  it('updates the guide and live demo when navigating between Premium features', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/premium/resource-grid');
    const first = harness.routeNativeElement;
    await harness.navigateByUrl('/premium/immutable-audit-history');
    expect(harness.routeNativeElement).toBe(first);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe(
      'Immutable audit history',
    );
    expect(harness.routeNativeElement?.querySelector('app-premium-live-demo img')).toBeNull();
    const code = harness.routeNativeElement?.querySelector(
      '[data-code-kind="premium-integration"] code',
    )?.textContent;
    expect(code).toContain('verifyAuditHistory');
    expect(code).not.toContain('resourceSchedulingModule');
    const configuration = harness.routeNativeElement?.querySelector(
      '.premium-section-links a',
    ) as HTMLAnchorElement;
    configuration.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/premium/immutable-audit-history#configuration');
  });
  it('rejects unknown or Standard feature slugs without falling back to pricing', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    for (const id of ['not-a-feature', 'month-daygrid']) {
      await harness.navigateByUrl('/premium/' + id);
      expect(harness.routeNativeElement?.textContent).toContain('PAGE NOT FOUND');
      expect(harness.routeNativeElement?.querySelector('[data-premium-feature]')).toBeNull();
    }
  });
});
