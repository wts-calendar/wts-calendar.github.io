import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  CLIENT_API_COUNTS,
  CLIENT_EVENTS,
  CLIENT_METHODS,
  CLIENT_OPTIONS,
  CLIENT_PACKAGE,
  CLIENT_SYMBOLS,
} from './api-reference-data.generated';
import {
  EVENT_FIELDS,
  SERVER_COMPATIBILITY,
  SERVER_OPTIONS,
  SERVER_RESPONSES,
  SERVER_ROUTES,
  SERVER_STORAGE_METHODS,
} from './server-api-reference';

type ReferenceKind = 'options' | 'methods' | 'events' | 'symbols' | 'server';

@Component({
  selector: 'app-api-reference-page',
  imports: [RouterLink],
  template: `
    <section class="page-heading container api-reference-heading">
      <span class="eyebrow">COMPLETE API REFERENCE</span>
      <h1>Every option.<br /><em>One searchable contract.</em></h1>
      <p>
        Search the installed <code>@wts-calendar/core</code> declarations, public calendar methods,
        and every PHP and ASP.NET Core endpoint setting. Types and method signatures are generated
        from the package pinned by this portal.
      </p>
      <div class="api-summary" aria-label="Reference totals">
        <span
          ><strong>{{ counts.options }}</strong> client options</span
        >
        <span
          ><strong>{{ counts.methods }}</strong> public APIs</span
        >
        <span
          ><strong>{{ counts.events }}</strong> event-bus names</span
        >
        <span
          ><strong>{{ counts.symbols }}</strong> exported symbols</span
        >
        <span
          ><strong>{{ serverOptions.length }}</strong> server settings</span
        >
      </div>
    </section>

    <section class="container api-reference-shell">
      <nav class="api-kind-tabs" aria-label="API reference sections">
        <a
          routerLink="/docs/api"
          [class.active]="kind() === 'options'"
          [attr.aria-current]="kind() === 'options' ? 'page' : null"
        >
          Client options
        </a>
        <a
          routerLink="/docs/api/methods"
          [class.active]="kind() === 'methods'"
          [attr.aria-current]="kind() === 'methods' ? 'page' : null"
        >
          Calendar API
        </a>
        <a
          routerLink="/docs/api/events"
          [class.active]="kind() === 'events'"
          [attr.aria-current]="kind() === 'events' ? 'page' : null"
        >
          Events & modules
        </a>
        <a
          routerLink="/docs/api/exports"
          [class.active]="kind() === 'symbols'"
          [attr.aria-current]="kind() === 'symbols' ? 'page' : null"
        >
          Exported symbols
        </a>
        <a
          routerLink="/docs/api/server"
          [class.active]="kind() === 'server'"
          [attr.aria-current]="kind() === 'server' ? 'page' : null"
        >
          Server APIs
        </a>
      </nav>

      <div class="api-filter-bar">
        <label class="api-search-field">
          <span>Search this reference</span>
          <input
            type="search"
            placeholder="Try eventClick, timeZone, setOption…"
            [value]="query()"
            (input)="updateQuery($event)"
          />
        </label>
        @if (kind() === 'options') {
          <label>
            <span>Category</span>
            <select [value]="category()" (change)="updateCategory($event)">
              <option value="all">All categories</option>
              @for (item of categories; track item) {
                <option [value]="item">{{ item }}</option>
              }
            </select>
          </label>
          <label>
            <span>Availability</span>
            <select [value]="access()" (change)="updateAccess($event)">
              <option value="all">All options</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </label>
          <label>
            <span>Lifecycle</span>
            <select [value]="lifecycle()" (change)="updateLifecycle($event)">
              <option value="all">All lifecycle stages</option>
              <option value="runtime">Runtime configurable</option>
              <option value="construction">Construction only</option>
            </select>
          </label>
        }
        @if (kind() === 'server') {
          <label>
            <span>Server package</span>
            <select [value]="serverPackage()" (change)="updateServerPackage($event)">
              <option value="all">PHP and ASP.NET Core</option>
              <option value="PHP">PHP</option>
              <option value="ASP.NET Core">ASP.NET Core</option>
            </select>
          </label>
        }
      </div>

      @if (kind() === 'options') {
        <div class="api-results-heading">
          <p role="status" aria-live="polite">
            <strong>{{ filteredOptions().length }}</strong> matching client options
          </p>
          <p>Runtime options can be changed with <code>calendar.setOption(name, value)</code>.</p>
        </div>
        <div class="api-entry-list">
          @for (option of filteredOptions(); track option.name) {
            <article class="api-entry" [attr.id]="'option-' + option.name">
              <header>
                <h2>
                  <code>{{ option.name }}</code>
                </h2>
                <div class="api-badges">
                  @if (option.access === 'Premium') {
                    <span class="badge premium">Premium</span>
                  }
                  <span class="api-badge">{{
                    option.runtime ? 'Runtime' : 'Construction only'
                  }}</span>
                  <span class="api-badge">{{ option.required ? 'Required' : 'Optional' }}</span>
                </div>
              </header>
              <p>{{ option.description }}</p>
              <dl class="api-definition-grid">
                <div>
                  <dt>Type</dt>
                  <dd>
                    <code>{{ option.type }}</code>
                  </dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{{ option.category }}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{{ option.access }}</dd>
                </div>
                <div>
                  <dt>Documented default</dt>
                  <dd>{{ option.defaultValue || 'Package default / not specified' }}</dd>
                </div>
              </dl>
              @if (option.deprecated) {
                <p class="api-deprecated"><strong>Deprecated:</strong> {{ option.deprecated }}</p>
              }
            </article>
          } @empty {
            <div class="api-empty">
              <h2>No matching options</h2>
              <p>Clear or broaden the filters to see the full typed contract.</p>
            </div>
          }
        </div>
      }

      @if (kind() === 'methods') {
        <div class="api-results-heading">
          <p role="status" aria-live="polite">
            <strong>{{ filteredMethods().length }}</strong> matching public APIs
          </p>
          <p>Obtain the instance directly or through your framework wrapper's controller/ref.</p>
        </div>
        <div class="api-entry-list">
          @for (method of filteredMethods(); track method.name) {
            <article class="api-entry" [attr.id]="'api-' + method.name">
              <header>
                <h2>
                  <code>{{ method.name }}</code>
                </h2>
                <span class="api-badge">{{ method.kind }}</span>
              </header>
              <p>{{ method.description }}</p>
              <pre class="api-signature"><code>{{ method.signature }}</code></pre>
              @if (method.deprecated) {
                <p class="api-deprecated"><strong>Deprecated:</strong> {{ method.deprecated }}</p>
              }
            </article>
          } @empty {
            <div class="api-empty">
              <h2>No matching APIs</h2>
              <p>Try a method such as addEvent, changeView, whenIdle, or destroy.</p>
            </div>
          }
        </div>
      }

      @if (kind() === 'events') {
        <section class="api-server-intro">
          <h2>Public package entrypoints</h2>
          <p>
            {{ clientPackage.name }} v{{ clientPackage.version }} exposes
            {{ counts.entrypoints }} JavaScript entrypoints. Import only the modules your
            application uses so optional integrations remain independently loadable.
          </p>
          <div class="api-entrypoint-list" aria-label="Client package entrypoints">
            @for (entrypoint of clientPackage.entrypoints; track entrypoint) {
              <code>{{
                entrypoint === '.'
                  ? '@wts-calendar/core'
                  : '@wts-calendar/core/' + entrypoint.slice(2)
              }}</code>
            }
          </div>
        </section>
        <div class="api-results-heading">
          <p role="status" aria-live="polite">
            <strong>{{ filteredEvents().length }}</strong> matching event-bus names
          </p>
          <p>
            Subscribe with <code>calendar.on(name, callback)</code>; call the returned function to
            unsubscribe.
          </p>
        </div>
        <div class="api-entry-list">
          @for (eventName of filteredEvents(); track eventName) {
            <article class="api-entry">
              <header>
                <h2>
                  <code>{{ eventName }}</code>
                </h2>
                <span class="api-badge">Event</span>
              </header>
              <p>Typed WtsCalendar event-bus notification.</p>
              <pre
                class="api-signature"
              ><code>const off = calendar.on('{{ eventName }}', callback);</code></pre>
            </article>
          } @empty {
            <div class="api-empty">
              <h2>No matching events</h2>
              <p>Try event, resource, task, source, option, selection, or view.</p>
            </div>
          }
        </div>
      }

      @if (kind() === 'symbols') {
        <div class="api-results-heading">
          <p role="status" aria-live="polite">
            <strong>{{ filteredSymbols().length }}</strong> matching exported symbols
          </p>
          <p>
            Every public name is collected from all {{ counts.entrypoints }} package entrypoints.
          </p>
        </div>
        <div class="api-entry-list">
          @for (symbol of filteredSymbols(); track symbol.name + symbol.signature) {
            <article class="api-entry">
              <header>
                <h2>
                  <code>{{ symbol.name }}</code>
                </h2>
                <span class="api-badge">{{ symbol.kind }}</span>
              </header>
              <p>{{ symbol.description }}</p>
              <pre class="api-signature"><code>{{ symbol.signature }}</code></pre>
              <dl class="api-definition-grid api-symbol-modules">
                <div>
                  <dt>Exported from</dt>
                  <dd>
                    @for (entrypoint of symbol.exportedFrom; track entrypoint) {
                      <code>{{
                        entrypoint === '.'
                          ? '@wts-calendar/core'
                          : '@wts-calendar/core/' + entrypoint.slice(2)
                      }}</code>
                    }
                  </dd>
                </div>
              </dl>
            </article>
          } @empty {
            <div class="api-empty">
              <h2>No matching exports</h2>
              <p>Search by exported name, type, entrypoint, or description.</p>
            </div>
          }
        </div>
      }

      @if (kind() === 'server') {
        <section class="api-server-intro">
          <h2>Shared event REST contract</h2>
          <p>
            Both server packages expose the same route-level adapter contract and concurrency
            semantics. Their field validation and recurrence-key casing have documented differences.
            PHP supplies a PSR-15 handler; ASP.NET Core supplies Minimal API route extensions.
            Authentication, authorization, tenant isolation, and durable storage stay in your
            application.
          </p>
          <div class="docs-table-scroll" tabindex="0" aria-label="Server routes">
            <table class="docs-contract-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Route</th>
                  <th>Success</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                @for (route of serverRoutes; track route.method + route.route) {
                  <tr>
                    <td>
                      <code>{{ route.method }}</code>
                    </td>
                    <td>
                      <code>{{ route.route }}</code>
                    </td>
                    <td>{{ route.success }}</td>
                    <td>{{ route.purpose }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <h2>Range query</h2>
          <dl class="api-definition-grid api-query-grid">
            <div>
              <dt><code>start</code></dt>
              <dd>Required offset-aware ISO instant.</dd>
            </div>
            <div>
              <dt><code>end</code></dt>
              <dd>Required exclusive instant after start; maximum window is configurable.</dd>
            </div>
            <div>
              <dt><code>timeZone</code></dt>
              <dd>Optional supported runtime/system time-zone identifier, up to 100 characters.</dd>
            </div>
            <div>
              <dt><code>cursor</code></dt>
              <dd>Optional pagination cursor. Treat it as an opaque server value.</dd>
            </div>
            <div>
              <dt><code>limit</code></dt>
              <dd>Optional page size, default 250 and maximum 1000 unless reconfigured.</dd>
            </div>
          </dl>
          <h2>Event JSON fields</h2>
          <div class="docs-table-scroll" tabindex="0" aria-label="Server event fields">
            <table class="docs-contract-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Contract</th>
                </tr>
              </thead>
              <tbody>
                @for (field of eventFields; track field[0]) {
                  <tr>
                    <td>
                      <code>{{ field[0] }}</code>
                    </td>
                    <td>
                      <code>{{ field[1] }}</code>
                    </td>
                    <td>{{ field[2] }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
        <div class="api-results-heading">
          <p role="status" aria-live="polite">
            <strong>{{ filteredServerOptions().length }}</strong> matching server settings
          </p>
        </div>
        <div class="api-entry-list">
          @for (option of filteredServerOptions(); track option.package + option.name) {
            <article class="api-entry">
              <header>
                <h2>
                  <code>{{ option.name }}</code>
                </h2>
                <span class="api-badge">{{ option.package }}</span>
              </header>
              <p>{{ option.description }}</p>
              <dl class="api-definition-grid">
                <div>
                  <dt>Type</dt>
                  <dd>
                    <code>{{ option.type }}</code>
                  </dd>
                </div>
                <div>
                  <dt>Default</dt>
                  <dd>
                    <code>{{ option.defaultValue }}</code>
                  </dd>
                </div>
              </dl>
            </article>
          }
        </div>
        <section class="api-response-section">
          <h2>Storage interface</h2>
          <p>
            Production applications implement the same five logical operations. Mutation status is
            one of Created, Updated, Deleted, NotFound, Conflict, or Rejected.
          </p>
          <div class="docs-table-scroll" tabindex="0" aria-label="Server storage interface">
            <table class="docs-contract-table">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>PHP</th>
                  <th>ASP.NET Core</th>
                  <th>Required behavior</th>
                </tr>
              </thead>
              <tbody>
                @for (method of storageMethods; track method.operation) {
                  <tr>
                    <td>{{ method.operation }}</td>
                    <td>
                      <code>{{ method.php }}</code>
                    </td>
                    <td>
                      <code>{{ method.dotnet }}</code>
                    </td>
                    <td>{{ method.contract }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <h2>Runtime compatibility</h2>
          <div class="api-response-grid">
            @for (item of serverCompatibility; track item.package) {
              <article>
                <strong>{{ item.package }} v{{ item.version }}</strong>
                <p>{{ item.runtime }}</p>
                <p>{{ item.dependencies }}</p>
              </article>
            }
          </div>
        </section>
        <section class="api-response-section">
          <h2>Error responses</h2>
          <div class="api-response-grid">
            @for (response of serverResponses; track response.status) {
              <article>
                <strong>{{ response.status }}</strong>
                <p>{{ response.meaning }}</p>
              </article>
            }
          </div>
          <div class="api-compatibility-note">
            <h2>Wire-level differences</h2>
            <ul>
              <li>
                PHP accepts <code>application/json</code> and structured <code>+json</code>; the
                .NET endpoint requires <code>application/json</code>.
              </li>
              <li>
                PHP bounds streams even without Content-Length. Configure the ASP.NET host
                request-body limit for chunked/unknown-length uploads.
              </li>
              <li>
                PHP applies byte limits; .NET applies character limits to text fields. Cursor
                formats also differ, so clients must treat cursors as opaque.
              </li>
              <li>
                PATCH and PUT both replace the event representation; the route ID wins over any body
                ID.
              </li>
              <li>
                ETags are opaque. Send exactly one strong tag or <code>*</code> in If-Match; stale
                writes return 409 and required missing preconditions return 428.
              </li>
            </ul>
          </div>
          <h2>Production checklist</h2>
          <ul>
            <li>
              Register a durable implementation of <code>CalendarEventStoreInterface</code> or
              <code>IWtsCalendarEventStore</code>; bundled in-memory stores are for demos and tests.
            </li>
            <li>
              Apply authentication and event-level authorization before the calendar handler/routes.
            </li>
            <li>
              Scope every storage operation by tenant and user; never trust client-supplied
              ownership fields.
            </li>
            <li>
              Restrict CORS, configure request limits, rate limits, structured logs, metrics, and
              backups.
            </li>
            <li>
              Enable required If-Match checks when clients must never overwrite a newer event
              version.
            </li>
          </ul>
        </section>
      }

      <div class="api-reference-footer">
        <p>
          This reference is synchronized from the package declarations during portal verification.
        </p>
        <a routerLink="/docs" class="button secondary">Back to setup guides →</a>
      </div>
    </section>
  `,
})
export class ApiReferencePage {
  readonly counts = CLIENT_API_COUNTS;
  readonly clientPackage = CLIENT_PACKAGE;
  readonly serverOptions = SERVER_OPTIONS;
  readonly serverRoutes = SERVER_ROUTES;
  readonly serverResponses = SERVER_RESPONSES;
  readonly storageMethods = SERVER_STORAGE_METHODS;
  readonly serverCompatibility = SERVER_COMPATIBILITY;
  readonly eventFields = EVENT_FIELDS;
  readonly kind = signal<ReferenceKind>(
    (inject(ActivatedRoute).snapshot.data['kind'] as ReferenceKind | undefined) ?? 'options',
  );
  readonly query = signal('');
  readonly category = signal('all');
  readonly access = signal('all');
  readonly lifecycle = signal('all');
  readonly serverPackage = signal('all');
  readonly categories = [...new Set(CLIENT_OPTIONS.map((option) => option.category))].sort();
  readonly filteredOptions = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return CLIENT_OPTIONS.filter(
      (option) =>
        (this.category() === 'all' || option.category === this.category()) &&
        (this.access() === 'all' || option.access === this.access()) &&
        (this.lifecycle() === 'all' ||
          (this.lifecycle() === 'runtime' ? option.runtime : !option.runtime)) &&
        (!query ||
          [option.name, option.type, option.description, option.category]
            .join(' ')
            .toLocaleLowerCase()
            .includes(query)),
    );
  });
  readonly filteredMethods = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return CLIENT_METHODS.filter(
      (method) =>
        !query ||
        [method.name, method.signature, method.description]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query),
    );
  });
  readonly filteredEvents = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return CLIENT_EVENTS.filter((eventName) => !query || eventName.includes(query));
  });
  readonly filteredSymbols = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return CLIENT_SYMBOLS.filter(
      (symbol) =>
        !query ||
        [symbol.name, symbol.kind, symbol.signature, symbol.description, ...symbol.exportedFrom]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query),
    );
  });
  readonly filteredServerOptions = computed(() => {
    const query = this.query().trim().toLocaleLowerCase();
    return SERVER_OPTIONS.filter(
      (option) =>
        (this.serverPackage() === 'all' || option.package === this.serverPackage()) &&
        (!query ||
          [option.package, option.name, option.type, option.defaultValue, option.description]
            .join(' ')
            .toLocaleLowerCase()
            .includes(query)),
    );
  });

  updateQuery(event: Event): void {
    this.query.set((event.currentTarget as HTMLInputElement).value);
  }
  updateCategory(event: Event): void {
    this.category.set((event.currentTarget as HTMLSelectElement).value);
  }
  updateAccess(event: Event): void {
    this.access.set((event.currentTarget as HTMLSelectElement).value);
  }
  updateLifecycle(event: Event): void {
    this.lifecycle.set((event.currentTarget as HTMLSelectElement).value);
  }
  updateServerPackage(event: Event): void {
    this.serverPackage.set((event.currentTarget as HTMLSelectElement).value);
  }
}
