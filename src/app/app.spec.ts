import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { routes } from './app.config';
import { CalendarDemo } from './calendar-demo';
import { FeaturesPage } from './features-page';
import { PricingPage } from './pricing-page';
import {
  DEMOS,
  LIST_VIEWS,
  FEATURES,
  LICENSE_REQUEST,
  PREMIUM_CONTACT_EMAIL,
  PREMIUM_PREVIEWS,
} from './site-data';

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as typeof ResizeObserver;
});

describe('Showcase contract', () => {
  it('keeps configuration migration available under Premium', () => {
    const migration = FEATURES.find(
      (feature) => feature.title === 'Configuration migration assistant',
    );
    expect(migration?.tier).toBe('Premium');
    expect(migration?.demo).toBeUndefined();
  });
  it('has unique IDs and only valid free demo links', () => {
    expect(DEMOS.filter((demo) => demo.view.startsWith('list')).map((demo) => demo.id)).toEqual([
      'list',
    ]);
    expect(new Set(DEMOS.map((d) => d.id)).size).toBe(DEMOS.length);
    expect(new Set(FEATURES.map((f) => f.id)).size).toBe(FEATURES.length);
    for (const feature of FEATURES) {
      if (feature.demo) expect(DEMOS.some((d) => d.id === feature.demo)).toBe(true);
      if (feature.tier === 'Premium') {
        expect(feature.demo).toBeUndefined();
        expect(feature.guide).toBeUndefined();
      }
    }
  });
  it('provides static previews for each premium category', () => {
    for (const feature of FEATURES.filter((f) => f.tier === 'Premium')) {
      expect(PREMIUM_PREVIEWS[feature.group]?.src).toMatch(/^previews\/.+\.svg$/);
    }
  });
  it('never uses a public issue tracker for a license request', () => {
    if (PREMIUM_CONTACT_EMAIL)
      expect(LICENSE_REQUEST).toBe(
        'mailto:' + PREMIUM_CONTACT_EMAIL + '?subject=WTS%20Calendar%20premium%20license%20request',
      );
    else expect(LICENSE_REQUEST).toBe('');
  });
});

describe('Feature catalogue', () => {
  it('renders premium badges with pricing links, no demos or source', async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(FeaturesPage);
    fixture.detectChanges();
    fixture.componentInstance.tier.set('Premium');
    fixture.detectChanges();
    const cards = [...fixture.nativeElement.querySelectorAll('.feature-card')] as HTMLElement[];
    expect(cards.length).toBe(FEATURES.filter((f) => f.tier === 'Premium').length);
    for (const card of cards) {
      expect(card.querySelector('.badge.premium')).toBeTruthy();
      expect(card.querySelector('a')?.getAttribute('href')).toBe('/pricing');
      expect(card.querySelector('pre, code, wts-calendar-angular')).toBeNull();
    }
    expect(fixture.nativeElement.querySelectorAll('.premium-preview img').length).toBe(3);
  });
  it('supports combined filters and empty-state reset', async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(FeaturesPage);
    fixture.componentInstance.query.set('RRULE');
    fixture.componentInstance.tier.set('Free');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.feature-card').length).toBe(1);
    fixture.componentInstance.group.set('Enterprise workflow');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No matching features');
    fixture.componentInstance.reset();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.feature-card').length).toBe(FEATURES.length);
    expect(
      fixture.nativeElement.querySelectorAll('.feature-card[data-tier="Free"] .badge').length,
    ).toBe(0);
    expect(fixture.nativeElement.textContent).not.toMatch(/\bfree\b/i);
  });
});

