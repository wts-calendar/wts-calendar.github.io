import { DOCS_BASE, DOCS_ROOT } from './site-data';

export interface QuickStart {
  name: string;
  install: string;
  url: string;
  note: string;
  files: readonly { name: string; code: string }[];
}

const css =
  "@import '@wts-calendar/core/styles/calendar.css';\n\nbody { margin: 0; padding: 24px; font-family: system-ui, sans-serif; }\n#calendar { max-width: 1000px; margin: auto; }";
const events =
  "[{ id: 'hello', title: 'Team planning', start: '2026-09-07T10:00:00', end: '2026-09-07T11:00:00' }]";
const options = "{ view: 'month' as const, viewDate: '2026-09-07', height: 'auto' as const }";

export const QUICK_STARTS: readonly QuickStart[] = [
  {
    name: 'JavaScript',
    install:
      'npm create vite@latest my-calendar -- --template vanilla-ts\ncd my-calendar\nnpm install\nnpm install @wts-calendar/core@1.1.4\nnpm run dev',
    url: DOCS_BASE + 'README.md',
    note: 'Create a Vite TypeScript project, then replace these files. The fixed view date keeps the sample event visible whenever you try it.',
    files: [
      {
        name: 'index.html',
        code: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My WTS Calendar</title>\n</head>\n<body>\n  <div id="calendar"></div>\n  <script type="module" src="/src/main.ts"></script>\n</body>\n</html>',
      },
      {
        name: 'src/main.ts',
        code: `import { WtsCalendar } from '@wts-calendar/core';
import './style.css';

const container = document.querySelector<HTMLElement>('#calendar');
if (!container) throw new Error('Missing calendar container');

const calendar = new WtsCalendar({
  container,
  ...${options},
  events: ${events},
});

// Vite cleanup runs only when this module is replaced during development.
if (import.meta.hot) import.meta.hot.dispose(() => calendar.destroy());
// In your app, call calendar.destroy() when removing its container.
`,
      },
      { name: 'src/style.css', code: css },
    ],
  },
  {
    name: 'Angular',
    install:
      'npx @angular/cli@22 new my-calendar --standalone --routing=false --style=css --skip-git\ncd my-calendar\nnpm install @wts-calendar/core@1.1.4 @wts-calendar/angular@1.0.1\nnpm start',
    url: DOCS_ROOT + 'angular/README.md',
    note: 'In an Angular standalone application, replace src/app/app.ts and put the stylesheet import in global src/styles.css. The wrapper handles cleanup.',
    files: [
      {
        name: 'src/app/app.ts',
        code: `import { Component } from '@angular/core';
import { WtsCalendarAngularComponent } from '@wts-calendar/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WtsCalendarAngularComponent],
  template: '<wts-calendar-angular [initialOptions]="initialOptions" [events]="events" />',
})
export class App {
  readonly initialOptions = ${options};
  readonly events = ${events};
}`,
      },
      { name: 'src/styles.css', code: css },
    ],
  },
  {
    name: 'React',
    install:
      'npm create vite@latest my-calendar -- --template react-ts\ncd my-calendar\nnpm install\nnpm install @wts-calendar/core@1.1.4 @wts-calendar/react@1.0.1\nnpm run dev',
    url: 'https://www.npmjs.com/package/@wts-calendar/react',
    note: 'Replace App.tsx and index.css in a Vite React project. Keep Vite’s main.tsx. The wrapper owns mounting and cleanup, including React Strict Mode.',
    files: [
      {
        name: 'src/App.tsx',
        code: `import { WtsCalendarReact } from '@wts-calendar/react';

const initialOptions = ${options};
const events = ${events};

export default function App() {
  return <WtsCalendarReact initialOptions={initialOptions} events={events} />;
}`,
      },
      { name: 'src/index.css', code: css },
    ],
  },
  {
    name: 'Vue',
    install:
      'npm create vite@latest my-calendar -- --template vue-ts\ncd my-calendar\nnpm install\nnpm install @wts-calendar/core@1.1.4 @wts-calendar/vue@1.0.1\nnpm run dev',
    url: 'https://www.npmjs.com/package/@wts-calendar/vue',
    note: 'Replace App.vue and style.css in a Vite Vue 3 project. Keep Vite’s main.ts. The wrapper handles mounting and cleanup.',
    files: [
      {
        name: 'src/App.vue',
        code: `<script setup lang="ts">
import { WtsCalendarVue } from '@wts-calendar/vue';
const initialOptions = ${options};
const events = ${events};
</script>

<template>
  <WtsCalendarVue :initial-options="initialOptions" :events="events" />
</template>`,
      },
      { name: 'src/style.css', code: css },
    ],
  },
  {
    name: 'Web Component',
    install:
      'npm create vite@latest my-calendar -- --template vanilla-ts\ncd my-calendar\nnpm install\nnpm install @wts-calendar/core@1.1.4\nnpm run dev',
    url: DOCS_BASE + 'README.md',
    note: 'Keep Vite’s index.html with its #app element. The custom element connects when appended and cleans up when removed.',
    files: [
      {
        name: 'src/main.ts',
        code: `import { defineWtsCalendarElement, type WtsCalendarElement } from '@wts-calendar/core/web-component';
import './style.css';

defineWtsCalendarElement();
const host = document.querySelector<HTMLElement>('#app');
if (!host) throw new Error('Missing app container');
const calendar = document.createElement('wts-calendar') as WtsCalendarElement;
calendar.options = ${options};
calendar.events = ${events};
host.replaceChildren(calendar);
if (import.meta.hot) import.meta.hot.dispose(() => calendar.remove());`,
      },
      { name: 'src/style.css', code: css },
    ],
  },
  {
    name: 'React Native',
    install: 'npm install @wts-calendar/core@1.1.4 @wts-calendar/react-native@1.1.0',
    url: 'https://www.npmjs.com/package/@wts-calendar/react-native',
    note: 'Add this screen to an existing React Native 0.76+ application with React 18 or 19. Run it with your project’s Android/iOS workflow. Native screens do not import browser CSS.',
    files: [
      {
        name: 'CalendarScreen.tsx',
        code: `import { View } from 'react-native';
import { WtsCalendarNative } from '@wts-calendar/react-native';

const initialOptions = { view: 'month' as const, viewDate: '2026-09-07', timeZone: 'local' };
const events = ${events};

export default function CalendarScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <WtsCalendarNative initialOptions={initialOptions} events={events} />
    </View>
  );
}`,
      },
    ],
  },
];
