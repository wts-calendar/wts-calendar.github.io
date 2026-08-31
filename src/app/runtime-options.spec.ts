import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CodeCard } from './code-card';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { CalendarDemo } from './calendar-demo';
import { RuntimeOptions } from './runtime-options';
import {
  controlsForView,
  controlValue,
  controlId,
  runtimeChange,
  RUNTIME_CONTROLS,
} from './runtime-option-schema';
import { DEMOS } from './site-data';

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
});

async function mount(id: string) {
  await TestBed.configureTestingModule({ imports: [CalendarDemo] }).compileComponents();
  const fixture = TestBed.createComponent(CalendarDemo);
  fixture.componentRef.setInput(
    'demo',
    DEMOS.find((demo) => demo.id === id)!,
  );
  fixture.detectChanges();
  await vi.waitFor(
    () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.error()).toBe('');
      expect(fixture.componentInstance.controller.ready()).toBe(true);
    },
    { timeout: 5000 },
  );
  const component = fixture.componentInstance;
  const api = component.controller.getApi()!;
  await api.whenIdle();
  fixture.detectChanges();
  const group = fixture.nativeElement.querySelector(
    '[aria-label="Option group"]',
  ) as HTMLSelectElement;
  group.value = 'all';
  group.dispatchEvent(new Event('change', { bubbles: true }));
  fixture.detectChanges();
  const change = async (id: string, value: unknown) => {
    const field = fixture.nativeElement.querySelector('[id="runtime-' + id + '"]') as
      HTMLInputElement | HTMLSelectElement;
    expect(field, id).toBeTruthy();
    if (field instanceof HTMLInputElement) field.checked = value === true;
    else field.value = JSON.stringify(value);
    field.dispatchEvent(new Event('change', { bubbles: true }));
    await api.whenIdle();
    fixture.detectChanges();
    return field;
  };
  return { fixture, component, api, change };
}

describe('Runtime option contracts', () => {
  it('has unique API paths and does not offer construction-only or secret settings', () => {
    expect(new Set(RUNTIME_CONTROLS.map(controlId)).size).toBe(RUNTIME_CONTROLS.length);
    expect(
      RUNTIME_CONTROLS.some((control) =>
        ['apikey', 'license', 'plugins', 'events', 'resources', 'container', 'views'].includes(
          control.key,
        ),
      ),
    ).toBe(false);
  });
  it('shows view-relevant options and requires the loaded interaction module', () => {
    const ids = (demo: string, view: string) => controlsForView(demo, view).map(controlId);
    expect(ids('month', 'month')).toContain('dayMaxEvents');
    expect(ids('month', 'month')).not.toContain('slotDuration');
    expect(ids('themes', 'week')).toContain('slotDuration');
    expect(ids('themes', 'week')).not.toContain('dayMaxEvents');
    expect(ids('themes', 'list-week')).toContain('listView.showEmptyDays');
    expect(ids('themes', 'list-week')).not.toContain('editable');
    expect(ids('time-grid-week', 'week')).not.toContain('editable');
    expect(ids('interactions', 'week')).toContain('editable');
    expect(ids('multi-month', 'multi-month')).toContain('multiMonth.columns');
  });
  it('rejects values outside the curated options and creates narrow nested patches', () => {
    const theme = RUNTIME_CONTROLS.find((control) => control.key === 'theme')!;
    expect(() => runtimeChange(theme, 'arbitrary-script')).toThrow('supported value');
    const list = RUNTIME_CONTROLS.find((control) => control.member === 'showEmptyDays')!;
    expect(runtimeChange(list, true)).toEqual({ listView: { showEmptyDays: true } });
    expect(() => runtimeChange(list, 'true')).toThrow('supported value');
  });
  it('shows the effective per-view duration when it overrides the global value', () => {
    const duration = RUNTIME_CONTROLS.find((control) => control.key === 'slotDuration')!;
    const options = {
      slotDuration: 15,
      dayView: { hourSegment: 60 },
      weekView: { hourSegment: 30 },
    };
    expect(controlValue(options, duration, 'day')).toBe(60);
    expect(controlValue(options, duration, 'week')).toBe(30);
    expect(controlValue({ slotDuration: 15 }, duration, 'week')).toBe(15);
  });
  it('searches API names, handles empty results, and updates for a changed view', async () => {
    await TestBed.configureTestingModule({ imports: [RuntimeOptions] }).compileComponents();
    const fixture = TestBed.createComponent(RuntimeOptions);
    fixture.componentRef.setInput('demoId', 'themes');
    fixture.componentRef.setInput('view', 'month');
    fixture.componentRef.setInput('options', { theme: 'forma' });
    fixture.detectChanges();
    const search = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    search.value = 'slotDuration';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No matching options');
    fixture.componentRef.setInput('view', 'week');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-runtime-option]').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Time-slot duration');
    fixture.destroy();
  });
});

