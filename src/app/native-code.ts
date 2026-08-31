import type { CodeContext, FrameworkCode } from './framework-code';
import { demoConfiguration } from './demo-code';

const json = (value: unknown): string =>
  JSON.stringify(
    value,
    (_key, item: unknown) => (typeof item === 'function' ? undefined : item),
    2,
  );
const unsupportedExamples: Readonly<Record<string, string>> = {
  ics: 'The native controller does not expose the browser ICS import/export API.',
  'event-sources':
    'The native controller accepts events, not browser event-source loaders or caching options.',
  'event-editor': 'The browser event-editor dialog is not a native component.',
  interactions:
    'Browser drag, resize, and range-selection interactions are not exposed by the native renderer.',
  constraints:
    'The browser business-hours and interaction-constraint APIs are not exposed by the native renderer.',
  background: 'The native renderer does not implement browser background-event shading.',
};

export function nativeCode(context: CodeContext): FrameworkCode {
  const { setup, demo, changes, view, date } = context;
  const options = demoConfiguration(setup, demo, changes, view, date);
  const nativeView = view.startsWith('list')
    ? 'list'
    : view === 'day-grid-week'
      ? 'week'
      : view === 'day-grid-day'
        ? 'day'
        : ['month', 'week', 'day'].includes(view)
          ? view
          : undefined;
  const unavailable =
    unsupportedExamples[demo.id] ??
    (!nativeView ? 'The native renderer does not provide the "' + view + '" layout.' : '');
  const base = {
    install: 'npm install @wts-calendar/core@^1.1.1 @wts-calendar/react-native@^1.1.0',
    notes: [
      'Uses native iOS/Android controls, not a WebView. Uses the same core 1.1.1 release as this portal with the published React Native 1.1.0 wrapper.',
      'Native week/day layouts are agenda-style, not the browser TimeGrid. Browser CSS, toolbar configuration, slot sizing, formatting strings, and interaction options are not interchangeable.',
      'Locale, time zone, firstDay, hiddenDays, and listDayCount are mount-only. Use the generated initialOptions on a deliberate remount; the native controller has no setOptions() method. Theme and events props can update reactively.',
      ...(Object.keys(changes).length
        ? [
            'This native setup maps supported current settings only. Browser-only options are omitted; it is not an exact export of the web rendering.',
          ]
        : []),
    ],
  };
  if (unavailable)
    return {
      ...base,
      setup: '',
      runtime: '',
      supported: false,
      notes: [
        unavailable,
        'Choose Month, Week, Day, List, recurrence, or a supported customization example for native code.',
        ...base.notes,
      ],
    };
  const firstDay = options.startOfWeek ?? 1;
  const hiddenDays = [
    ...new Set([...(options.hiddenDays ?? []), ...(options.weekends === false ? [0, 6] : [])]),
  ];
  let nativeDate = date;
  let listDayCount: number | undefined;
  if (nativeView === 'list') {
    const current = new Date(date + 'T00:00:00Z');
    if (view === 'list-day') listDayCount = 1;
    else if (view === 'list-week') {
      current.setUTCDate(current.getUTCDate() - ((current.getUTCDay() - firstDay + 7) % 7));
      nativeDate = current.toISOString().slice(0, 10);
      listDayCount = 7;
    } else if (view === 'list-year') {
      const year = current.getUTCFullYear();
      nativeDate = year + '-01-01';
      listDayCount = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
    } else {
      nativeDate = date.slice(0, 7) + '-01';
      listDayCount = new Date(
        Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 0),
      ).getUTCDate();
    }
  }
  const locale = typeof options.locale === 'string' ? options.locale : options.locale?.code;
  const initial = {
    view: nativeView,
    viewDate: nativeDate,
    locale: locale ?? 'en-US',
    timeZone: options.timeZone ?? 'UTC',
    firstDay,
    hiddenDays,
    listDayCount,
    validRange: options.validRange,
  };
  const primary =
    (
      {
        standard: '#0066cc',
        classic: '#2c3e50',
        forma: '#087f5b',
        breezy: '#0369a1',
        monarch: '#6d28d9',
        pulse: '#be185d',
      } as Readonly<Record<string, string>>
    )[options.theme ?? 'standard'] ?? '#0066cc';
  const scheme = options.colorScheme ?? 'light';
  const setupCode = [
    "import { useRef } from 'react';",
    'import { View' +
      (demo.id === 'render-hooks' ? ', Text' : '') +
      (scheme === 'auto' ? ', useColorScheme' : '') +
      " } from 'react-native';",
    "import { WtsCalendarNative, type WtsCalendarNativeHandle, type NativeCalendarOptions, type NativeCalendarEventInput } from '@wts-calendar/react-native';",
    '',
    'const initialOptions: Omit<NativeCalendarOptions, "events"> = ' + json(initial) + ';',
    'const sampleEvents: NativeCalendarEventInput[] = ' + json(setup.events) + ';',
    '',
    'export default function CalendarExample() {',
    '  const calendarRef = useRef<WtsCalendarNativeHandle>(null);',
    scheme === 'auto' ? '  const systemScheme = useColorScheme();' : '',
    '  const dark = ' +
      (scheme === 'auto' ? "systemScheme === 'dark'" : String(scheme === 'dark')) +
      ';',
    '  const theme = {',
    "    background: dark ? '#0f172a' : '#ffffff',",
    "    surface: dark ? '#111827' : '#f8fafc',",
    "    border: dark ? '#374151' : '#d8dee9',",
    "    text: dark ? '#f8fafc' : '#172033',",
    "    mutedText: dark ? '#cbd5e1' : '#536074',",
    "    today: dark ? '#3f3218' : '#e8efff',",
    "    selected: dark ? '#1e3a5f' : '#d9e4ff',",
    '    accent: ' + JSON.stringify(primary) + ',',
    "    accentText: '#ffffff',",
    '    event: ' + JSON.stringify(primary) + ',',
    "    eventText: '#ffffff',",
    '  };',
    '  return (',
    '    <View style={{ flex: 1 }}>',
    '      <WtsCalendarNative',
    '        ref={calendarRef}',
    '        initialOptions={initialOptions}',
    '        events={sampleEvents}',
    '        theme={theme}',
    '        style={{ flex: 1 }}',
    "        onEventPress={event => console.log('Event pressed:', event.id)}",
    demo.id === 'render-hooks'
      ? '        renderEvent={({ event }) => <Text style={{ color: theme.text }}>◆ {event.title}</Text>'
      : '',
    '      />',
    '    </View>',
    '  );',
    '}',
  ]
    .filter((line) => line !== '')
    .join('\n');
  return {
    ...base,
    supported: true,
    setup: setupCode,
    runtime: [
      '// Inside a component handler, after the native calendar has mounted:',
      'const calendar = calendarRef.current?.getApi();',
      'if (calendar) {',
      '  calendar.setView(' + JSON.stringify(nativeView) + ');',
      '  calendar.gotoDate(' + JSON.stringify(nativeDate) + ');',
      '}',
      '// Other mapped settings are in initialOptions above and require a deliberate remount.',
      '// Update theme/events props reactively; do not call the browser setOptions() API.',
    ].join('\n'),
  };
}
