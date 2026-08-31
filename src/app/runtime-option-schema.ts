import type { CalendarOptionChanges, CalendarOptions, WtsCalendar } from '@wts-calendar/core';
export type RuntimeSnapshot = Readonly<Partial<CalendarOptions>>;

type Value = string | number | boolean;
type Scope = 'all' | 'grid' | 'month' | 'time-grid' | 'list' | 'gallery' | 'interaction' | 'source';
export interface RuntimeChoice {
  label: string;
  value: Value;
}
export interface RuntimeControl {
  key: keyof CalendarOptionChanges;
  member?: string;
  label: string;
  help: string;
  group: string;
  scope: Scope;
  choices?: readonly RuntimeChoice[];
}
const choices = (...values: Value[]): RuntimeChoice[] =>
  values.map((value) => ({ label: String(value), value }));
const named = (pairs: readonly (readonly [string, Value])[]): RuntimeChoice[] =>
  pairs.map(([label, value]) => ({ label, value }));

// Curated public runtime options. Construction-only settings, arbitrary code,
// credentials, and premium modules are deliberately not part of this editor.
export const RUNTIME_CONTROLS: readonly RuntimeControl[] = [
  {
    key: 'height',
    label: 'Calendar height',
    help: 'Pixels, or auto to follow the view content.',
    group: 'Layout',
    scope: 'all',
    choices: named([
      ['Auto', 'auto'],
      ['480 px', 480],
      ['640 px', 640],
      ['800 px', 800],
    ]),
  },
  {
    key: 'startOfWeek',
    label: 'First day of week',
    help: 'Reorders weekly columns and aligns week navigation.',
    group: 'Layout',
    scope: 'all',
    choices: named([
      ['Sunday', 0],
      ['Monday', 1],
      ['Tuesday', 2],
      ['Wednesday', 3],
      ['Thursday', 4],
      ['Friday', 5],
      ['Saturday', 6],
    ]),
  },
  {
    key: 'weekends',
    label: 'Show weekends',
    help: 'Include Saturday and Sunday.',
    group: 'Layout',
    scope: 'all',
  },
  {
    key: 'weekNumbers',
    label: 'Show week numbers',
    help: 'Display week numbers alongside the grid.',
    group: 'Layout',
    scope: 'grid',
  },
  {
    key: 'theme',
    label: 'Theme',
    help: 'Use a built-in package theme.',
    group: 'Appearance',
    scope: 'all',
    choices: choices('forma', 'breezy', 'monarch', 'pulse'),
  },
  {
    key: 'colorScheme',
    label: 'Appearance',
    help: 'Light, dark, or the operating system preference.',
    group: 'Appearance',
    scope: 'all',
    choices: choices('light', 'dark', 'auto'),
  },
  {
    key: 'eventTimeFormat',
    label: 'Event time format',
    help: 'Package date-format tokens for event labels.',
    group: 'Events',
    scope: 'all',
    choices: named([
      ['24-hour · 13:00', 'HH:mm'],
      ['12-hour · 01:00 PM', 'hh:mm a'],
      ['12-hour · 1:00 PM', 'h:mm a'],
    ]),
  },
  {
    key: 'displayEventTime',
    label: 'Show event times',
    help: 'Show start times in event labels.',
    group: 'Events',
    scope: 'grid',
  },
  {
    key: 'displayEventEnd',
    label: 'Show event end times',
    help: 'Display end times where the view has room.',
    group: 'Events',
    scope: 'all',
  },
  {
    key: 'eventOrder',
    label: 'Event ordering',
    help: 'Within-day ordering; the calendar still preserves layout constraints.',
    group: 'Events',
    scope: 'all',
    choices: named([
      ['Start time (default)', 'start,-duration,allDay,title'],
      ['Title, then time', 'title,start'],
      ['Latest start first', '-start,title'],
    ]),
  },
  {
    key: 'fixedWeekCount',
    label: 'Always show six weeks',
    help: 'Keep month grids at six rows rather than their natural week count.',
    group: 'Month grid',
    scope: 'month',
  },
  {
    key: 'showNonCurrentDates',
    label: 'Show adjacent-month dates',
    help: 'Display leading and trailing dates outside the month.',
    group: 'Month grid',
    scope: 'month',
  },
  {
    key: 'dayMaxEvents',
    label: 'Visible events per day',
    help: 'Extra events remain available through the overflow popover.',
    group: 'Month grid',
    scope: 'grid',
    choices: named([
      ['Unlimited', false],
      ['1 event', 1],
      ['2 events', 2],
      ['3 events', 3],
      ['5 events', 5],
    ]),
  },
  {
    key: 'slotDuration',
    label: 'Time-slot duration',
    help: 'Minutes per visible slot; also updates dayView.hourSegment and weekView.hourSegment.',
    group: 'Time grid',
    scope: 'time-grid',
    choices: named([
      ['15 minutes', 15],
      ['30 minutes', 30],
      ['60 minutes', 60],
    ]),
  },
  {
    key: 'slotMinTime',
    label: 'Visible day starts',
    help: 'First visible time. Must be before the end time.',
    group: 'Time grid',
    scope: 'time-grid',
    choices: choices('00:00', '06:00', '07:00', '08:00', '09:00', '12:00', '18:00'),
  },
  {
    key: 'slotMaxTime',
    label: 'Visible day ends',
    help: 'Exclusive end time; 24:00 includes the full day.',
    group: 'Time grid',
    scope: 'time-grid',
    choices: choices('06:00', '12:00', '17:00', '18:00', '20:00', '24:00'),
  },
  {
    key: 'slotLabelFormat',
    label: 'Time-axis labels',
    help: 'Format used beside hourly slots.',
    group: 'Time grid',
    scope: 'time-grid',
    choices: named([
      ['24-hour · 13:00', 'HH:mm'],
      ['12-hour · 01:00 PM', 'hh:mm a'],
    ]),
  },
  {
    key: 'allDaySlot',
    label: 'Show all-day row',
    help: 'Keep a separate row for all-day events.',
    group: 'Time grid',
    scope: 'time-grid',
  },
  {
    key: 'slotEventOverlap',
    label: 'Allow visual overlap',
    help: 'Overlap event columns without changing their actual times.',
    group: 'Time grid',
    scope: 'time-grid',
  },
  {
    key: 'listView',
    member: 'eventTimeFormat',
    label: 'Event time format',
    help: 'Format the agenda’s event times using the list-specific API option.',
    group: 'List',
    scope: 'list',
    choices: named([
      ['24-hour · 13:00', 'HH:mm'],
      ['12-hour · 01:00 PM', 'hh:mm a'],
      ['12-hour · 1:00 PM', 'h:mm a'],
    ]),
  },
  {
    key: 'listView',
    member: 'showEmptyDays',
    label: 'Show empty days',
    help: 'Keep date headings even when no events are scheduled.',
    group: 'List',
    scope: 'list',
  },
  {
    key: 'listView',
    member: 'stickyHeaders',
    label: 'Sticky date headings',
    help: 'Keep date headings visible while scrolling non-virtual lists.',
    group: 'List',
    scope: 'list',
  },
  {
    key: 'listView',
    member: 'dayFormat',
    label: 'Date heading format',
    help: 'Package date-format tokens for agenda headings.',
    group: 'List',
    scope: 'list',
    choices: named([
      ['Full date', 'EEEE, MMMM d, yyyy'],
      ['Short date', 'EEE, MMM d'],
      ['Numeric date', 'yyyy-MM-dd'],
    ]),
  },
  {
    key: 'multiMonth',
    member: 'columns',
    label: 'Month columns',
    help: 'Automatic responsive columns, or an explicit column count.',
    group: 'Multi-month',
    scope: 'gallery',
    choices: named([
      ['Auto', 'auto'],
      ['1', 1],
      ['2', 2],
      ['3', 3],
      ['4', 4],
    ]),
  },
  {
    key: 'editable',
    label: 'Drag and resize events',
    help: 'Enable editing in supported grid views; existing constraints still apply.',
    group: 'Interaction',
    scope: 'interaction',
  },
  {
    key: 'selectable',
    label: 'Select date and time ranges',
    help: 'Drag across grid cells to create a selection.',
    group: 'Interaction',
    scope: 'interaction',
  },
  {
    key: 'eventOverlap',
    label: 'Allow overlapping edits',
    help: 'Permit edits that overlap other events, subject to other constraints.',
    group: 'Interaction',
    scope: 'interaction',
  },
  {
    key: 'lazyFetching',
    label: 'Cache covered date ranges',
    help: 'Reuse a loaded source range when navigating inside it. Refetch still forces a request.',
    group: 'Data source',
    scope: 'source',
  },
];