describe('Live options with the published package', () => {
  it('switches the shown and copied framework code while retaining live options', async () => {
    const { fixture, component, change } = await mount('themes');
    await change('theme', 'breezy');
    for (const framework of component.frameworks) {
      const button = [...fixture.nativeElement.querySelectorAll('.framework-tabs button')].find(
        (node: any) => node.textContent.trim() === framework.label,
      ) as HTMLButtonElement;
      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(component.selectedFramework()).toBe(framework.id);
      expect(fixture.nativeElement.querySelector('[data-code-kind="setup"]').textContent).toBe(
        component.selectedCode()?.setup,
      );
      expect(component.selectedCode()?.supported).toBe(true);
    }
    component.selectFramework('react');
    const writeText = vi.fn().mockResolvedValue(undefined);
    const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    try {
      fixture.detectChanges();
      const cards = fixture.debugElement
        .queryAll(By.directive(CodeCard))
        .map((item) => item.componentInstance as CodeCard);
      expect(cards.length).toBe(3);
      await cards.find((card) => card.kind() === 'setup')!.copy();
      expect(writeText).toHaveBeenCalledWith(component.selectedCode()?.setup);
      expect(writeText.mock.calls[0][0]).toContain('WtsCalendarReact');
      await cards.find((card) => card.kind() === 'install')!.copy();
      expect(writeText).toHaveBeenLastCalledWith(component.selectedCode()?.install);
    } finally {
      if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard);
      else Reflect.deleteProperty(navigator, 'clipboard');
      fixture.destroy();
    }
  });
  for (const id of [
    'month',
    'day-grid-week',
    'time-grid-week',
    'list',
    'multi-month',
    'interactions',
    'event-sources',
  ]) {
    it(
      'applies every exposed control for ' + id + ' and resets without remounting',
      async () => {
        const { fixture, component, api, change } = await mount(id);
        const root = fixture.nativeElement.querySelector('.wts-calender');
        const controls = controlsForView(id, api.getView().type);
        for (const control of controls) {
          const before = controlValue(component.runtimeOptions(), control);
          const value = control.choices
            ? control.choices.find(
                (choice) =>
                  choice.value !== before &&
                  (control.key !== 'slotMaxTime' ||
                    String(choice.value) > String(api.getOption('slotMinTime'))) &&
                  (control.key !== 'slotMinTime' ||
                    String(choice.value) < String(api.getOption('slotMaxTime'))),
              )!.value
            : !before;
          await change(controlId(control), value);
          expect(component.error(), controlId(control)).toBe('');
          expect(controlValue(component.runtimeOptions(), control), controlId(control)).toEqual(
            value,
          );
          expect(component.changesCode()).toContain(control.key);
          expect(component.code()).toContain(JSON.stringify(control.key));
          expect(fixture.nativeElement.querySelector('.wts-calender')).toBe(root);
          component.resetOptions();
          await api.whenIdle();
          fixture.detectChanges();
          expect(component.error()).toBe('');
          expect(controlValue(component.runtimeOptions(), control)).toEqual(before);
          expect(component.hasRuntimeChanges()).toBe(false);
        }
        fixture.destroy();
      },
      20000,
    );
  }
  it('retains settings across views, updates code and controls, and preserves edits on reset', async () => {
    const { fixture, component, api, change } = await mount('themes');
    await change('weekends', false);
    await change('theme', 'breezy');
    api.addEvent({
      id: 'user-edit',
      title: 'Keep this event',
      start: '2026-09-21T10:00:00Z',
      end: '2026-09-21T11:00:00Z',
    });
    api.changeView('week', '2026-09-21');
    await api.whenIdle();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-runtime-option="slotDuration"]'),
    ).toBeTruthy();
    expect(
      (fixture.nativeElement.querySelector('#runtime-slotDuration') as HTMLSelectElement).value,
    ).toBe(JSON.stringify(api.getOption('weekView')?.hourSegment));
    expect(
      fixture.nativeElement.querySelector('[data-runtime-option="fixedWeekCount"]'),
    ).toBeNull();
    expect(component.code()).toContain('"view": "week"');
    expect(component.code()).toContain('"viewDate": "2026-09-21"');
    expect(component.code()).not.toContain('Keep this event');
    expect(api.getOption('weekends')).toBe(false);
    const date = api.getDate().getTime();
    component.resetOptions();
    await api.whenIdle();
    fixture.detectChanges();
    expect(api.getView().type).toBe('week');
    expect(api.getDate().getTime()).toBe(date);
    expect(api.getEventById('user-edit')).toBeTruthy();
    expect(api.getOption('weekends')).toBe(true);
    expect(api.getOption('theme')).toBe('forma');
    fixture.destroy();
  });
  it('changes actual TimeGrid density and visible hours, including reset', async () => {
    const { fixture, component, api, change } = await mount('time-grid-week');
    const cells = () =>
      fixture.nativeElement.querySelectorAll('.hour-segment[role="gridcell"]').length;
    const initial = cells();
    expect(initial).toBeGreaterThan(0);
    const duration = () =>
      (fixture.nativeElement.querySelector('#runtime-slotDuration') as HTMLSelectElement).value;
    expect(duration()).toBe('60');
    await change('slotDuration', 30);
    expect(cells()).toBe(initial * 2);
    expect(duration()).toBe('30');
    expect(component.changesCode()).toContain('"hourSegment": 30');
    await change('slotMinTime', '09:00');
    await change('slotMaxTime', '17:00');
    expect(cells()).toBe(7 * 8 * 2);
    component.resetOptions();
    await api.whenIdle();
    fixture.detectChanges();
    expect(cells()).toBe(initial);
    expect(duration()).toBe('60');
    expect(api.getOption('dayView')?.hourSegment).toBe(60);
    expect(api.getOption('weekView')?.hourSegment).toBe(60);
    fixture.destroy();
  });
  it('updates rendered month event labels, not only the option snapshot', async () => {
    const { fixture, change } = await mount('month');
    const label = () =>
      [...fixture.nativeElement.querySelectorAll('.week-days-cell-events-label')].find((el: any) =>
        el.textContent.includes('Roadmap review'),
      ) as HTMLElement;
    await change('eventTimeFormat', 'hh:mm a');
    expect(label().textContent).toContain('10:00 AM');
    await change('displayEventEnd', true);
    expect(label().textContent).toContain('11:00 AM');
    await change('displayEventTime', false);
    expect(label().textContent).not.toContain('10:00');
    fixture.destroy();
  });
  it('uses the list-specific format to update visible agenda times', async () => {
    const { fixture, component, change } = await mount('list');
    await change('listView.eventTimeFormat', 'HH:mm');
    const label = fixture.nativeElement.querySelector('.calendar-list-event-time');
    expect(label.textContent).toContain('10:00');
    expect(label.textContent).not.toMatch(/AM|PM/);
    expect(component.changesCode()).toContain('"eventTimeFormat": "HH:mm"');
    fixture.destroy();
  });
  it('rejects an invalid time range without changing the calendar, input, or code', async () => {
    const { fixture, component, api, change } = await mount('time-grid-week');
    await change('slotMinTime', '18:00');
    const code = component.code();
    const field = await change('slotMaxTime', '12:00');
    expect(component.error()).toBeTruthy();
    expect(api.getOption('slotMaxTime')).toBe('20:00');
    expect(field.value).toBe(JSON.stringify('20:00'));
    expect(component.code()).toBe(code);
    component.resetOptions();
    fixture.detectChanges();
    expect(component.error()).toBe('');
    fixture.destroy();
  });
  it('resets time zones without moving the displayed civil date', async () => {
    const { fixture, component, api } = await mount('time-zones');
    component.setTimeZone('Asia/Kolkata');
    api.changeView('day', '2026-09-21');
    await api.whenIdle();
    component.resetOptions();
    await api.whenIdle();
    fixture.detectChanges();
    expect(api.getOption('timeZone')).toBe('UTC');
    expect(component.selectedTimeZone()).toBe('UTC');
    expect(api.formatIso(api.getDate(), { omitTime: true })).toBe('2026-09-21');
    expect(api.getView().type).toBe('day');
    expect(component.hasRuntimeChanges()).toBe(false);
    fixture.destroy();
  });
  it('keeps the loader example copyable when lazy fetching is disabled', async () => {
    const { fixture, component, change } = await mount('event-sources');
    await change('lazyFetching', false);
    expect(component.code()).toContain('"lazyFetching": false');
    expect(component.code()).not.toContain('options.lazyFetching = true');
    expect(component.code()).toContain('loader: async () => data');
    fixture.destroy();
  });
  it('copies the current snippets and gives an honest clipboard failure message', async () => {
    const { fixture, component, change } = await mount('month');
    await change('dayMaxEvents', 1);
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    try {
      const cards = fixture.debugElement
        .queryAll(By.directive(CodeCard))
        .map((item) => item.componentInstance as CodeCard);
      const runtime = cards.find((card) => card.kind() === 'runtime')!;
      const setup = cards.find((card) => card.kind() === 'setup')!;
      await runtime.copy();
      expect(writeText).toHaveBeenLastCalledWith(component.changesCode());
      expect(runtime.feedback()).toBe('Copied');
      await setup.copy();
      expect(writeText).toHaveBeenLastCalledWith(component.code());
      writeText.mockRejectedValueOnce(new Error('Denied'));
      await setup.copy();
      expect(setup.feedback()).toContain('Clipboard unavailable');
      expect(component.error()).toBe('');
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
      else Reflect.deleteProperty(navigator, 'clipboard');
      fixture.destroy();
    }
  });
});
