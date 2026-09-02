import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { routes } from './app.config';
import { CalendarDemo } from './calendar-demo';
import { FeaturesPage } from './features-page';
import { PricingPage } from './pricing-page';
import { DocsPage } from './docs-page';
import {
  DEMOS,
  LIST_VIEWS,
  FEATURES,
  LICENSE_REQUEST,
  PREMIUM_CONTACT_EMAIL,
  PREMIUM_FEATURES,
} from './site-data';
import premiumContent from './premium-feature-data.json';
import {
  BROWSER_SERVER_ADAPTER,
  DOTNET_PACKAGE_URL,
  DOTNET_REPOSITORY_URL,
  DOTNET_SAMPLE_URL,
  PHP_EXAMPLE_URL,
  PHP_PACKAGE_URL,
  REACT_NATIVE_SERVER_CLIENT,
  SERVER_INTEGRATIONS,
} from './server-integrations';

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as typeof ResizeObserver;
});

describe('Showcase contract', () => {
  it('links mirrored guides to the same branch that publishes the portal', () => {
    const page = new DocsPage();
    const root =
      'https://github.com/wts-calendar/wts-calendar.github.io/blob/wts/source/package-docs/';
    expect(page.docs).toBe(root + 'core/');
    expect(page.frameworks.find((framework) => framework.name === 'Angular')?.url).toBe(
      root + 'angular/README.md',
    );
    expect(page.frameworks.find((framework) => framework.name === 'JavaScript')?.url).toBe(
      root + 'core/README.md',
    );
  });
  it('documents the published PHP and ASP.NET Core servers alongside every frontend wrapper', () => {
    const page = new DocsPage();
    expect(page.frameworks.map((framework) => framework.name)).toEqual(
      expect.arrayContaining(['Angular', 'React', 'Vue', 'React Native']),
    );
    expect(SERVER_INTEGRATIONS.map((integration) => integration.id)).toEqual([
      'php',
      'slim',
      'laravel',
      'aspnetcore',
    ]);
    for (const integration of SERVER_INTEGRATIONS.filter(({ id }) => id !== 'aspnetcore')) {
      expect(integration.install).toContain('wts-calendar/server-php:^1.0');
      expect(integration.code).toContain('CalendarApiHandler');
      expect(integration.packageUrl).toBe(PHP_PACKAGE_URL);
      expect(integration.exampleUrl).toBe(PHP_EXAMPLE_URL);
    }
    const aspnetcore = SERVER_INTEGRATIONS.find(({ id }) => id === 'aspnetcore');
    expect(aspnetcore).toMatchObject({
      install: 'dotnet add package Wts.Calendar.AspNetCore --version 1.0.0',
      packageUrl: DOTNET_PACKAGE_URL,
      exampleUrl: DOTNET_SAMPLE_URL,
    });
    expect(aspnetcore?.code).toContain('MapWtsCalendarEvents');
    expect(aspnetcore?.code).toContain('IWtsCalendarEventStore');
    expect(DOTNET_REPOSITORY_URL).toBe('https://github.com/wts-calendar/server-dotnet');
    expect(BROWSER_SERVER_ADAPTER).toContain('@wts-calendar/core/data-adapter-sdk');
    expect(BROWSER_SERVER_ADAPTER).toContain('mutationUrl');
    expect(REACT_NATIVE_SERVER_CLIENT).toContain('WtsCalendarNative');
    expect(REACT_NATIVE_SERVER_CLIENT).toContain('authorization');
    expect(REACT_NATIVE_SERVER_CLIENT).toContain('page.records');
  });
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
  it('provides a distinct guide and capture title for every Premium feature', () => {
    expect(new Set(premiumContent.map((guide) => guide.id))).toEqual(
      new Set(PREMIUM_FEATURES.map((feature) => feature.id)),
    );
    for (const feature of PREMIUM_FEATURES) {
      const guide = premiumContent.find((item) => item.id === feature.id);
      expect(guide?.visual.title).toBeTruthy();
      expect(guide?.configuration.length).toBeGreaterThanOrEqual(3);
      expect(guide?.steps.length).toBeGreaterThanOrEqual(3);
      expect(guide?.limits.length).toBeGreaterThanOrEqual(2);
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
  it('renders actual-package screenshots and individual guide links, with no runtime demos or code', async () => {
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
      const title = card.querySelector('h3')?.textContent?.trim();
      const feature = PREMIUM_FEATURES.find((item) => item.title === title)!;
      expect(card.querySelector('a')?.getAttribute('href')).toBe('/premium/' + feature.id);
      expect(card.querySelector('img')?.getAttribute('src')).toBe(
        'previews/premium/' + feature.id + '.jpg',
      );
      expect(card.querySelector('img')?.getAttribute('alt')).toContain(feature.title);
      expect(card.querySelector('pre, code, wts-calendar-angular')).toBeNull();
    }
    expect(fixture.nativeElement.querySelectorAll('.feature-preview').length).toBe(
      PREMIUM_FEATURES.length,
    );
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
    it(
      'mounts ' + demo.id + ' using the published calendar',
      async () => {
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
        if (demo.id === 'list' || demo.id === 'interactions' || demo.group === 'Customization') {
          const root = fixture.nativeElement.querySelector('.wts-calender');
          const eventIds = api.getEvents().map((event) => event.id);
          const eventStarts = api.getEvents().map((event) => String(event.start));
          if (demo.id === 'themes')
            fixture.componentInstance.option({
              theme: 'breezy',
              colorScheme: 'dark',
              weekends: false,
            });
          if (demo.id === 'locale-rtl') fixture.componentInstance.setLocale('ar');
          if (demo.id === 'time-zones') fixture.componentInstance.setTimeZone('Asia/Kolkata');
          const clickToolbar = async (action: string) => {
            const button = fixture.nativeElement.querySelector(
              '[data-calendar-toolbar-action="' + action + '"]',
            ) as HTMLButtonElement;
            expect(button).toBeTruthy();
            button.click();
            await api.whenIdle();
            fixture.detectChanges();
          };
          const views =
            demo.id === 'list'
              ? LIST_VIEWS
              : ['interactions', 'background'].includes(demo.id)
                ? ['month', 'week', 'day']
                : ['month', 'week', 'day', 'list-week'];
          expect(
            [...fixture.nativeElement.querySelectorAll('[data-calendar-toolbar-view]')].map(
              (button: Element) => button.getAttribute('data-calendar-toolbar-view'),
            ),
          ).toEqual(views);
          for (const view of views) {
            await clickToolbar(view);
            expect(api.getView().type).toBe(view);
            expect(fixture.nativeElement.querySelector('.wts-calender')).toBe(root);
            expect(
              [...root.children].indexOf(root.querySelector('.wts-calender-header')),
            ).toBeLessThan([...root.children].indexOf(root.querySelector('.wts-calender-body')));
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
            expect(api.getEvents().map((event) => String(event.start))).toEqual(eventStarts);
            if (demo.id === 'themes') {
              expect(api.getOption('theme')).toBe('breezy');
              expect(api.getOption('colorScheme')).toBe('dark');
              expect(api.getOption('weekends')).toBe(false);
            }
            if (demo.id === 'locale-rtl') {
              expect(api.getOption('locale')).toBe('ar');
              expect(api.getOption('direction')).toBe('rtl');
              expect(root.style.direction).toBe('rtl');
              expect(fixture.componentInstance.selectedLocale()).toBe('ar');
            }
            if (demo.id === 'time-zones') {
              expect(api.getOption('timeZone')).toBe('Asia/Kolkata');
              expect(api.formatIso(api.getDate(), { omitTime: true })).toBe('2026-09-07');
              expect(fixture.componentInstance.selectedTimeZone()).toBe('Asia/Kolkata');
              expect(api.getOption('slotMinTime')).toBe('00:00');
              expect(api.getOption('slotMaxTime')).toBe('24:00');
            }
            if (demo.id === 'background') {
              expect(api.getEvents().find((event) => event.id === 'quiet-time')?.display).toBe(
                'background',
              );
              expect(
                fixture.nativeElement.querySelector('.calendar-background-event'),
              ).toBeTruthy();
            }
            if (demo.id === 'render-hooks') {
              expect(root.textContent).toContain('◆ Roadmap review');
              expect(
                fixture.componentInstance
                  .activity()
                  .some((entry) => entry.includes('eventDidMount:')),
              ).toBe(true);
            }
            if (demo.id === 'accessibility') expect(api.getOption('editable')).toBe(true);
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
          const initialDate = api.getDate().getTime();
          await clickToolbar('next');
          expect(api.getView().title).not.toBe(initialTitle);
          expect(api.getDate().getTime()).toBe(initialDate + 7 * 24 * 60 * 60 * 1000);
          await clickToolbar('prev');
          expect(api.getDate().getTime()).toBe(initialDate);
          await clickToolbar('next');
          await clickToolbar('sampleDates');
          expect(api.getView().title).toBe(initialTitle);
          expect(fixture.nativeElement.querySelectorAll('[role="toolbar"]').length).toBe(1);
          expect(
            fixture.nativeElement.querySelector('.calendar-demo > .calendar-toolbar'),
          ).toBeNull();
          expect(fixture.componentInstance.code()).toContain('headerToolbar');
          expect(fixture.componentInstance.code()).toContain(views.join(','));
          expect(fixture.componentInstance.code()).toContain(
            'options.customButtons.sampleDates.click',
          );
          // Further assertions below exercise controls from the example's initial state.
          if (demo.id === 'locale-rtl') fixture.componentInstance.setLocale('en-US');
          if (demo.id === 'time-zones') fixture.componentInstance.setTimeZone('UTC');
          await clickToolbar(demo.view);
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
          fixture.componentInstance.option({
            theme: 'breezy',
            colorScheme: 'dark',
            weekends: false,
          });
          expect(api.getOption('theme')).toBe('breezy');
          expect(api.getOption('weekends')).toBe(false);
        }
        if (demo.id === 'locale-rtl') {
          expect(fixture.componentInstance.localeChoices().length).toBeGreaterThan(200);
          expect(fixture.nativeElement.querySelector('[role="combobox"]')).toBeTruthy();
          expect(fixture.nativeElement.querySelectorAll('#demo-locale').length).toBe(1);
          expect(fixture.nativeElement.querySelector('label[for="demo-locale"]').control).toBe(
            fixture.nativeElement.querySelector('[role="combobox"]'),
          );
          fixture.componentInstance.setLocale('ar');
          expect(api.getOption('direction')).toBe('rtl');
          fixture.componentInstance.setLocale('he');
          expect(api.getOption('direction')).toBe('rtl');
          fixture.componentInstance.setLocale('fa');
          expect(api.getOption('direction')).toBe('rtl');
          fixture.componentInstance.setLocale('bn');
          expect(api.getOption('locale')).toBe('bn');
          expect(api.getOption('direction')).toBe('ltr');
          fixture.componentInstance.setLocale('en-US');
          expect(api.getOption('direction')).toBe('ltr');
          fixture.componentInstance.setLocale('not_an_offered_locale');
          expect(api.getOption('locale')).toBe('en-US');
          expect(fixture.componentInstance.selectedLocale()).toBe('en-US');
        }
        if (demo.id === 'time-zones') {
          expect(fixture.componentInstance.timeZoneChoices().length).toBeGreaterThan(300);
          expect(api.getOption('slotMinTime')).toBe('00:00');
          expect(api.getOption('slotMaxTime')).toBe('24:00');
          const instants = api.getEvents().map((event) => String(event.start));
          const visibleDate = api.formatIso(api.getDate(), { omitTime: true });
          for (const zone of [
            'America/New_York',
            'Pacific/Auckland',
            'Asia/Kolkata',
            'local',
            'UTC',
          ]) {
            fixture.componentInstance.setTimeZone(zone);
            await api.whenIdle();
            expect(api.getOption('timeZone')).toBe(zone);
            expect(fixture.componentInstance.selectedTimeZone()).toBe(zone);
            expect(api.formatIso(api.getDate(), { omitTime: true })).toBe(visibleDate);
            expect(api.formatIso(api.getView().currentStart, { omitTime: true })).toBe(
              '2026-09-07',
            );
            expect(api.getEvents().map((event) => String(event.start))).toEqual(instants);
          }
          fixture.componentInstance.setTimeZone('Not/A_Zone');
          expect(api.getOption('timeZone')).toBe('UTC');
          fixture.componentInstance.navigate('next');
          const nextDate = api.formatIso(api.getDate(), { omitTime: true });
          fixture.componentInstance.setTimeZone('America/New_York');
          expect(api.formatIso(api.getDate(), { omitTime: true })).toBe(nextDate);
        }
        if (demo.id === 'event-editor') {
          await vi.waitFor(() => expect(fixture.componentInstance.editorReady()).toBe(true));
          expect(api.getOption('selectable')).toBe(true);
          // Apply the async ready signal before clicking the formerly disabled button.
          fixture.detectChanges();
          const button = fixture.nativeElement.querySelector(
            '.demo-tools button',
          ) as HTMLButtonElement;
          expect(button.disabled).toBe(false);
          button.click();
          fixture.detectChanges();
          expect(document.querySelector('[role="dialog"]')).toBeTruthy();
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          expect(document.querySelector('[role="dialog"]')).toBeNull();
          expect(
            api.select({
              start: '2026-09-09T10:00:00Z',
              end: '2026-09-09T11:30:00Z',
              allDay: false,
            }),
          ).toBeTruthy();
          fixture.detectChanges();
          const rangeDialog = document.querySelector('[role="dialog"]');
          expect(rangeDialog).toBeTruthy();
          expect((rangeDialog?.querySelector('[name="start"]') as HTMLInputElement).value).toBe(
            '2026-09-09T10:00',
          );
          expect((rangeDialog?.querySelector('[name="end"]') as HTMLInputElement).value).toBe(
            '2026-09-09T11:30',
          );
          expect(api.getSelection()).toBeNull();
        }
        fixture.destroy();
        expect(document.querySelector('[role="dialog"]')).toBeNull();
        // This case rebuilds every view and several full-day IANA time zones.
        // Allow the complete integration flow to run alongside the other suites.
      },
      demo.id === 'time-zones' ? 15000 : 5000,
    );
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
