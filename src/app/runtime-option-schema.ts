import type {
  CalendarBusinessHours,
  CalendarOptionChanges,
  CalendarOptions,
  WtsCalendar,
} from '@wts-calendar/core';
import { CLIENT_OPTIONS, CLIENT_PACKAGE } from './api-reference-data.generated';
export interface AppearancePreviewOptions {
  dayNarrowWidth?: number;
  eventContrastColor?: string;
}
export type RuntimeSnapshot = Readonly<Partial<CalendarOptions & AppearancePreviewOptions>>;
type RuntimeKey = keyof (CalendarOptionChanges & AppearancePreviewOptions);

type Value = string | number | boolean;
type Scope = 'all' | 'grid' | 'month' | 'time-grid' | 'list' | 'gallery' | 'interaction' | 'source';
export interface RuntimeChoice {
  label: string;
  value: Value;
}
export interface RuntimeControl {
  key: RuntimeKey;
  unreleased?: boolean;
  member?: string;
  preset?:
    | 'business-hours-policy'
    | 'business-hours-days'
    | 'business-hours-start'
    | 'business-hours-end'
    | 'event-contrast';
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
    key: 'dayNarrowWidth',
    label: 'Compact day labels',
    group: 'Appearance',
    scope: 'interaction',
    help: 'Actual day-column threshold; 0 disables. Does not reduce column widths.',
    choices: named([
      ['Off', 0],
      ['100 px (default)', 100],
      ['120 px', 120],
      ['150 px', 150],
    ]),
  },
  {
    key: 'eventContrastColor',
    label: 'Event text contrast',
    group: 'Appearance',
    scope: 'all',
    preset: 'event-contrast',
    help: 'Auto chooses black/white text. Explicit event/source/global text colors win.',
    choices: named([
      ['Theme default', 'theme-default'],
      ['Automatic', 'auto'],
      ['Black', '#000000'],
      ['White', '#ffffff'],
    ]),
  },
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
    key: 'businessHours',
    preset: 'business-hours-policy',
    label: 'Enforce business hours',
    help: 'Show the configured schedule and restrict event edits and selections to it.',
    group: 'Interaction',
    scope: 'interaction',
  },
  {
    key: 'businessHours',
    preset: 'business-hours-days',
    label: 'Business days',
    help: 'Choose the weekdays included in the primary business-hours interval.',
    group: 'Interaction',
    scope: 'interaction',
  },
  {
    key: 'businessHours',
    preset: 'business-hours-start',
    label: 'Starts at',
    help: 'Inclusive start time for the primary business-hours interval.',
    group: 'Interaction',
    scope: 'interaction',
  },
  {
    key: 'businessHours',
    preset: 'business-hours-end',
    label: 'Ends at',
    help: 'Exclusive end time for the primary business-hours interval.',
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
    ...RUNTIME_CONTROLS.filter(controlAvailable).map((control) => control.key),
    'locale',
    'direction',
    'timeZone',
    'eventConstraint',
    'selectConstraint',
    'dayView',
    'weekView',
  ]),
] as readonly (keyof CalendarOptionChanges)[];
export function controlAvailable(control: RuntimeControl): boolean {
  return (
    !control.unreleased || CLIENT_OPTIONS.some((option) => String(option.name) === control.key)
  );
}
export const RUNTIME_PACKAGE_VERSION = CLIENT_PACKAGE.version;
export const RUNTIME_NESTED_KEYS = ['dayView', 'weekView', 'multiMonth', 'listView'] as const;

const DEFAULT_BUSINESS_HOURS: CalendarBusinessHours = {
  daysOfWeek: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '17:00',
};
const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

function primaryBusinessHours(options: RuntimeSnapshot | null): CalendarBusinessHours {
  const configured = options?.businessHours;
  const primary = Array.isArray(configured)
    ? configured[0]
    : configured && configured !== true
      ? configured
      : undefined;
  return {
    daysOfWeek: [
      ...(primary ? (primary.daysOfWeek ?? ALL_WEEKDAYS) : DEFAULT_BUSINESS_HOURS.daysOfWeek!),
    ],
    startTime: primary?.startTime ?? DEFAULT_BUSINESS_HOURS.startTime,
    endTime: primary?.endTime ?? DEFAULT_BUSINESS_HOURS.endTime,
    ...(primary?.resourceIds ? { resourceIds: [...primary.resourceIds] } : {}),
  };
}

