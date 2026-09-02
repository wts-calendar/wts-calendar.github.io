import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
  computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  WtsCalendarAngularComponent,
  WtsCalendarAngularController,
  type WtsCalendarAngularInitialOptions,
} from '@wts-calendar/angular';
import type {
  CalendarDateClickInfo,
  CalendarEventClickInfo,
  CalendarEventInput,
  CalendarOptionChanges,
  CalendarSelection,
  WtsCalendar,
} from '@wts-calendar/core';
import type { CalendarEventEditor } from '@wts-calendar/core/event-editor';
import { createDemoSetup, DEMO_HEADER_VIEWS, SAMPLE_ICS, type DemoSetup } from './demo-setup';
import { demoCode, runtimeCode } from './demo-code';
import {
  CODE_FRAMEWORKS,
  frameworkCode,
  type CodeContext,
  type CodeFramework,
} from './framework-code';
import { RuntimeOptions } from './runtime-options';
import { CodeCard } from './code-card';
import {
  changedRuntimeOptions,
  pickRuntimeOptions,
  readRuntimeOptions,
  type RuntimeSnapshot,
} from './runtime-option-schema';
import { DEMO_DATE, sampleEvents } from './sample-data';
import type { Demo } from './site-data';
import { SearchableSelect, type SearchChoice } from './searchable-select';
import type { LocaleChoice } from './intl-options';

