import type { CalendarOptionChanges } from '@wts-calendar/core';
import type { DemoSetup } from './demo-setup';
import type { Demo } from './site-data';
import { demoCode, demoConfiguration, runtimeCode } from './demo-code';
import { nativeCode } from './native-code';
import { DEMO_DATE } from './sample-data';

export const CODE_FRAMEWORKS = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'angular', label: 'Angular' },
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'react-native', label: 'React Native' },
] as const;
export type CodeFramework = (typeof CODE_FRAMEWORKS)[number]['id'];
export interface CodeContext {
  setup: DemoSetup;
  demo: Demo;
  changes: CalendarOptionChanges;
  view: string;
  date: string;
}
export interface FrameworkCode {
  setup: string;
  runtime: string;
  install: string;
  notes: readonly string[];
  supported: boolean;
}
export const codeJson = (value: unknown): string =>
  JSON.stringify(
    value,
    (_key, item: unknown) => (typeof item === 'function' ? undefined : item),
    2,
  );
export const indentCode = (code: string, spaces = 2): string =>
  code
    .split('\n')
    .map((line) => (line ? ' '.repeat(spaces) + line : ''))
    .join('\n');

function webOptions(context: CodeContext): string {
  const { setup, demo, changes, view, date } = context;
  const config = demoConfiguration(setup, demo, changes, view, date);
  return [
    'const sampleEvents: CalendarEventInput[] = ' + codeJson(setup.events) + ';',
    '',
    "type InitialOptions = Omit<CalendarOptions, 'container' | 'document' | 'events' | 'resources'>;",
    'function createInitialOptions(',
    '  _getApi: () => WtsCalendar | null,',
    '  _editEvent?: (id: string) => void,',
    '): InitialOptions {',
    '  const options: InitialOptions = ' +
      indentCode(codeJson({ ...config, events: undefined }), 2).trimStart() +
      ';',
    '  options.plugins = [' + setup.pluginNames.join(', ') + '];',
    setup.options.customButtons?.['sampleDates']
      ? "  options.customButtons!['sampleDates']!.click = () => _getApi()?.gotoDate('" +
        DEMO_DATE +
        "');"
      : '',
    demo.id === 'render-hooks' ? "  options.eventContent = info => '◆ ' + info.event.title;" : '',
    demo.view === 'multi-month' || demo.view === 'year'
      ? "  options.moreLinkContent = info => '+' + info.count;"
      : '',
    demo.id === 'event-sources'
      ? "  options.eventSources = [{ id: 'sample', loader: async () => sampleEvents }];"
      : '',
    demo.id === 'event-editor'
      ? '  options.eventClick = info => { if (info.event.id) _editEvent?.(info.event.id); };'
      : '',
    '  return options;',
    '}',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export function frameworkCode(framework: CodeFramework, context: CodeContext): FrameworkCode {
  if (framework === 'react-native') return nativeCode(context);
  const { setup, demo, changes, view, date } = context;
  const runtime = runtimeCode(changes, view, date, demo.view);
  if (framework === 'javascript')
    return {
      setup: demoCode(setup, demo, changes, view, date),
      runtime,
      install: 'npm install @wts-calendar/core',
      notes: [
        'Add a <div id="calendar"></div> host. Destroy the calendar when its host is removed.',
      ],
      supported: true,
    };
  const editor = demo.id === 'event-editor';
  const coreImports = [
    "import type { CalendarOptions, CalendarEventInput, WtsCalendar } from '@wts-calendar/core';",
    ...setup.imports,
    editor
      ? "import { createCalendarEventEditor, type CalendarEventEditor } from '@wts-calendar/core/event-editor';"
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const options = webOptions(context);
  const notes = [
    'initialOptions is mount-only. Apply runtime changes through the wrapper ref/controller, or pass a new options prop/input. The wrapper owns calendar teardown.',
    ...(demo.id === 'ics'
      ? [
          'Use getApi().importICalendar(icsText) and getApi().exportICalendar() for your own import/export controls.',
        ]
      : []),
  ];
  const result = (code: string, api: string): FrameworkCode => ({
    setup: code,
    runtime:
      '// Inside a component event handler, after the calendar is ready:\n' +
      'const calendar = ' +
      api +
      ';\nif (calendar) {\n' +
      indentCode(runtime) +
      '\n}',
    install: 'npm install @wts-calendar/core @wts-calendar/' + framework,
    notes,
    supported: true,
  });

  if (framework === 'react')
    return result(
      [
        "'use client';",
        "import { useRef, useState } from 'react';",
        "import { WtsCalendarReact, type WtsCalendarReactHandle } from '@wts-calendar/react';",
        coreImports,
        "import '@wts-calendar/core/styles/calendar.css';",
        '',
        options,
        '',
        'export default function CalendarExample() {',
        '  const calendarRef = useRef<WtsCalendarReactHandle>(null);',
        editor ? '  const editorRef = useRef<CalendarEventEditor | null>(null);' : '',
        '  const [initialOptions] = useState(() => createInitialOptions(',
        '    () => calendarRef.current?.getApi() ?? null' + (editor ? ',' : ''),
        editor ? '    id => editorRef.current?.openEdit(id),' : '',
        '  ));',
        '  return (',
        '    <>',
        editor
          ? '      <button onClick={() => editorRef.current?.openCreate()}>Create event</button>'
          : '',
        '      <WtsCalendarReact',
        '        ref={calendarRef}',
        '        initialOptions={initialOptions}',
        demo.id !== 'event-sources' ? '        events={sampleEvents}' : '',
        editor
          ? "        onReady={calendar => { editorRef.current = createCalendarEventEditor(calendar, { presentation: 'dialog' }); }}"
          : '',
        editor
          ? '        onDestroy={() => { editorRef.current?.destroy(); editorRef.current = null; }}'
          : '',
        '      />',
        '    </>',
        '  );',
        '}',
      ]
        .filter((line) => line !== '')
        .join('\n'),
      'calendarRef.current?.getApi()',
    );

  if (framework === 'vue')
    return result(
      [
        '<script setup lang="ts">',
        'import { shallowRef' + (editor ? ', onBeforeUnmount' : '') + " } from 'vue';",
        "import { WtsCalendarVue, type WtsCalendarVueExposed } from '@wts-calendar/vue';",
        coreImports,
        "import '@wts-calendar/core/styles/calendar.css';",
        '',
        options,
        'const calendarRef = shallowRef<WtsCalendarVueExposed | null>(null);',
        editor ? 'const editor = shallowRef<CalendarEventEditor | null>(null);' : '',
        'const initialOptions = createInitialOptions(',
        '  () => calendarRef.value?.getApi() ?? null' + (editor ? ',' : ''),
        editor ? '  id => editor.value?.openEdit(id),' : '',
        ');',
        editor
          ? "function ready(calendar: WtsCalendar) { editor.value = createCalendarEventEditor(calendar, { presentation: 'dialog' }); }"
          : '',
        editor ? 'function disposeEditor() { editor.value?.destroy(); editor.value = null; }' : '',
        editor ? 'onBeforeUnmount(disposeEditor);' : '',
        '</script>',
        '',
        '<template>',
        editor ? '  <button @click="editor?.openCreate()">Create event</button>' : '',
        '  <WtsCalendarVue',
        '    ref="calendarRef"',
        '    :initial-options="initialOptions"',
        demo.id !== 'event-sources' ? '    :events="sampleEvents"' : '',
        editor ? '    @ready="ready"\n    @destroy="disposeEditor"' : '',
        '  />',
        '</template>',
      ]
        .filter((line) => line !== '')
        .join('\n'),
      'calendarRef.value?.getApi()',
    );

  return result(
    [
      'import { Component' + (editor ? ', OnDestroy' : '') + " } from '@angular/core';",
      "import { WtsCalendarAngularComponent, WtsCalendarAngularController } from '@wts-calendar/angular';",
      coreImports,
      '',
      '// Add this stylesheet import to src/styles.scss (global, not component-scoped):',
      "// @import '@wts-calendar/core/styles/calendar.css';",
      '',
      options,
      '',
      '@Component({',
      "  selector: 'app-calendar-example',",
      '  standalone: true,',
      '  imports: [WtsCalendarAngularComponent],',
      '  template: ' + String.fromCharCode(96),
      editor ? '    <button (click)="editor?.openCreate()">Create event</button>' : '',
      '    <wts-calendar-angular',
      '      [initialOptions]="initialOptions"',
      '      [controller]="controller"',
      demo.id !== 'event-sources' ? '      [events]="events"' : '',
      editor ? '      (ready)="ready($event)"\n      (calendarDestroy)="disposeEditor()"' : '',
      '    />',
      '  ' + String.fromCharCode(96) + ',',
      '})',
      'export class CalendarExample' + (editor ? ' implements OnDestroy' : '') + ' {',
      '  readonly controller = new WtsCalendarAngularController();',
      demo.id !== 'event-sources' ? '  readonly events = sampleEvents;' : '',
      editor ? '  editor: CalendarEventEditor | null = null;' : '',
      '  readonly initialOptions = createInitialOptions(',
      '    () => this.controller.getApi()' + (editor ? ',' : ''),
      editor ? '    id => this.editor?.openEdit(id),' : '',
      '  );',
      editor
        ? "  ready(calendar: WtsCalendar) { this.editor = createCalendarEventEditor(calendar, { presentation: 'dialog' }); }"
        : '',
      editor
        ? '  disposeEditor() { this.editor?.destroy(); this.editor = null; }\n  ngOnDestroy() { this.disposeEditor(); }'
        : '',
      '}',
    ]
      .filter((line) => line !== '')
      .join('\n'),
    'this.controller.getApi()',
  );
}
