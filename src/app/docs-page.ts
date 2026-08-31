import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS_BASE, DOCS_ROOT } from './site-data';
import { CodeCard } from './code-card';
@Component({
  selector: 'app-docs-page',
  imports: [RouterLink, CodeCard],
  template: ` <section class="page-heading container">
      <span class="eyebrow">DEVELOPER DOCUMENTATION</span>
      <h1>Your first calendar.<br /><em>Your own stack.</em></h1>
      <p>
        Use the JavaScript core directly or choose a framework wrapper. All examples on this website
        use the published Angular package.
      </p>
    </section>
    <div class="docs-layout container">
      <section class="docs-main">
        <h2>1. Choose your integration</h2>
        <div class="segmented" aria-label="Framework">
          @for (item of frameworks; track item.name) {
            <button
              [class.active]="framework() === item"
              [attr.aria-pressed]="framework() === item"
              (click)="framework.set(item)"
            >
              {{ item.name }}
            </button>
          }
        </div>
        <app-code-card label="Install command" [code]="framework().install" />
        <p>{{ framework().note }}</p>
        <a [href]="framework().url" class="text-link">Read {{ framework().name }} setup guide ↗</a>
        <h2>2. Start with the core</h2>
        <p>
          This minimal JavaScript example uses only Standard features. Framework components manage
          mounting and teardown for you.
        </p>
        <app-code-card label="JavaScript / TypeScript" [code]="quickStart" />
        <h2>3. Explore one feature at a time</h2>
        <p>
          The examples directory shows the feature options and runtime behavior together. Optional
          modules are loaded only for the relevant examples.
        </p>
        <a class="button primary" routerLink="/examples">Open examples →</a>
        <div class="notice">
          <strong>Runtime-only by design.</strong>
          <p>
            Sample events are stored in memory and reset when you reload or switch examples. This
            demo does not ask for provider credentials, store customer events, or run premium
            integrations.
          </p>
        </div>
      </section>
      <aside class="docs-aside">
        <span class="eyebrow">REFERENCE LIBRARY</span>
        @for (guide of guides; track guide.file) {
          <a [href]="docs + guide.file">{{ guide.name }} ↗</a>
        }
        <div class="notice">
          <strong>Moving an existing calendar to WTS?</strong>
          <p>
            Review supported options and hooks in the migration guide before updating your
            integration. The configuration migration assistant is
            <span class="badge premium">Premium</span>.
          </p>
          <a routerLink="/premium/configuration-migration-assistant">Read the migration guide →</a>
        </div>
      </aside>
    </div>`,
})
export class DocsPage {
  readonly docs = DOCS_BASE;
  readonly frameworks = [
    {
      name: 'JavaScript',
      install: 'npm install @wts-calendar/core',
      url: DOCS_BASE + 'README.md',
      note: 'Mount the core into a browser element, then call destroy() when removing it.',
    },
    {
      name: 'Angular',
      install: 'npm install @wts-calendar/core @wts-calendar/angular',
      url: DOCS_ROOT + 'angular/README.md',
      note: 'A standalone component with typed options, events, outputs, and a controller.',
    },
    {
      name: 'React',
      install: 'npm install @wts-calendar/core @wts-calendar/react',
      url: 'https://www.npmjs.com/package/@wts-calendar/react',
      note: 'Use the React wrapper and its ref-based API. Follow the package README for supported React versions.',
    },
    {
      name: 'Vue',
      install: 'npm install @wts-calendar/core @wts-calendar/vue',
      url: 'https://www.npmjs.com/package/@wts-calendar/vue',
      note: 'A Vue 3 wrapper with reactive inputs and calendar API access.',
    },
    {
      name: 'Web Component',
      install: 'npm install @wts-calendar/core',
      url: DOCS_BASE + 'README.md',
      note: 'Import the web-component entry and follow its registration and property API guide.',
    },
    {
      name: 'React Native',
      install: 'npm install @wts-calendar/core @wts-calendar/react-native',
      url: 'https://www.npmjs.com/package/@wts-calendar/react-native',
      note: 'A separate integration for Android and iOS. This browser showcase is not a native-device test. Follow peer-dependency and platform setup in the package README.',
    },
  ];
  readonly framework = signal(this.frameworks[0]);
  readonly guides = [
    { name: 'API reference', file: 'docs/API.md' },
    { name: 'Configuration', file: 'docs/CONFIGURATION.md' },
    { name: 'Module entry points', file: 'docs/PACKAGE-STRUCTURE.md' },
    { name: 'Event editor', file: 'docs/EVENT-EDITOR.md' },
    { name: 'Plugin SDK', file: 'docs/PLUGIN-SDK.md' },
    { name: 'Developer tools', file: 'docs/DEVELOPER-TOOLS.md' },
    { name: 'Testing toolkit', file: 'docs/TESTING-TOOLKIT.md' },
    { name: 'Data adapter SDK', file: 'docs/DATA-ADAPTER-SDK.md' },
    { name: 'Accessibility', file: 'docs/ACCESSIBILITY.md' },
    { name: 'Credential safety', file: 'docs/CREDENTIALS.md' },
    { name: 'Migration', file: 'docs/MIGRATION.md' },
    { name: 'Troubleshooting', file: 'docs/TROUBLESHOOTING.md' },
  ];
  readonly quickStart = [
    "import { WtsCalendar } from '@wts-calendar/core';",
    "import '@wts-calendar/core/styles/calendar.css';",
    '',
    'const calendar = new WtsCalendar({',
    "  container: document.querySelector('#calendar'),",
    "  view: 'month',",
    "  viewDate: '2026-09-07',",
    "  events: [{ id: 'hello', title: 'Hello, calendar', start: '2026-09-07' }],",
    '});',
    '',
    '// On unmount:',
    '// calendar.destroy();',
  ].join('\n');
}
