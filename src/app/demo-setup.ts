import type { CalendarEventInput, CalendarOptions } from '@wts-calendar/core';
import type { WtsCalendarAngularInitialOptions } from '@wts-calendar/angular';
import { DEMOS, LIST_VIEWS } from './site-data';
import { DEMO_DATE, sampleEvents } from './sample-data';

const GRID_VIEWS = ['month', 'week', 'day'] as const;
const STANDARD_VIEWS = [...GRID_VIEWS, 'list-week'] as const;
// Feature demos switch the same calendar instance; dedicated layout examples
// stay focused on their named view. List has its own range controls.
export const DEMO_HEADER_VIEWS: Readonly<Record<string, readonly string[]>> = {
  list: LIST_VIEWS,
  interactions: GRID_VIEWS,
  // List views intentionally omit background shading.
  background: GRID_VIEWS,
  themes: STANDARD_VIEWS,
  'time-zones': STANDARD_VIEWS,
  'locale-rtl': STANDARD_VIEWS,
  'render-hooks': STANDARD_VIEWS,
  accessibility: STANDARD_VIEWS,
};

export interface DemoSetup {
  options: WtsCalendarAngularInitialOptions;
  events: CalendarEventInput[];
  imports: string[];
  pluginNames: string[];
}
export async function createDemoSetup(
  id: string,
  initialListView?: string,
  onSampleDates?: () => void,
): Promise<DemoSetup> {
  const demo = DEMOS.find((item) => item.id === id);
  if (!demo) throw new Error('Unknown example');
  const headerViews = DEMO_HEADER_VIEWS[id];
  const availableViews = headerViews ?? [demo.view];
  const plugins: NonNullable<CalendarOptions['plugins']>[number][] = [];
  const imports: string[] = [];
  const pluginNames: string[] = [];
  const use = (
    name: string,
    entry: string,
    plugin: NonNullable<CalendarOptions['plugins']>[number],
  ): void => {
    imports.push('import { ' + name + " } from '@wts-calendar/core/" + entry + "';");
    pluginNames.push(name);
    plugins.push(plugin);
  };
  if (availableViews.some((view) => view === 'day' || view === 'week')) {
    use(
      'timeGridModule',
      'time-grid',
      (await import('@wts-calendar/core/time-grid')).timeGridModule,
    );
  }
  if (['multi-month', 'year'].includes(demo.view)) {
    use(
      'multiMonthModule',
      'multi-month',
      (await import('@wts-calendar/core/multi-month')).multiMonthModule,
    );
  }
  if (availableViews.some((view) => view.startsWith('list'))) {
    use('listModule', 'list', (await import('@wts-calendar/core/list')).listModule);
  }
  if (['interactions', 'constraints', 'event-editor', 'accessibility'].includes(id)) {
    use(
      'interactionModule',
      'interaction',
      (await import('@wts-calendar/core/interaction')).interactionModule,
    );
  }
  if (id === 'rrule' || id === 'ics') {
    use('rrulePlugin', 'rrule', (await import('@wts-calendar/core/rrule')).rrulePlugin);
  }
  if (id === 'ics') {
    use(
      'icalendarPlugin',
      'icalendar',
      (await import('@wts-calendar/core/icalendar')).icalendarPlugin,
    );
  }
  const options: WtsCalendarAngularInitialOptions = {
    view: demo.view,
    viewDate: DEMO_DATE,
    timeZone: 'UTC',
    locale: 'en-US',
    startOfWeek: 1,
    weekDaysFormat: 'EEE',
    theme: 'forma',
    colorScheme: 'light',
    height: 640,
    // Natural rows keep the month header compact inside fixed-height previews.
    headerToolbar: false,
    expandRows: false,
    // Each view keeps its native scrollbar; a second floating scrollbar is
    // unnecessary inside an example card (and adds a gutter to month galleries).
    footerScrollbarSticky: false,
    dayMaxEvents: 3,
    editable: ['interactions', 'constraints', 'event-editor', 'accessibility'].includes(id),
    selectable: id === 'interactions' || id === 'constraints',
    plugins,
  };
  const events = sampleEvents();
  if (id === 'list') {
    options.view = LIST_VIEWS.find((view) => view === initialListView) ?? demo.view;
  }
  if (headerViews) {
    options.headerToolbar = {
      start: onSampleDates ? 'prev,next sampleDates' : 'prev,next today',
      center: 'title',
      end: headerViews.join(','),
    };
    options.headerToolbarClass = 'example-native-toolbar';
    options.buttonClass = 'example-native-button';
    options.buttonText = {
      prev: '‹',
      next: '›',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      'list-day': 'Day',
      'list-week': id === 'list' ? 'Week' : 'List',
      'list-month': 'Month',
      'list-year': 'Year',
    };
    options.buttonHints = {
      prev: 'Previous date range',
      next: 'Next date range',
      month: 'Show month view',
      week: 'Show week view',
      day: 'Show day view',
      'list-day': 'Show day agenda',
      'list-week': 'Show week agenda',
      'list-month': 'Show month agenda',
      'list-year': 'Show year agenda',
    };
    if (onSampleDates) {
      options.customButtons = {
        sampleDates: {
          text: 'Sample dates',
          hint: 'Return to sample dates',
          click: () => onSampleDates(),
        },
      };
    }
    if (id === 'locale-rtl') {
      // Let the selected package language pack translate the native view labels.
      options.buttonText = { prev: '‹', next: '›' };
    }
  }
  if (availableViews.some((view) => view === 'day' || view === 'week')) {
    Object.assign(options, { slotMinTime: '07:00', slotMaxTime: '20:00', scrollTime: '08:00' });
  }
  if (id === 'time-zones') {
    // A full-day range keeps shifted events reachable in every display zone.
    Object.assign(options, { slotMinTime: '00:00', slotMaxTime: '24:00' });
  }
  // Galleries and single-row DayGrids follow their content. Only month and
  // hourly/list previews need a full-height frame.
  if (['multi-month', 'year', 'day-grid-week', 'day-grid-day', 'work-week'].includes(demo.view)) {
    options.height = 'auto';
  }
  if (demo.view === 'multi-month' || demo.view === 'year') {
    // Keep narrow day boxes compact; the package popover retains every event.
    options.dayMaxEvents = 1;
    options.moreLinkContent = (info) => '+' + info.count;
    options.moreLinkClick = 'popover';
  }
  if (id === 'multi-month') options.multiMonth = { durationMonths: 3, columns: 'auto' };
  if (id === 'custom-view')
    options.views = {
      'work-week': {
        type: 'day-grid',
        duration: { days: 5 },
        dateIncrement: { weeks: 1 },
        dateAlignment: 'week',
        buttonText: 'Work week',
      },
    };
  if (id === 'recurrence')
    events.push({
      id: 'recurring',
      title: 'Weekly team meeting',
      start: '2026-09-07T09:00:00Z',
      end: '2026-09-07T09:30:00Z',
      color: '#996619',
      recurring: {
        frequency: 'weekly',
        daysOfWeek: [1],
        startTime: '09:00',
        endTime: '09:30',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      },
    });
  if (id === 'rrule')
    events.push({
      id: 'training',
      title: 'Training session',
      start: '2026-09-07T16:00:00Z',
      end: '2026-09-07T17:00:00Z',
      color: '#996619',
      rrule: 'FREQ=WEEKLY;BYDAY=MO,WE;COUNT=8',
      exdate: ['2026-09-09T16:00:00Z'],
    });
  if (id === 'constraints')
    Object.assign(options, {
      businessHours: { daysOfWeek: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
      eventConstraint: 'businessHours',
      selectConstraint: 'businessHours',
      eventOverlap: false,
    });
  if (id === 'background')
    events.push({
      id: 'quiet-time',
      title: 'Quiet work window',
      start: DEMO_DATE + 'T12:00:00Z',
      end: DEMO_DATE + 'T17:00:00Z',
      display: 'background',
      color: '#bce1cf',
    });
  if (id === 'render-hooks') options.eventContent = (info) => '◆ ' + info.event.title;
  return { options, events, imports, pluginNames };
}
export const SAMPLE_ICS = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//WTS Calendar//Public demo//EN',
  'BEGIN:VEVENT',
  'UID:demo-ics-import',
  'DTSTAMP:20260901T000000Z',
  'DTSTART:20260918T100000Z',
  'DTEND:20260918T110000Z',
  'SUMMARY:Imported workshop',
  'END:VEVENT',
  'END:VCALENDAR',
  '',
].join('\r\n');