export const RUNTIME_OPTION_KEYS = [
  ...new Set([
    ...RUNTIME_CONTROLS.map((control) => control.key),
    'locale',
    'direction',
    'timeZone',
    'dayView',
    'weekView',
  ]),
] as readonly (keyof CalendarOptionChanges)[];
export const RUNTIME_NESTED_KEYS = ['dayView', 'weekView', 'multiMonth', 'listView'] as const;

export function controlId(control: RuntimeControl): string {
  return control.member ? control.key + '.' + control.member : control.key;
}
export function controlValue(
  options: RuntimeSnapshot | null,
  control: RuntimeControl,
  view?: string,
): unknown {
  // Show the effective duration, not a global default overridden by this view.
  if (control.key === 'slotDuration' && (view === 'day' || view === 'week')) {
    const perView = view === 'day' ? options?.dayView : options?.weekView;
    return perView?.hourSegment ?? options?.slotDuration;
  }
  const value = options?.[control.key];
  return control.member && value && typeof value === 'object'
    ? (value as Record<string, unknown>)[control.member]
    : value;
}
export function controlsForView(demoId: string, view: string): readonly RuntimeControl[] {
  const month = ['month', 'multi-month', 'year'].includes(view);
  const dayGrid = month || view.startsWith('day-grid') || view === 'work-week';
  const timeGrid = view === 'week' || view === 'day';
  const list = view.startsWith('list');
  const interaction = ['interactions', 'constraints', 'event-editor', 'accessibility'].includes(
    demoId,
  );
  return RUNTIME_CONTROLS.filter((control) => {
    // Month overflow and event-time toggles do not control TimeGrid layout.
    if (control.key === 'dayMaxEvents') return dayGrid;
    if (['displayEventTime', 'displayEventEnd', 'eventTimeFormat'].includes(control.key))
      return dayGrid;
    if (control.key === 'weekNumbers') return dayGrid || view === 'week';
    return {
      all: true,
      grid: dayGrid || timeGrid,
      month,
      'time-grid': timeGrid,
      list,
      gallery: view === 'multi-month' || view === 'year',
      interaction: interaction && (dayGrid || timeGrid),
      source: demoId === 'event-sources',
    }[control.scope];
  });
}
export function runtimeChange(control: RuntimeControl, value: unknown): CalendarOptionChanges {
  if (
    control.choices
      ? !control.choices.some((choice) => choice.value === value)
      : typeof value !== 'boolean'
  )
    throw new Error('Choose a supported value for ' + control.label + '.');
  // Explicit per-view durations take precedence in the published package.
  // Keep both public view options aligned so a runtime edit affects the grid.
  if (control.key === 'slotDuration')
    return {
      slotDuration: value as number,
      dayView: { hourSegment: value as number },
      weekView: { hourSegment: value as number },
    };
  return {
    [control.key]: control.member ? { [control.member]: value } : value,
  } as CalendarOptionChanges;
}
export function readRuntimeOptions(api: Pick<WtsCalendar, 'getOption'>): RuntimeSnapshot {
  return Object.fromEntries(RUNTIME_OPTION_KEYS.map((key) => [key, api.getOption(key)]));
}
export function pickRuntimeOptions(options: RuntimeSnapshot): RuntimeSnapshot {
  return Object.fromEntries(RUNTIME_OPTION_KEYS.map((key) => [key, options[key]]));
}
export function changedRuntimeOptions(
  current: RuntimeSnapshot,
  initial: RuntimeSnapshot,
): CalendarOptionChanges {
  return Object.fromEntries(
    RUNTIME_OPTION_KEYS.filter(
      (key) => JSON.stringify(current[key]) !== JSON.stringify(initial[key]),
    ).map((key) => {
      const value = current[key];
      const previous = initial[key];
      if (
        (RUNTIME_NESTED_KEYS as readonly string[]).includes(key) &&
        value &&
        typeof value === 'object' &&
        previous &&
        typeof previous === 'object'
      ) {
        return [
          key,
          Object.fromEntries(
            Object.entries(value).filter(
              ([member, item]) =>
                JSON.stringify(item) !==
                JSON.stringify((previous as Record<string, unknown>)[member]),
            ),
          ),
        ];
      }
      return [key, value];
    }),
  ) as CalendarOptionChanges;
}