describe('Free examples', () => {
  for (const demo of DEMOS) {
    it('mounts ' + demo.id + ' using the published calendar', async () => {
      await TestBed.configureTestingModule({ imports: [CalendarDemo] }).compileComponents();
      const fixture = TestBed.createComponent(CalendarDemo);
      fixture.componentRef.setInput('demo', demo);
      fixture.detectChanges();
      await vi.waitFor(() => {
        fixture.detectChanges();
        expect(fixture.componentInstance.error()).toBe('');
        expect(fixture.componentInstance.controller.ready()).toBe(true);
      });
      const api = fixture.componentInstance.controller.getApi()!;
      await api.whenIdle();
      fixture.detectChanges();
      expect(api.getView().type).toBe(demo.view);
      expect(fixture.nativeElement.querySelector('.wts-calender')).toBeTruthy();
      expect(api.getEvents().length).toBeGreaterThan(0);
      if (demo.id === 'list' || demo.id === 'interactions') {
        const root = fixture.nativeElement.querySelector('.wts-calender');
        const eventIds = api.getEvents().map((event) => event.id);
        const clickToolbar = async (action: string) => {
          const button = fixture.nativeElement.querySelector(
            '[data-calendar-toolbar-action="' + action + '"]',
          ) as HTMLButtonElement;
          expect(button).toBeTruthy();
          button.click();
          await api.whenIdle();
          fixture.detectChanges();
        };
        const views = demo.id === 'list' ? LIST_VIEWS : ['month', 'week', 'day'];
        for (const view of views) {
          await clickToolbar(view);
          expect(api.getView().type).toBe(view);
          expect(fixture.nativeElement.querySelector('.wts-calender')).toBe(root);
          expect(
            fixture.nativeElement.querySelectorAll(
              '[data-calendar-toolbar-view][aria-pressed="true"]',
            ).length,
          ).toBe(1);
          expect(
            fixture.nativeElement
              .querySelector('[data-calendar-toolbar-view="' + view + '"]')
              .getAttribute('aria-pressed'),
          ).toBe('true');
          expect(
            fixture.nativeElement.querySelector('[data-calendar-toolbar-title]').textContent,
          ).toBe(api.getView().title);
          expect(api.getEvents().map((event) => event.id)).toEqual(eventIds);
          if (demo.id === 'interactions') {
            expect(api.getOption('editable')).toBe(true);
            expect(api.getOption('selectable')).toBe(true);
            expect(
              api.select({
                start: '2026-09-07T12:00:00Z',
                end: '2026-09-07T13:00:00Z',
                allDay: view === 'month',
              }),
            ).toBeTruthy();
            expect(
              fixture.componentInstance.activity().some((entry) => entry.includes('select:')),
            ).toBe(true);
            api.unselect();
          }
        }
        await clickToolbar(demo.id === 'list' ? 'list-week' : 'week');
        const initialTitle = api.getView().title;
        await clickToolbar('next');
        expect(api.getView().title).not.toBe(initialTitle);
        await clickToolbar('sampleDates');
        expect(api.getView().title).toBe(initialTitle);
        expect(fixture.nativeElement.querySelectorAll('[role="toolbar"]').length).toBe(1);
        expect(fixture.componentInstance.code()).toContain('headerToolbar');
        expect(fixture.componentInstance.code()).toContain(
          demo.id === 'list' ? 'list-day,list-week,list-month,list-year' : 'month,week,day',
        );
      }
      expect(api.getOption('weekDaysFormat')).toBe('EEE');
      expect(api.getOption('footerScrollbarSticky')).toBe(false);
      if (
        ['multi-month', 'year', 'day-grid-week', 'day-grid-day', 'work-week'].includes(demo.view)
      ) {
        expect(api.getOption('height')).toBe('auto');
        expect(fixture.nativeElement.querySelector('.calendar-height-constrained')).toBeNull();
      }
      if (demo.view === 'multi-month' || demo.view === 'year') {
        expect(api.getOption('dayMaxEvents')).toBe(1);
        expect(api.getOption('moreLinkClick')).toBe('popover');
        expect(fixture.componentInstance.code()).toContain(
          "options.moreLinkContent = info => '+' + info.count",
        );
        const more = fixture.nativeElement.querySelector(
          '.multi-month-panel .btn-more-events',
        ) as HTMLButtonElement;
        expect(more.textContent).toBe('+1');
        expect(more.getAttribute('aria-label')).toContain('Show 1 more events');
        more.focus();
        more.click();
        const popover = document.querySelector('[role="dialog"]');
        expect(popover?.textContent).toContain('Design workshop');
        expect(popover?.textContent).toContain('Customer catch-up');
        (popover?.querySelector('[aria-label="Close event list"]') as HTMLButtonElement).click();
        expect(document.querySelector('[role="dialog"]')).toBeNull();
        expect(document.activeElement).toBe(more);
        expect(api.getEvents().length).toBe(8);
      }
      if (demo.id === 'event-sources') {
        expect(fixture.componentInstance.requests()).toBeGreaterThan(0);
        const prior = fixture.componentInstance.requests();
        await fixture.componentInstance.refresh();
        expect(fixture.componentInstance.requests()).toBeGreaterThan(prior);
      }
      if (demo.id === 'ics') {
        fixture.componentInstance.importIcs();
        expect(fixture.componentInstance.error()).toBe('');
        expect(api.getEvents().some((event) => event.title === 'Imported workshop')).toBe(true);
        expect(api.exportICalendar()).toContain('Imported workshop');
      }
      if (demo.id === 'themes') {
        fixture.componentInstance.option({ theme: 'breezy', colorScheme: 'dark', weekends: false });
        expect(api.getOption('theme')).toBe('breezy');
        expect(api.getOption('weekends')).toBe(false);
      }
      if (demo.id === 'locale-rtl') {
        fixture.componentInstance.setLocale('ar');
        expect(api.getOption('direction')).toBe('rtl');
        fixture.componentInstance.setLocale('en-US');
        expect(api.getOption('direction')).toBe('ltr');
      }
      if (demo.id === 'event-editor') {
        await vi.waitFor(() => expect(fixture.componentInstance.editorReady()).toBe(true));
        const button = fixture.nativeElement.querySelector(
          '.demo-tools button',
        ) as HTMLButtonElement;
        button.click();
        fixture.detectChanges();
        expect(document.querySelector('[role="dialog"]')).toBeTruthy();
      }
      fixture.destroy();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });
  }
});

