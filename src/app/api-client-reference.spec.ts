import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it, vi } from 'vitest';
import { routes } from './app.config';
import { CLIENT_OPTIONS, CLIENT_SYMBOLS } from './api-reference-data.generated';
import { optionGuide, VERIFIED_DEFAULTS } from './api-guidance';
import { WtsCalendar } from '@wts-calendar/core';

async function open(url: string) {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return harness;
}
describe('Focused API reference', () => {
  it('verifies documented defaults against the published runtime', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const container = document.createElement('div');
    document.body.append(container);
    const calendar = new WtsCalendar({ container });
    try {
      expect(calendar.getOption('eventClick')).toBeUndefined();
      expect(calendar.getOption('dateClick')).toBeUndefined();
      for (const name of Object.keys(VERIFIED_DEFAULTS) as (keyof typeof VERIFIED_DEFAULTS)[])
        expect(calendar.getOption(name), name).toEqual(VERIFIED_DEFAULTS[name]);
    } finally {
      await calendar.destroyAsync();
      container.remove();
      vi.unstubAllGlobals();
    }
  });
  it('offers a compact index and hides deprecated options by default', async () => {
    const h = await open('/docs/api');
    expect(h.routeNativeElement?.querySelectorAll('.reference-index-row').length).toBe(30);
    expect(h.routeNativeElement?.querySelector('.reference-index')?.textContent).not.toContain(
      'apikey',
    );
    const input = h.routeNativeElement?.querySelector('input[type=checkbox]') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    h.detectChanges();
    expect(h.routeNativeElement?.querySelector('.reference-index')?.textContent).toContain(
      'apikey',
    );
  });
  it('opens an entry by URL with code and a callback type link', async () => {
    const h = await open('/docs/api?entry=eventClick');
    expect(h.routeNativeElement?.querySelector('#reference-entry-title')?.textContent).toContain(
      'eventClick',
    );
    expect(h.routeNativeElement?.querySelector('app-code-card')?.textContent).toContain(
      'info.event.title',
    );
    expect(
      h.routeNativeElement?.querySelector('a[href*="entry=CalendarEventClickInfo"]'),
    ).toBeTruthy();
  });
  it('supports old option anchors and method anchors', async () => {
    const h = await open('/docs/api#option-timeZone');
    expect(h.routeNativeElement?.querySelector('#reference-entry-title')?.textContent).toContain(
      'timeZone',
    );
    await h.navigateByUrl('/docs/api/methods#api-setOption');
    expect(h.routeNativeElement?.textContent).toContain('Parameters');
    expect(h.routeNativeElement?.textContent).toContain('Returns');
  });
  it('renders callback fields and nested object properties', async () => {
    const h = await open('/docs/api/exports?entry=CalendarEventClickInfo');
    expect(h.routeNativeElement?.querySelector('table')?.textContent).toContain(
      'native mouse event',
    );
    expect(h.routeNativeElement?.querySelectorAll('tbody tr').length).toBe(4);
    expect(h.routeNativeElement?.querySelector('a[href*="entry=IEvent"]')).toBeTruthy();
    await h.navigateByUrl('/docs/api/exports?entry=IEvent');
    expect(h.routeNativeElement?.querySelector('table')?.textContent).toContain('start');
    await h.navigateByUrl('/docs/api?entry=dayView');
    expect(h.routeNativeElement?.querySelector('table')?.textContent).toContain('hourSegment');
  });
  it('searches human words and resets to an index from a detail', async () => {
    const h = await open('/docs/api?entry=eventClick');
    const input = h.routeNativeElement?.querySelector('input[type=search]') as HTMLInputElement;
    input.value = 'time zone';
    input.dispatchEvent(new Event('input'));
    h.detectChanges();
    await h.fixture.whenStable();
    h.detectChanges();
    expect(h.routeNativeElement?.querySelector('.reference-detail')).toBeNull();
    expect(h.routeNativeElement?.querySelector('.reference-index')?.textContent).toContain(
      'timeZone',
    );
  });
  it('handles missing entries explicitly', async () => {
    const h = await open('/docs/api?entry=notARealOption');
    expect(h.routeNativeElement?.textContent).toContain('Entry not found');
  });
  it('gives every client option a meaningful description and keeps generated members', () => {
    for (const entry of CLIENT_OPTIONS)
      expect(optionGuide(entry.name).description || entry.description).not.toBe(
        'Typed calendar option.',
      );
    expect(
      CLIENT_SYMBOLS.find((s) => s.name === 'CalendarEventClickInfo')?.members.map((m) => m.name),
    ).toEqual(['event', 'el', 'jsEvent', 'view']);
  });
});