function updatePrimaryBusinessHours(
  options: RuntimeSnapshot | null,
  changes: Partial<CalendarBusinessHours>,
): CalendarBusinessHours | readonly CalendarBusinessHours[] {
  const updated = { ...primaryBusinessHours(options), ...changes };
  return Array.isArray(options?.businessHours)
    ? [updated, ...options.businessHours.slice(1)]
    : updated;
}

function minutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function assertBusinessHours(schedule: CalendarBusinessHours): void {
  const startPattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const endPattern = /^(?:(?:[01]\d|2[0-3]):[0-5]\d|24:00)$/;
  if (!startPattern.test(schedule.startTime) || !endPattern.test(schedule.endTime))
    throw new Error('Enter business hours in HH:mm format.');
  if (minutes(schedule.startTime) >= minutes(schedule.endTime))
    throw new Error('Business hours must end after they start.');
  if (!schedule.daysOfWeek?.length) throw new Error('Choose at least one business day.');
}

export function controlId(control: RuntimeControl): string {
  if (control.preset === 'business-hours-policy') return 'businessHoursPolicy';
  if (control.preset === 'business-hours-days') return 'businessHours.daysOfWeek';
  if (control.preset === 'business-hours-start') return 'businessHours.startTime';
  if (control.preset === 'business-hours-end') return 'businessHours.endTime';
  return control.member ? control.key + '.' + control.member : control.key;
}
export function controlValue(
  options: RuntimeSnapshot | null,
  control: RuntimeControl,
  view?: string,
): unknown {
  if (control.preset === 'event-contrast') return options?.eventContrastColor ?? 'theme-default';
  if (control.key === 'dayNarrowWidth') return options?.dayNarrowWidth ?? 100;
  if (control.preset === 'business-hours-policy')
    return (
      options?.businessHours !== false &&
      options?.businessHours !== undefined &&
      options?.eventConstraint === 'businessHours' &&
      options?.selectConstraint === 'businessHours'
    );
  if (control.preset === 'business-hours-days') return primaryBusinessHours(options).daysOfWeek;
  if (control.preset === 'business-hours-start') return primaryBusinessHours(options).startTime;
  if (control.preset === 'business-hours-end') return primaryBusinessHours(options).endTime;
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
  const interaction = dayGrid || timeGrid;
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
export function runtimeChange(
  control: RuntimeControl,
  value: unknown,
  options: RuntimeSnapshot | null = null,
): CalendarOptionChanges {
  if (!controlAvailable(control))
    throw new Error('Unreleased option; unavailable in core ' + CLIENT_PACKAGE.version + '.');
  if (control.preset === 'business-hours-policy') {
    if (typeof value !== 'boolean')
      throw new Error('Choose a supported value for ' + control.label + '.');
    return {
      businessHours: value ? updatePrimaryBusinessHours(options, {}) : false,
      eventConstraint: value ? 'businessHours' : undefined,
      selectConstraint: value ? 'businessHours' : undefined,
    };
  }
  if (control.preset === 'business-hours-days') {
    if (!Array.isArray(value) || value.some((day) => !Number.isInteger(day) || day < 0 || day > 6))
      throw new Error('Choose supported weekdays for ' + control.label + '.');
    const schedule = updatePrimaryBusinessHours(options, {
      daysOfWeek: [...new Set(value as number[])].sort((a, b) => a - b),
    });
    assertBusinessHours(Array.isArray(schedule) ? schedule[0] : schedule);
    return {
      businessHours: schedule,
      eventConstraint: 'businessHours',
      selectConstraint: 'businessHours',
    };
  }
  if (control.preset === 'business-hours-start' || control.preset === 'business-hours-end') {
    if (typeof value !== 'string')
      throw new Error('Choose a supported value for ' + control.label + '.');
    const schedule = updatePrimaryBusinessHours(options, {
      [control.preset === 'business-hours-start' ? 'startTime' : 'endTime']: value,
    });
    assertBusinessHours(Array.isArray(schedule) ? schedule[0] : schedule);
    return {
      businessHours: schedule,
      eventConstraint: 'businessHours',
      selectConstraint: 'businessHours',
    };
  }
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
  if (control.preset === 'event-contrast') {
    return {
      [control.key]: value === 'theme-default' ? undefined : value,
    } as CalendarOptionChanges;
  }
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
