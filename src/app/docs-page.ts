import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS_BASE, DOCS_ROOT } from './site-data';
import { CodeCard } from './code-card';
import {
  BROWSER_SERVER_ADAPTER,
  REACT_NATIVE_SERVER_CLIENT,
  SERVER_INTEGRATIONS,
} from './server-integrations';
@Component({
  selector: 'app-docs-page',
  imports: [RouterLink, CodeCard],
  template: ` <section class="page-heading container">
      <span class="eyebrow">DEVELOPER DOCUMENTATION</span>
      <h1>Your first calendar.<br /><em>Your own stack.</em></h1>
      <p>
        Use the JavaScript core directly or choose a framework wrapper. Add the optional PHP or
        ASP.NET Core server package when your application needs authenticated, durable event APIs.
      </p>
    </section>
    <div class="docs-layout container">
      <section class="docs-main">
        <div class="notice">
          <strong>Looking for an exact option, method, route, or default?</strong>
          <p>
            The generated API reference covers every client option and public calendar API, plus the
            complete PHP and ASP.NET Core route-level contracts.
          </p>
          <a routerLink="/docs/api">Search the complete API reference →</a>
        </div>
        <h2>1. Choose your frontend integration</h2>
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
        <h2>2. Add a backend when your application needs one</h2>
        <p>
          Frontend wrappers render the calendar. The PHP and ASP.NET Core packages implement the
          same server-side event REST contract while your application keeps control of
          authentication, authorization, and durable storage.
        </p>
        <div class="segmented" aria-label="Server integration">
          @for (item of serverIntegrations; track item.id) {
            <button
              [class.active]="serverIntegration() === item"
              [attr.aria-pressed]="serverIntegration() === item"
              (click)="serverIntegration.set(item)"
            >
              {{ item.name }}
            </button>
          }
        </div>
        <app-code-card
          [label]="serverIntegration().installLabel"
          [code]="serverIntegration().install"
        />
        <app-code-card
          [label]="serverIntegration().codeLabel"
          [kind]="serverIntegration().codeKind"
          [code]="serverIntegration().code"
        />
        <p>{{ serverIntegration().note }}</p>
        <div class="docs-links">
          <a [href]="serverIntegration().packageUrl" class="text-link">
            {{ serverIntegration().packageLabel }} ↗
          </a>
          <a [href]="serverIntegration().exampleUrl" class="text-link">
            {{ serverIntegration().exampleLabel }} ↗
          </a>
        </div>
        <h3>Shared HTTP contract</h3>
        <div class="docs-table-scroll" tabindex="0" aria-label="Calendar server HTTP contract">
          <table class="docs-contract-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Route</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>GET</code></td>
                <td><code>/api/calendar/events?start=...&amp;end=...</code></td>
                <td>Load a bounded visible range</td>
              </tr>
              <tr>
                <td><code>GET</code></td>
                <td>
                  <code>/api/calendar/events/{{ '{' }}id{{ '}' }}</code>
                </td>
                <td>Load one event and its <code>ETag</code></td>
              </tr>
              <tr>
                <td><code>POST</code></td>
                <td><code>/api/calendar/events</code></td>
                <td>Create an event</td>
              </tr>
              <tr>
                <td><code>PATCH</code> / <code>PUT</code></td>
                <td>
                  <code>/api/calendar/events/{{ '{' }}id{{ '}' }}</code>
                </td>
                <td>Update with <code>If-Match</code> conflict protection</td>
              </tr>
              <tr>
                <td><code>DELETE</code></td>
                <td>
                  <code>/api/calendar/events/{{ '{' }}id{{ '}' }}</code>
                </td>
                <td>Delete with an optional version precondition</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="server-responsibility-grid">
          <section>
            <h3>The server package handles</h3>
            <ul>
              <li>Typed calendar event requests and responses</li>
              <li>Range validation, CRUD routes, and RFC 7807 errors</li>
              <li><code>ETag</code> and <code>If-Match</code> optimistic concurrency</li>
              <li>A replaceable storage interface</li>
            </ul>
          </section>
          <section>
            <h3>Your application still handles</h3>
            <ul>
              <li>Authentication and event-level authorization</li>
              <li>Database schema, migrations, and tenant isolation</li>
              <li>CORS origins, rate limits, secrets, and monitoring</li>
              <li>Production storage; in-memory stores are demo-only</li>
            </ul>
          </section>
        </div>
        <h2>3. Connect every frontend to the same endpoint</h2>
        <p>
          Angular, React, and Vue use the core REST adapter. It carries mutation versions through
          <code>ETag</code> and <code>If-Match</code> so the server can reject stale edits. React
          Native calls the same authenticated JSON endpoint and passes the resulting events to its
          native component.
        </p>
        <app-code-card label="Angular, React and Vue data adapter" [code]="browserServerAdapter" />
        <app-code-card label="React Native API loading" [code]="reactNativeServerClient" />
        <h2>4. Start with the core</h2>
        <p>
          This minimal JavaScript example uses only Standard features. Framework components manage
          mounting and teardown for you.
        </p>
        <app-code-card label="JavaScript / TypeScript" [code]="quickStart" />
        <h2>5. Explore one feature at a time</h2>
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
        <a routerLink="/docs/api"><strong>Complete API & options reference →</strong></a>
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
  readonly serverIntegrations = SERVER_INTEGRATIONS;
  readonly serverIntegration = signal(this.serverIntegrations[0]!);
  readonly browserServerAdapter = BROWSER_SERVER_ADAPTER;
  readonly reactNativeServerClient = REACT_NATIVE_SERVER_CLIENT;
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