@Component({
  selector: 'app-calendar-demo',
  host: { ngSkipHydration: 'true' },
  imports: [WtsCalendarAngularComponent, SearchableSelect, RuntimeOptions, CodeCard],
  template: ` <div class="calendar-demo" [class.compact]="compact">
    @if (!hasViewToolbar) {
      <div class="calendar-toolbar">
        <div class="calendar-nav">
          <button
            (click)="navigate('previous')"
            [disabled]="!controller.ready()"
            aria-label="Previous date range"
          >
            ‹</button
          ><button
            (click)="navigate('next')"
            [disabled]="!controller.ready()"
            aria-label="Next date range"
          >
            ›</button
          ><button (click)="navigate('sample')" [disabled]="!controller.ready()">
            Sample dates
          </button>
        </div>
        <h2>{{ title() }}</h2>
        <span class="badge">LIVE · {{ demo.title }}</span>
      </div>
    }
    @if (!compact) {
      <div class="demo-tools">
        @if (demo.id === 'time-zones') {
          <app-searchable-select
            controlId="demo-time-zone"
            label="Display time zone"
            placeholder="Search a city or time-zone ID…"
            [choices]="timeZoneChoices()"
            [value]="selectedTimeZone()"
            [disabled]="!controller.ready()"
            (valueChange)="setTimeZone($event)"
          />
          <p class="intl-demo-note">
            All time zones supported by your browser, plus UTC and browser local time. Event
            instants stay the same; their displayed times change.
          </p>
        }
        @if (demo.id === 'locale-rtl') {
          <app-searchable-select
            controlId="demo-locale"
            label="Language / locale"
            placeholder="Search a language or locale code…"
            [choices]="localeChoices()"
            [value]="selectedLocale()"
            [disabled]="!controller.ready()"
            (valueChange)="setLocale($event)"
          />
          <p class="intl-demo-note">
            {{ localePackCount() }} package language packs, plus browser-supported date locales from
            Unicode CLDR. Other locales keep English UI labels. Text direction follows the selected
            locale; sample event titles remain unchanged.
          </p>
        }
        @if (demo.id === 'event-editor') {
          <button
            class="button primary small"
            (click)="openEditor($event)"
            [disabled]="!editorReady()"
          >
            Create event</button
          ><button (click)="history('undo')" [disabled]="!controller.ready()">Undo</button
          ><button (click)="history('redo')" [disabled]="!controller.ready()">Redo</button
          ><span
            >Click an empty cell or select a range to create. Click an event to edit, duplicate, or
            delete.</span
          >
        }
        @if (demo.id === 'ics') {
          <button (click)="importIcs()" [disabled]="!controller.ready() || imported()">
            Import sample ICS</button
          ><button (click)="downloadIcs()" [disabled]="!controller.ready()">Download ICS</button>
        }
        @if (demo.id === 'event-sources') {
          <button (click)="refresh()" [disabled]="!controller.ready()">Refetch source</button
          ><span>{{ requests() }} loader requests · in-memory sample</span>
        }
        @if (demo.id === 'accessibility') {
          <button (click)="print()">Print calendar</button
          ><span>Tab into the calendar. Use its keyboard hints to navigate; Escape cancels.</span>
        }
      </div>
      <app-runtime-options
        [demoId]="demo.id"
        [view]="activeView() || demo.view"
        [options]="runtimeOptions()"
        [changed]="hasRuntimeChanges()"
        (apply)="option($event)"
        (reset)="resetOptions()"
      />
    }
    @if (error()) {
      <p class="notice error" role="alert">{{ error() }}</p>
    }
    @if (options(); as initial) {
      <div class="calendar-surface">
        <wts-calendar-angular
          [initialOptions]="initial"
          [events]="events()"
          [controller]="controller"
          (ready)="ready($event)"
          (calendarError)="failed($event)"
        />
      </div>
    } @else if (!error()) {
      <div class="loading-state" role="status">Loading calendar…</div>
    }
    <div class="demo-status" role="status">{{ status() }}</div>
    @if (!compact) {
      <details class="activity">
        <summary>Callback activity ({{ activity().length }} recent)</summary>
        <ol>
          @for (entry of activity(); track $index) {
            <li>{{ entry }}</li>
          }
        </ol>
      </details>
      <details class="configuration">
        <summary>Current configuration & code</summary>
        <p>
          Updates with the active view, date, and options. The setup includes the original sample
          events; event edits are not exported. Site navigation and callback logging are separate.
        </p>
        <div class="framework-tabs" role="group" aria-label="Code framework">
          @for (framework of frameworks; track framework.id) {
            <button
              type="button"
              [attr.aria-pressed]="selectedFramework() === framework.id"
              (click)="selectFramework(framework.id)"
            >
              {{ framework.label }}
            </button>
          }
        </div>
        @if (selectedCode(); as snippet) {
          <ul class="framework-notes">
            @for (note of snippet.notes; track note) {
              <li>{{ note }}</li>
            }
          </ul>
          @if (snippet.supported) {
            <app-code-card
              label="Runtime changes"
              kind="runtime"
              [code]="snippet.runtime"
              [disabled]="!controller.ready()"
            />
            <app-code-card label="Install command" kind="install" [code]="snippet.install" />
            <app-code-card
              label="Current setup"
              kind="setup"
              [code]="snippet.setup"
              [disabled]="!controller.ready()"
            />
          } @else {
            <div class="notice">
              This example has no equivalent native implementation. No incompatible browser code is
              generated for React Native.
            </div>
          }
        }
      </details>
    }
  </div>`,
})
export class CalendarDemo implements OnInit, OnDestroy {
  @Input({ required: true }) demo!: Demo;
  @Input() compact = false;
  get hasViewToolbar(): boolean {
    return Boolean(DEMO_HEADER_VIEWS[this.demo.id]);
  }
  readonly controller = new WtsCalendarAngularController();
  readonly options = signal<WtsCalendarAngularInitialOptions | null>(null);
  readonly events = signal<readonly CalendarEventInput[]>([]);
  readonly title = signal('September 2026');
  readonly status = signal('Loading sample events…');
  readonly error = signal('');
  readonly requests = signal(0);
  readonly imported = signal(false);
  readonly activity = signal<string[]>([]);
  readonly code = signal('');
  readonly changesCode = signal('');
  readonly frameworks = CODE_FRAMEWORKS;
  readonly selectedFramework = signal<CodeFramework>('javascript');
  private readonly codeContext = signal<CodeContext | null>(null);
  readonly selectedCode = computed(() => {
    const context = this.codeContext();
    return context ? frameworkCode(this.selectedFramework(), context) : null;
  });
  readonly activeView = signal('');
  readonly runtimeOptions = signal<RuntimeSnapshot | null>(null);
  readonly runtimeChanges = signal<CalendarOptionChanges>({});
  readonly hasRuntimeChanges = computed(() => Object.keys(this.runtimeChanges()).length > 0);
  readonly editorReady = signal(false);
  readonly localeChoices = signal<LocaleChoice[]>([]);
  readonly timeZoneChoices = signal<SearchChoice[]>([]);
  readonly selectedLocale = signal('en-US');
  readonly selectedTimeZone = signal('UTC');
  readonly localePackCount = signal(0);
  private editor?: CalendarEventEditor;
  private setup?: DemoSetup;
  private initialRuntime?: RuntimeSnapshot;
  private destroyed = false;
  private readonly platformId = inject(PLATFORM_ID);
  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.status.set('Interactive calendar and sample events load in your browser.');
      return;
    }
    try {
      if (this.demo.id === 'locale-rtl' || this.demo.id === 'time-zones') {
        const catalogs = await import('./intl-options');
        if (this.destroyed) return;
        if (this.demo.id === 'locale-rtl') {
          const { calendarLocales } = await import('@wts-calendar/core');
          if (this.destroyed) return;
          this.localePackCount.set(calendarLocales.length);
          this.localeChoices.set(
            catalogs.createLocaleChoices(calendarLocales, navigator.languages),
          );
        } else this.timeZoneChoices.set(catalogs.createTimeZoneChoices());
      }
      const setup = await createDemoSetup(this.demo.id, this.demo.view, () =>
        this.navigate('sample'),
      );
      if (this.destroyed) return;
      const config = setup.options;
      this.setup = setup;
      if (this.compact) config.height = 490;
      this.events.set(this.demo.id === 'event-sources' ? [] : setup.events);
      config.datesSet = () => {
        const api = this.controller.getApi();
        if (api) this.syncRuntimeState(api);
      };
      config.dateClick = (info) => this.dateClick(info);
      config.eventClick = (info) => this.eventClick(info);
      config.select = (info) => this.select(info);
      config.eventDrop = () => this.log('eventDrop: event moved');
      config.eventResize = () => this.log('eventResize: duration changed');
      if (this.demo.id === 'render-hooks') {
        config.eventDidMount = (info) => this.record('eventDidMount: ' + info.event.title);
        config.eventWillUnmount = (info) => this.record('eventWillUnmount: ' + info.event.title);
      }
      if (this.demo.id === 'event-sources') {
        config.lazyFetching = true;
        config.eventSources = [
          {
            id: 'sample',
            loader: async (context) => {
              this.requests.update((value) => value + 1);
              this.log('source loader: ' + context.reason);
              return sampleEvents();
            },
          },
        ];
      }
      this.options.set(config);
    } catch (error) {
      this.failed(error);
    }
  }
  async ready(api: WtsCalendar): Promise<void> {
    this.initialRuntime = readRuntimeOptions(api);
    this.syncRuntimeState(api);
    this.log(api.getEvents().length + ' events loaded · sample dates in September 2026');
    if (this.demo.id === 'event-editor') {
      try {
        const module = await import('@wts-calendar/core/event-editor');
        if (this.destroyed) return;
        this.editor = module.createCalendarEventEditor(api, {
          presentation: 'dialog',
          onSuccess: () => this.log('Event change saved in memory'),
        });
        this.editorReady.set(true);
      } catch (error) {
        this.failed(error);
      }
    }
  }
  navigate(direction: 'previous' | 'next' | 'sample'): void {
    const api = this.controller.getApi();
    if (!api) return;
    if (direction === 'previous') api.previous();
    if (direction === 'next') api.next();
    if (direction === 'sample') api.gotoDate(DEMO_DATE);
    this.syncRuntimeState(api);
    this.log('Navigated to ' + this.title());
  }
  option(changes: CalendarOptionChanges): boolean {
    try {
      const api = this.controller.getApi();
      if (!api) return false;
      const update = api.setOptions(changes);
      this.syncRuntimeState(api, pickRuntimeOptions(update.current));
      this.error.set('');
      this.log('Options updated: ' + Object.keys(changes).join(', '));
      return true;
    } catch (error) {
      this.failed(error);
      return false;
    }
  }
  private syncRuntimeState(api: WtsCalendar, updated?: RuntimeSnapshot): void {
    if (!this.setup || !this.initialRuntime || this.destroyed) return;
    // Option transactions already return a public snapshot. Navigation only
    // changes the view/date, so avoid repeatedly cloning every option getter.
    const current = updated ?? this.runtimeOptions() ?? this.initialRuntime;
    const changes = changedRuntimeOptions(current, this.initialRuntime);
    const view = api.getView();
    const date = api.formatIso(api.getDate(), { omitTime: true });
    this.title.set(view.title);
    this.activeView.set(view.type);
    this.runtimeOptions.set(current);
    this.runtimeChanges.set(changes);
    this.selectedLocale.set(
      typeof current.locale === 'string' ? current.locale : (current.locale?.code ?? 'en-US'),
    );
    this.selectedTimeZone.set(current.timeZone ?? 'UTC');
    this.code.set(demoCode(this.setup, this.demo, changes, view.type, date));
    this.changesCode.set(runtimeCode(changes, view.type, date, this.demo.view));
    this.codeContext.set({
      setup: this.setup,
      demo: this.demo,
      changes,
      view: view.type,
      date,
    });
  }
  selectFramework(framework: CodeFramework): void {
    this.selectedFramework.set(framework);
  }
  resetOptions(): void {
    const api = this.controller.getApi();
    if (!api || !this.initialRuntime) return;
    const keys = Object.keys(this.runtimeChanges()) as (keyof CalendarOptionChanges)[];
    if (!keys.length) return;
    const changes = Object.fromEntries(
      keys.map((key) => [key, this.initialRuntime![key]]),
    ) as CalendarOptionChanges;
    if (keys.includes('timeZone'))
      changes.viewDate = api.formatIso(api.getDate(), { omitTime: true });
    if (this.option(changes))
      this.log('Options reset · current view, date, and event edits preserved');
  }
  setLocale(locale: string): void {
    const choice = this.localeChoices().find((item) => item.value === locale);
    if (choice && this.option({ locale, direction: choice.direction }))
      this.selectedLocale.set(locale);
  }
  setTimeZone(timeZone: string): void {
    const api = this.controller.getApi();
    if (!api || !this.timeZoneChoices().some((item) => item.value === timeZone)) return;
    // Preserve the displayed calendar date, not the old zone's midnight instant.
    const viewDate = api.formatIso(api.getDate(), { omitTime: true });
    if (this.option({ timeZone, viewDate })) this.selectedTimeZone.set(timeZone);
  }
  openEditor(event: Event): void {
    this.editor?.openCreate({
      start: DEMO_DATE + 'T12:00:00Z',
      end: DEMO_DATE + 'T13:00:00Z',
      opener: event.currentTarget as HTMLElement,
    });
  }
  dateClick(info: CalendarDateClickInfo): void {
    this.log('dateClick: ' + info.date.toISOString());
    if (this.demo.id !== 'event-editor' || !this.editor) return;
    this.editor.openCreate({
      start: info.date,
      allDay: info.allDay,
      resourceId: info.resource?.id,
      opener: info.dayEl,
    });
  }
  select(info: CalendarSelection): void {
    this.log('select: ' + info.start.toISOString() + ' → ' + info.end.toISOString());
    if (this.demo.id !== 'event-editor' || !this.editor) return;
    const target = info.jsEvent?.target;
    this.editor.openCreate({
      start: info.start,
      end: info.end,
      allDay: info.allDay,
      resourceId: info.resourceId,
      opener: target instanceof HTMLElement ? target : null,
    });
    this.controller.getApi()?.unselect();
  }
  eventClick(info: CalendarEventClickInfo): void {
    this.log('eventClick: ' + info.event.title);
    if (this.demo.id === 'event-editor' && this.editor && info.event.id)
      this.editor.openEdit(info.event.id, { opener: info.el });
  }
  history(action: 'undo' | 'redo'): void {
    this.log(this.controller.getApi()?.[action]() ? action + ' applied' : 'Nothing to ' + action);
  }
  importIcs(): void {
    try {
      this.controller.getApi()?.importICalendar(SAMPLE_ICS);
      this.imported.set(true);
      this.log('Imported workshop on September 18');
    } catch (error) {
      this.failed(error);
    }
  }
  downloadIcs(): void {
    const api = this.controller.getApi();
    if (!api) return;
    try {
      const url = URL.createObjectURL(
        new Blob([api.exportICalendar()], { type: 'text/calendar;charset=utf-8' }),
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'wts-calendar-sample.ics';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.log('ICS file prepared for download');
    } catch (error) {
      this.failed(error);
    }
  }
  async refresh(): Promise<void> {
    try {
      await this.controller.getApi()?.refetchEvents('sample');
      this.log('Sample source refreshed');
    } catch (error) {
      this.failed(error);
    }
  }
  print(): void {
    window.print();
  }
  failed(error: unknown): void {
    if (!this.destroyed)
      this.error.set(error instanceof Error ? error.message : 'Calendar could not load');
  }
  private record(message: string): void {
    if (!this.destroyed) this.activity.update((items) => [message, ...items].slice(0, 12));
  }
  private log(message: string): void {
    if (!this.destroyed) {
      this.status.set(message);
      this.record(message);
    }
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.editor?.destroy();
  }
}
