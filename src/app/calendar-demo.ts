import { Component, Input, OnInit, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  WtsCalendarAngularComponent,
  WtsCalendarAngularController,
  type WtsCalendarAngularInitialOptions,
} from '@wts-calendar/angular';
import type {
  CalendarEventInput,
  CalendarOptionChanges,
  CalendarThemeName,
  WtsCalendar,
} from '@wts-calendar/core';
import type { CalendarEventEditor } from '@wts-calendar/core/event-editor';
import { createDemoSetup, SAMPLE_ICS } from './demo-setup';
import { DEMO_DATE, sampleEvents } from './sample-data';
import type { Demo } from './site-data';

@Component({
  selector: 'app-calendar-demo',
  host: { ngSkipHydration: 'true' },
  imports: [WtsCalendarAngularComponent],
  template: ` <div class="calendar-demo" [class.compact]="compact">
    @if (demo.id !== 'list' && demo.id !== 'interactions') {
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
        @if (demo.id === 'themes') {
          <label
            >Theme<select (change)="option({ theme: $any($event.target).value })">
              <option>forma</option>
              <option>breezy</option>
              <option>monarch</option>
              <option>pulse</option>
            </select></label
          >
          <label
            >Appearance<select (change)="option({ colorScheme: $any($event.target).value })">
              <option>light</option>
              <option>dark</option>
              <option>auto</option>
            </select></label
          >
          <label class="checkbox-label"
            ><input
              type="checkbox"
              checked
              (change)="option({ weekends: $any($event.target).checked })"
            />
            Weekends</label
          >
        }
        @if (demo.id === 'time-zones') {
          <label
            >Display time zone<select (change)="option({ timeZone: $any($event.target).value })">
              <option>UTC</option>
              <option>America/New_York</option>
              <option>Asia/Kolkata</option>
            </select></label
          >
        }
        @if (demo.id === 'locale-rtl') {
          <label
            >Language<select (change)="setLocale($any($event.target).value)">
              <option value="en-US">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </select></label
          >
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
          ><span>Click an event to edit, duplicate, or delete.</span>
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
        <summary>Initial core configuration</summary>
        <p>
          JavaScript setup for this example. Site navigation and callback logging are separate from
          this configuration.
        </p>
        <div class="code-panel">
          <pre><code>{{code()}}</code></pre>
        </div>
      </details>
    }
  </div>`,
})
export class CalendarDemo implements OnInit, OnDestroy {
  @Input({ required: true }) demo!: Demo;
  @Input() compact = false;
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
  readonly editorReady = signal(false);
  private editor?: CalendarEventEditor;
  private destroyed = false;
  private readonly platformId = inject(PLATFORM_ID);
  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.status.set('Interactive calendar and sample events load in your browser.');
      return;
    }
    try {
      const setup = await createDemoSetup(this.demo.id, this.demo.view, () =>
        this.navigate('sample'),
      );
      if (this.destroyed) return;
      const config = setup.options;
      if (this.compact) config.height = 490;
      this.events.set(this.demo.id === 'event-sources' ? [] : setup.events);
      const displayConfig = { ...config, plugins: undefined, events: setup.events };
      this.code.set(
        [
          "import { WtsCalendar } from '@wts-calendar/core';",
          "import '@wts-calendar/core/styles/calendar.css';",
          ...setup.imports,
          '',
          'const options = ' +
            JSON.stringify(
              displayConfig,
              (_key, value: unknown) => (typeof value === 'function' ? undefined : value),
              2,
            ) +
            ';',
          this.demo.id === 'list' || this.demo.id === 'interactions'
            ? "options.customButtons.sampleDates.click = () => calendar.gotoDate('" +
              DEMO_DATE +
              "');"
            : '',
          this.demo.id === 'render-hooks'
            ? "options.eventContent = info => '◆ ' + info.event.title;"
            : '',
          this.demo.view === 'multi-month' || this.demo.view === 'year'
            ? "options.moreLinkContent = info => '+' + info.count;"
            : '',
          this.demo.id === 'event-sources'
            ? 'const data = options.events;\noptions.events = [];\noptions.eventSources = [{ id: "sample", loader: async () => data }];\noptions.lazyFetching = true;'
            : '',
          'const calendar = new WtsCalendar({ ...options,',
          "  container: document.querySelector('#calendar'),",
          '  plugins: [' + setup.pluginNames.join(', ') + '],',
          '});',
          this.demo.id === 'ics'
            ? '// calendar.importICalendar(icsText);\n// const exported = calendar.exportICalendar();'
            : '',
          this.demo.id === 'event-editor'
            ? "\nimport { createCalendarEventEditor } from '@wts-calendar/core/event-editor';\nconst editor = createCalendarEventEditor(calendar, { presentation: 'dialog' });\n// editor.openCreate();\n// Destroy the editor before destroying the calendar."
            : '',
          '\n// On unmount: calendar.destroy();',
        ]
          .filter((line) => line !== '')
          .join('\n'),
      );
      config.datesSet = () => {
        const api = this.controller.getApi();
        if (api) this.title.set(api.getView().title);
      };
      config.dateClick = (info) => this.log('dateClick: ' + info.date.toISOString());
      config.eventClick = (info) => {
        this.log('eventClick: ' + info.event.title);
        if (this.editor && info.event.id) this.editor.openEdit(info.event.id);
      };
      config.select = (info) =>
        this.log('select: ' + info.start.toISOString() + ' → ' + info.end.toISOString());
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
    this.title.set(api.getView().title);
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
    this.title.set(api.getView().title);
    this.log('Navigated to ' + this.title());
  }
  option(changes: CalendarOptionChanges): void {
    try {
      this.controller.getApi()?.setOptions(changes);
      this.log('Options updated: ' + Object.keys(changes).join(', '));
    } catch (error) {
      this.failed(error);
    }
  }
  setLocale(locale: string): void {
    this.option({ locale, direction: locale === 'ar' ? 'rtl' : 'ltr' });
  }
  openEditor(event: Event): void {
    this.editor?.openCreate({
      start: DEMO_DATE + 'T12:00:00Z',
      end: DEMO_DATE + 'T13:00:00Z',
      opener: event.currentTarget as HTMLElement,
    });
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
