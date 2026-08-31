import type { CalendarOptionChanges } from '@wts-calendar/core';
import type { DemoSetup } from './demo-setup';
import type { Demo } from './site-data';
import { DEMO_DATE } from './sample-data';
import { RUNTIME_NESTED_KEYS } from './runtime-option-schema';

export function demoConfiguration(
  setup: DemoSetup,
  demo: Demo,
  changes: CalendarOptionChanges,
  view: string,
  viewDate: string,
) {
  const config = setup.options;
  const nested = Object.fromEntries(
    RUNTIME_NESTED_KEYS.filter((key) => changes[key] !== undefined).map((key) => [
      key,
      { ...config[key], ...changes[key] },
    ]),
  );
  return {
    ...config,
    ...changes,
    ...nested,
    view,
    viewDate,
    plugins: undefined,
    buttons: undefined,
    eventSources: undefined,
    events: setup.events,
  };
}

export function demoCode(
  setup: DemoSetup,
  demo: Demo,
  changes: CalendarOptionChanges,
  view: string,
  viewDate: string,
): string {
  const config = setup.options;
  const display = demoConfiguration(setup, demo, changes, view, viewDate);
  return [
    "import { WtsCalendar } from '@wts-calendar/core';",
    "import '@wts-calendar/core/styles/calendar.css';",
    ...setup.imports,
    '',
    'const options = ' +
      JSON.stringify(
        display,
        (_key, value: unknown) => (typeof value === 'function' ? undefined : value),
        2,
      ) +
      ';',
    config.customButtons?.['sampleDates']
      ? "options.customButtons.sampleDates.click = () => calendar.gotoDate('" + DEMO_DATE + "');"
      : '',
    demo.id === 'render-hooks' ? "options.eventContent = info => '◆ ' + info.event.title;" : '',
    demo.view === 'multi-month' || demo.view === 'year'
      ? "options.moreLinkContent = info => '+' + info.count;"
      : '',
    demo.id === 'event-sources'
      ? 'const data = options.events;\noptions.events = [];\noptions.eventSources = [{ id: "sample", loader: async () => data }];'
      : '',
    'const calendar = new WtsCalendar({ ...options,',
    "  container: document.querySelector('#calendar'),",
    '  plugins: [' + setup.pluginNames.join(', ') + '],',
    '});',
    demo.id === 'ics'
      ? '// calendar.importICalendar(icsText);\n// const exported = calendar.exportICalendar();'
      : '',
    demo.id === 'event-editor'
      ? "\nimport { createCalendarEventEditor } from '@wts-calendar/core/event-editor';\nconst editor = createCalendarEventEditor(calendar, { presentation: 'dialog' });\n// editor.openCreate();\n// Destroy the editor before destroying the calendar."
      : '',
    '\n// On unmount: calendar.destroy();',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export function runtimeCode(
  changes: CalendarOptionChanges,
  view: string,
  date: string,
  initialView: string,
): string {
  const lines: string[] = [];
  if (view !== initialView) lines.push('calendar.changeView(' + JSON.stringify(view) + ');');
  // Apply timeZone/view options before navigating to a civil date in that zone.
  if (Object.keys(changes).length)
    lines.push('calendar.setOptions(' + JSON.stringify(changes, null, 2) + ');');
  if (date !== DEMO_DATE || Object.hasOwn(changes, 'timeZone'))
    lines.push('calendar.gotoDate(' + JSON.stringify(date) + ');');
  return lines.length
    ? lines.join('\n')
    : '// Using this example’s default options, view, and sample date.';
}
