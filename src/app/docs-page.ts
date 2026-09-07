import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS_BASE } from './site-data';
import { QUICK_STARTS } from './quick-starts';
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
        Render a calendar with a visible event, then add editing and connect your data. Choose your
        framework below. Standard examples run without an account or license key.
      </p>
    </section>
    <div class="docs-layout container">
      <section class="docs-main">
        <nav class="docs-links" aria-label="Getting started sections">
          <a routerLink="/docs" fragment="quickstart">Build your first calendar</a>
          <a routerLink="/docs" fragment="next-steps">Add editing & views</a>
          <a routerLink="/docs" fragment="troubleshooting">Troubleshooting</a>
          <a routerLink="/docs" fragment="backend">Optional backend</a>
        </nav>
        <div class="notice">
          <strong>Try the result before installing.</strong>
          <p>
            Open the event editor example, click a date to add an event, then click an event to edit
            it. Changes stay in your browser session.
          </p>
          <a routerLink="/examples/event-editor">Try the editable calendar →</a>
        </div>
        <details class="reference-shortcut">
          <summary>Already integrating? Open the API reference.</summary>
          <strong>Looking for an exact option, method, route, or default?</strong>
          <p>
            The generated API reference covers every client option and public calendar API, plus the
            complete PHP and ASP.NET Core route-level contracts.
          </p>
          <a routerLink="/docs/api">Search the complete API reference →</a>
        </details>
        <h2 id="quickstart">1. Build your first calendar</h2>
        <p>
          Web starters require Node.js 22.22.3 or a compatible version supported by your framework.
          If you already have an application, install the WTS packages from the command below and
          adapt the component files. The examples use published core 1.1.1.
        </p>
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
        @if (framework().name !== 'React Native') {
          <p>
            <a
              class="button"
              [href]="'starters/' + framework().name.toLowerCase().replaceAll(' ', '-') + '.tar.gz'"
              download
              >Download {{ framework().name }} starter →</a
            >
          </p>
          <p>
            Or extract the starter, run <code>npm install</code> and <code>npm run dev</code>, then
            open the local address printed in your terminal.
          </p>
        }
        @for (file of framework().files; track file.name) {
          <app-code-card [label]="file.name" [code]="file.code" />
        }
        <div class="notice" role="note">
          <strong>Expected result: September 2026 with “Team planning” on September 7.</strong>
          <p>
            The view and event dates intentionally match. Once it works, use your application’s
            dates and events. Browser wrappers need the global calendar stylesheet; native screens
            do not.
          </p>
        </div>
        <a [href]="framework().url" class="text-link">Read {{ framework().name }} setup guide ↗</a>
        <h2 id="next-steps">2. Make it useful for your product</h2>
        <div class="server-responsibility-grid">
          <section>
            <h3>Add and edit events</h3>
            <p>
              Use the built-in dialog for date clicks, selection, event updates, and validation.
            </p>
            <a routerLink="/examples/event-editor">Open the editor & framework code →</a>
          </section>
          <section>
            <h3>Switch between month, week, and day</h3>
            <p>Add the optional TimeGrid module and choose the views in your calendar header.</p>
            <a routerLink="/examples/time-grid-week">Open TimeGrid & configuration →</a>
          </section>
          <section>
            <h3>Load your events</h3>
            <p>Start with an events array, then load the visible date range from your own API.</p>
            <a routerLink="/examples/event-sources">Explore sources & caching →</a>
          </section>
          <section>
            <h3>Plan people and resources <span class="badge premium">Premium</span></h3>
            <p>
              See the package screenshot, integration code, and supported behavior before requesting
              a license.
            </p>
            <a routerLink="/premium/resource-grid">Read the resource planning guide →</a>
          </section>
        </div>
        <h2 id="troubleshooting">3. If your first calendar does not appear</h2>
        <dl class="quickstart-help">
          <dt>The grid has no styling</dt>
          <dd>
            Import the calendar CSS globally. Angular component-scoped styles do not replace the
            global import.
          </dd>
          <dt>The calendar appears, then disappears</dt>
          <dd>
            Call destroy() only when removing the calendar. Framework wrappers perform their own
            cleanup.
          </dd>
          <dt>The sample event is missing</dt>
          <dd>
            Keep viewDate and the sample event in the same month. Use the sample dates above before
            changing them.
          </dd>
          <dt>A week or day view is unavailable</dt>
          <dd>
            Import timeGridModule from &#64;wts-calendar/core/time-grid and include it in plugins.
            The default entry includes month and DayGrid views.
          </dd>
          <dt>I see a browser-only or server-rendering error</dt>
          <dd>
            Mount the JavaScript core after its DOM element exists. In server-rendered React
            applications, place the calendar wrapper in a client component and follow your
            framework’s CSS loading rules.
          </dd>
        </dl>
        <a routerLink="/docs/api">Search options and defaults →</a>
        <h2 id="backend">4. Add a backend when your application needs one</h2>
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
        <h3>Connect every frontend to the same endpoint</h3>
        <p>
          Angular, React, and Vue use the core REST adapter. It carries mutation versions through
          <code>ETag</code> and <code>If-Match</code> so the server can reject stale edits. React
          Native calls the same authenticated JSON endpoint and passes the resulting events to its
          native component.
        </p>
        <app-code-card label="Angular, React and Vue data adapter" [code]="browserServerAdapter" />
        <app-code-card label="React Native API loading" [code]="reactNativeServerClient" />
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
  readonly frameworks = QUICK_STARTS;
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
}