describe('Navigation and pricing', () => {
  for (const view of LIST_VIEWS) {
    it('preserves the initial range from the legacy ' + view + ' URL', async () => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/examples/' + view);
      await vi.waitFor(() => {
        harness.detectChanges();
        expect(
          harness.routeNativeElement
            ?.querySelector('[data-calendar-toolbar-view="' + view + '"]')
            ?.getAttribute('aria-pressed'),
        ).toBe('true');
      });
      const links = [
        ...harness.routeNativeElement!.querySelectorAll('nav[aria-label="Calendar examples"] a'),
      ];
      expect(
        links
          .filter((link) => /^List/.test(link.textContent!.trim()))
          .map((link) => link.textContent?.trim()),
      ).toEqual(['List']);
      expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('List');
    });
  }
  it('mounts the site shell', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('main')).toBeTruthy();
    const menu = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    menu.click();
    fixture.detectChanges();
    expect(menu.getAttribute('aria-expanded')).toBe('true');
  });
  it('routes to pages, rejects premium demo URLs, and redirects the example index', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/examples');
    expect(harness.routeNativeElement?.textContent).toContain('A familiar month grid');
    expect(harness.routeNativeElement?.querySelector('.example-heading .badge')).toBeNull();
    expect(harness.routeNativeElement?.textContent).not.toMatch(/\bfree\b/i);
    await harness.navigateByUrl('/examples/resource-timeline');
    expect(harness.routeNativeElement?.textContent).toContain('Example not found');
    await harness.navigateByUrl('/pricing');
    expect(harness.routeNativeElement?.textContent).toContain('Contact for pricing');
    await harness.navigateByUrl('/docs');
    expect(harness.routeNativeElement?.textContent).toContain('Your own stack.');
    await harness.navigateByUrl('/features');
    expect(harness.routeNativeElement?.textContent).toContain('Premium interoperability');
    await harness.navigateByUrl('/not-a-page');
    expect(harness.routeNativeElement?.textContent).toContain('PAGE NOT FOUND');
  });
  it('has no premium runtime, credential form, checkout or public license request link', async () => {
    await TestBed.configureTestingModule({
      imports: [PricingPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PricingPage);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('wts-calendar-angular,input,form,pre,code'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('a[href*="issues/new"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.plan:not(.premium-plan) .badge')).toBeNull();
    expect(fixture.nativeElement.querySelector('.premium-plan .badge.premium')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toMatch(/\bfree\b/i);
  });
  it('hides the email address while keeping the license button as a mailto link', async () => {
    await TestBed.configureTestingModule({
      imports: [PricingPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PricingPage);
    fixture.detectChanges();
    const request = fixture.nativeElement.querySelector(
      '.premium-plan .button',
    ) as HTMLAnchorElement;
    expect(request.tagName).toBe('A');
    expect(request.textContent).toContain('Email for a license key');
    expect(request.getAttribute('href')).toBe(
      'mailto:suman.mandal@webskitters.com?subject=WTS%20Calendar%20premium%20license%20request',
    );
    expect(fixture.nativeElement.querySelector('.license-email')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain(PREMIUM_CONTACT_EMAIL);
    expect(fixture.nativeElement.textContent).not.toContain('email will be added');
  });
});
