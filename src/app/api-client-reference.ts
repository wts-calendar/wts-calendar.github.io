import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CLIENT_OPTIONS,
  CLIENT_METHODS,
  CLIENT_EVENTS,
  CLIENT_SYMBOLS,
  CLIENT_REFERENCE_TYPES,
  CLIENT_PACKAGE,
} from './api-reference-data.generated';
import {
  optionGuide,
  methodDescription,
  METHOD_EXAMPLES,
  FIELD_DESCRIPTIONS,
  VERIFIED_DEFAULTS,
} from './api-guidance';
import { CodeCard } from './code-card';

interface Member {
  name: string;
  type: string;
  optional: boolean;
  description: string;
}
interface Entry {
  name: string;
  description: string;
  signature: string;
  category: string;
  deprecated: string;
  premium: boolean;
  runtime?: boolean;
  required?: boolean;
  defaultValue?: string;
  members: readonly Member[];
  note?: string;
  demo?: string;
  code?: string;
  modules?: readonly string[];
  parameters?: readonly Member[];
  returnType?: string;
}
interface TypeRecord {
  name: string;
  description: string;
  signature: string;
  members: readonly Member[];
  exportedFrom: readonly string[];
}
const typeRecords: readonly TypeRecord[] = (CLIENT_SYMBOLS as readonly TypeRecord[]).concat(
  CLIENT_REFERENCE_TYPES,
);
const typeNames = new Set(typeRecords.map((type) => type.name));
const routes: Record<string, string> = {
  options: '/docs/api',
  methods: '/docs/api/methods',
  events: '/docs/api/events',
  symbols: '/docs/api/exports',
};
const titles: Record<string, string> = {
  options: 'Client options',
  methods: 'Calendar methods',
  events: 'Event notifications',
  symbols: 'Types & exports',
};

export function optionExample(name: string): string | undefined {
  const guide = optionGuide(name);
  if (!guide.value) return undefined;
  return `import type { CalendarOptions } from '@wts-calendar/core';\n\n// Merge this option into your calendar configuration.\nconst options = {\n  ${name}: ${guide.value},\n} satisfies Partial<CalendarOptions>;`;
}

@Component({
  selector: 'app-api-client-reference',
  imports: [RouterLink, CodeCard],
  template: ` <section class="container reference-top">
      <div>
        <a routerLink="/docs">Documentation</a><span aria-hidden="true"> / </span
        ><span>API reference</span>
      </div>
      <h1>{{ title() }}</h1>
      <p>
        Find a setting, inspect its contract, and connect it to a working example.
        <span class="api-badge">core {{ version }}</span>
      </p>
    </section>
    <section class="container reference-workspace">
      <aside class="reference-sidebar">
        <nav aria-label="API reference sections">
          @for (section of sections; track section.kind) {
            <a
              [routerLink]="section.path"
              [attr.aria-current]="kind() === section.kind ? 'page' : null"
              >{{ section.label }}</a
            >
          }
          <a routerLink="/docs/api/server">PHP & ASP.NET Core</a>
        </nav>
        @if (kind() === 'options') {
          <nav aria-label="Option categories" class="reference-categories">
            <h2>Browse by topic</h2>
            <button
              type="button"
              (click)="setCategory('all')"
              [attr.aria-pressed]="category() === 'all'"
            >
              All topics
            </button>
            @for (name of categories; track name) {
              <button
                type="button"
                (click)="setCategory(name)"
                [attr.aria-pressed]="category() === name"
              >
                {{ name }}
              </button>
            }
          </nav>
          <details class="reference-mobile-topics">
            <summary>
              Browse topics · {{ category() === 'all' ? 'All topics' : category() }}
            </summary>
            <nav aria-label="Mobile option categories">
              <button
                type="button"
                (click)="setCategory('all')"
                [attr.aria-pressed]="category() === 'all'"
              >
                All topics
              </button>
              @for (name of categories; track name) {
                <button
                  type="button"
                  (click)="setCategory(name)"
                  [attr.aria-pressed]="category() === name"
                >
                  {{ name }}
                </button>
              }
            </nav>
          </details>
        }
        <a routerLink="/docs" fragment="quickstart" class="reference-start"
          >New here? Build your first calendar →</a
        >
      </aside>
      <div class="reference-main">
        <form class="reference-search" (submit)="$event.preventDefault()">
          <label
            >Search {{ title().toLowerCase() }}
            <input
              type="search"
              placeholder="Try eventClick, time zone, or resize"
              [value]="query()"
              (input)="search($event)"
            />
          </label>
          <div class="reference-filter-row">
            <label class="reference-check"
              ><input
                type="checkbox"
                [checked]="showDeprecated()"
                (change)="toggleDeprecated($event)"
              />
              Include deprecated</label
            >
            @if (kind() === 'options') {
              <label
                >Availability
                <select [value]="availability()" (change)="filterAvailability($event)">
                  <option value="all">All options</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select></label
              >
            }
            @if (query() || category() !== 'all' || availability() !== 'all') {
              <button type="button" class="text-button" (click)="reset()">Clear filters</button>
            }
          </div>
        </form>
        @if (selected(); as entry) {
          <article class="reference-detail" aria-labelledby="reference-entry-title">
            <div class="reference-detail-nav">
              <a [routerLink]="path()">← All {{ title().toLowerCase() }}</a>
              <a
                [routerLink]="path()"
                [queryParams]="{ entry: entry.name }"
                aria-label="Permalink to this entry"
                >Permalink ↗</a
              >
            </div>
            <header>
              <h2 id="reference-entry-title" tabindex="-1">
                <code>{{ entry.name }}</code>
              </h2>
              @if (entry.premium) {
                <span class="badge premium">Premium</span>
              }
              @if (kind() === 'options') {
                <span class="api-badge">{{
                  entry.runtime ? 'Runtime configurable' : 'Construction only'
                }}</span>
              }
            </header>
            <p class="reference-purpose">{{ entry.description }}</p>
            @if (entry.deprecated) {
              <p class="api-deprecated"><strong>Deprecated.</strong> {{ entry.deprecated }}</p>
            }
            @if (entry.note) {
              <p class="reference-note">{{ entry.note }}</p>
            }
            <section>
              <h3>{{ kind() === 'options' ? 'Accepted type' : 'Signature' }}</h3>
              <pre class="api-signature"><code>{{ entry.signature }}</code></pre>
              @if (typeLinks(entry.signature).length) {
                <div class="reference-type-links">
                  <span>Explore types:</span>
                  @for (type of typeLinks(entry.signature); track type) {
                    <a routerLink="/docs/api/exports" [queryParams]="{ entry: type }">{{ type }}</a>
                  }
                </div>
              }
            </section>
            @if (entry.parameters?.length) {
              <section>
                <h3>Parameters</h3>
                <div class="docs-table-scroll" tabindex="0" aria-label="Method parameters">
                  <table class="docs-contract-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Accepted type</th>
                        <th>Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (parameter of entry.parameters; track parameter.name) {
                        <tr>
                          <td>
                            <code>{{ parameter.name }}</code>
                          </td>
                          <td>
                            <code>{{ parameter.type }}</code>
                            @for (type of typeLinks(parameter.type); track type) {
                              <a
                                class="reference-field-type"
                                routerLink="/docs/api/exports"
                                [queryParams]="{ entry: type }"
                                >{{ type }} ↗</a
                              >
                            }
                          </td>
                          <td>{{ parameter.optional ? 'No' : 'Yes' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </section>
            }
            @if (entry.returnType) {
              <section>
                <h3>Returns</h3>
                <code>{{ entry.returnType }}</code>
              </section>
            }
            @if (kind() === 'options') {
              <dl class="reference-facts">
                <div>
                  <dt>When omitted</dt>
                  <dd>
                    {{
                      entry.defaultValue ||
                        (entry.required
                          ? 'Required. Supply this value when constructing directly.'
                          : 'No default is stated in the published declaration. Do not assume false, zero, or an empty value; inspect calendar.getOption after initialization.')
                    }}
                  </dd>
                </div>
                <div>
                  <dt>Changing it</dt>
                  <dd>
                    {{
                      entry.runtime
                        ? 'Use setOption or setOptions on the mounted instance. Check view/module requirements before updating.'
                        : 'Provide at construction. For initial datasets, use the corresponding data/source methods afterwards rather than setOption.'
                    }}
                  </dd>
                </div>
              </dl>
            }
            @if (entry.members.length) {
              <details class="reference-properties" open>
                <summary>Properties ({{ entry.members.length }})</summary>
                <div class="docs-table-scroll" tabindex="0" aria-label="Type properties">
                  <table class="docs-contract-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (member of entry.members; track member.name) {
                        <tr>
                          <td>
                            <code>{{ member.name }}</code
                            ><small>{{ member.optional ? 'Optional' : 'Required' }}</small>
                          </td>
                          <td>
                            <code>{{ member.type }}</code>
                            @for (type of typeLinks(member.type); track type) {
                              <a
                                class="reference-field-type"
                                routerLink="/docs/api/exports"
                                [queryParams]="{ entry: type }"
                                >{{ type }} ↗</a
                              >
                            }
                          </td>
                          <td>{{ fieldDescription(entry.name, member) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </details>
            }
            @if (entry.code) {
              <section>
                <h3>Usage example</h3>
                @if (kind() === 'methods') {
                  <p>
                    This snippet uses an existing <code>calendar</code> instance. Obtain it from
                    your wrapper controller/ref or direct JavaScript setup. Backend persistence
                    remains your responsibility.
                  </p>
                }
                @if (kind() === 'options') {
                  <p>
                    JavaScript options are shared by Angular, React, and Vue wrappers. Merge this
                    fragment into their initial options. React Native has a separate supported
                    option surface.
                  </p>
                }
                <app-code-card [label]="entry.name + ' usage'" [code]="entry.code" />
                <a routerLink="/docs" fragment="quickstart">Complete framework setup →</a>
              </section>
            }
            @if (entry.modules?.length) {
              <section>
                <h3>Import from</h3>
                @for (module of entry.modules; track module) {
                  <code class="reference-module">{{
                    module === '.' ? '@wts-calendar/core' : '@wts-calendar/core/' + module.slice(2)
                  }}</code>
                }
              </section>
            }
            @if (entry.demo) {
              <a class="button" [routerLink]="'/examples/' + entry.demo"
                >Open related interactive example →</a
              >
            }
            @if (entry.premium) {
              <p class="reference-note">
                Premium runtime features require the relevant optional module and a valid
                entitlement. <a routerLink="/features">Find the feature guide</a> for its
                integration and licensing requirements.
              </p>
            }
            @if (related(entry).length) {
              <section>
                <h3>Related entries</h3>
                <div class="reference-type-links">
                  @for (item of related(entry); track item) {
                    <a [routerLink]="path()" [queryParams]="{ entry: item }">{{ item }}</a>
                  }
                </div>
              </section>
            }
          </article>
        } @else if (entryName()) {
          <div class="api-empty">
            <h2>Entry not found</h2>
            <p>
              This name is not in core {{ version }}. Check the spelling or return to the index.
            </p>
            <a [routerLink]="path()">Browse all entries</a>
          </div>
        } @else {
          <div class="reference-results">
            <p role="status" aria-live="polite">
              {{ filtered().length }} entries{{ category() === 'all' ? '' : ' · ' + category() }}
            </p>
            <span>Select an entry for details and linked types.</span>
          </div>
          <div class="reference-index">
            @for (entry of visible(); track entry.name) {
              <a
                [routerLink]="path()"
                [queryParams]="{ entry: entry.name }"
                class="reference-index-row"
              >
                <span
                  ><code>{{ entry.name }}</code>
                  @if (entry.premium) {
                    <span class="badge premium">Premium</span>
                  }
                  @if (entry.deprecated) {
                    <span class="api-badge">Deprecated</span>
                  }
                </span>
                <p>{{ entry.description }}</p>
                <span aria-hidden="true">→</span>
              </a>
            } @empty {
              <div class="api-empty">
                <h2>No matching entries</h2>
                <p>
                  Try a shorter name or clear filters. Deprecated entries are hidden by default.
                </p>
                <button class="button" (click)="reset()">Clear filters</button>
              </div>
            }
          </div>
          @if (filtered().length > limit()) {
            <button class="button reference-more" (click)="limit.set(limit() + 30)">
              Show 30 more ({{ filtered().length - limit() }} remaining)
            </button>
          }
        }
      </div>
    </section>`,
})
export class ApiClientReference {
  readonly kind = input.required<string>();
  readonly version = CLIENT_PACKAGE.version;
  readonly sections = Object.keys(routes).map((kind) => ({
    kind,
    path: routes[kind],
    label: titles[kind],
  }));
  readonly categories = [...new Set(CLIENT_OPTIONS.map((o) => o.category))].sort();
  readonly title = computed(() => titles[this.kind()] || 'API reference');
  readonly path = computed(() => routes[this.kind()] || '/docs/api');
  readonly query = signal('');
  readonly category = signal('all');
  readonly availability = signal('all');
  readonly showDeprecated = signal(false);
  readonly limit = signal(30);
  readonly entryName = signal('');
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) =>
        this.entryName.set(params.get('entry') || this.legacyName(this.route.snapshot.fragment)),
      );
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe((fragment) => {
      if (!this.route.snapshot.queryParamMap.has('entry'))
        this.entryName.set(this.legacyName(fragment));
    });
    afterRenderEffect(() => {
      if (this.entryName())
        this.host.nativeElement
          .querySelector<HTMLElement>('#reference-entry-title')
          ?.focus({ preventScroll: true });
    });
  }
  private legacyName(fragment: string | null): string {
    return fragment?.replace(/^(option-|api-)/, '') || '';
  }
  readonly entries = computed<Entry[]>(() => {
    if (this.kind() === 'options')
      return CLIENT_OPTIONS.map((o) => {
        const guide = optionGuide(o.name);
        const verified = VERIFIED_DEFAULTS[o.name as keyof typeof VERIFIED_DEFAULTS];
        return {
          name: o.name,
          description: guide.description || o.description,
          signature: o.type,
          category: o.category,
          deprecated: o.deprecated,
          premium: o.access === 'Premium',
          runtime: o.runtime,
          required: o.required,
          defaultValue:
            verified !== undefined
              ? JSON.stringify(verified) + ' (verified against core ' + this.version + ')'
              : guide.defaultValue || o.defaultValue,
          members: o.members,
          note: guide.note,
          demo: guide.demo,
          code: optionExample(o.name),
        };
      });
    if (this.kind() === 'methods')
      return CLIENT_METHODS.map((m) => ({
        name: m.name,
        description: methodDescription(m.name, m.description),
        signature: m.signature,
        category: '',
        deprecated: m.deprecated,
        premium: /Resource|Task|Licensed/.test(m.name),
        members: [],
        parameters: m.parameters,
        returnType: m.returnType,
        code: METHOD_EXAMPLES[m.name],
      }));
    if (this.kind() === 'events')
      return CLIENT_EVENTS.map((name) => ({
        name,
        description: `Subscribe to the ${name} event-bus notification. This subscription is separate from setting an option callback.`,
        signature: `calendar.on('${name}', callback): () => void`,
        category: '',
        deprecated: '',
        premium: /resource|task/i.test(name),
        members: [],
        note: 'The event bus exposes CalendarEventCallback. Do not assume its payload equals a similarly named option callback; use the option entry when you need its explicit callback contract.',
        code: `const off = calendar.on('${name}', (detail) => {\n  console.log(detail);\n});\n// In your component cleanup:\n// off();`,
      }));
    const grouped = new Map<string, Entry>();
    for (const symbol of typeRecords as readonly {
      name: string;
      description: string;
      signature: string;
      members: readonly Member[];
      exportedFrom: readonly string[];
    }[]) {
      const existing = grouped.get(symbol.name);
      if (existing) {
        existing.signature += '\n\n' + symbol.signature;
        existing.modules = [...new Set([...(existing.modules || []), ...symbol.exportedFrom])];
        existing.members = [
          ...existing.members,
          ...symbol.members.filter((m) => !existing.members.some((x) => x.name === m.name)),
        ];
      } else
        grouped.set(symbol.name, {
          name: symbol.name,
          description: symbol.description,
          signature: symbol.signature,
          category: '',
          deprecated: '',
          premium: false,
          members: symbol.members,
          modules: symbol.exportedFrom,
        });
    }
    return [...grouped.values()];
  });
  readonly selected = computed(() => this.entries().find((e) => e.name === this.entryName()));
  readonly filtered = computed(() => {
    const words = this.query().toLowerCase().trim().split(/\s+/).filter(Boolean);
    return this.entries().filter((e) => {
      const text =
        `${e.name.replace(/([a-z])([A-Z])/g, '$1 $2')} ${e.name} ${e.description} ${e.signature}`.toLowerCase();
      return (
        (!e.deprecated || this.showDeprecated()) &&
        (this.category() === 'all' || e.category === this.category()) &&
        (this.availability() === 'all' || e.premium === (this.availability() === 'premium')) &&
        words.every((w) => text.includes(w))
      );
    });
  });
  readonly visible = computed(() => this.filtered().slice(0, this.limit()));
  typeLinks(type: string): string[] {
    return [...new Set(type.match(/\b[A-Z][A-Za-z0-9_]+\b/g) || [])].filter((name) =>
      typeNames.has(name),
    );
  }
  fieldDescription(owner: string, member: Member): string {
    return FIELD_DESCRIPTIONS[owner + '.' + member.name] || member.description || '';
  }
  related(entry: Entry): string[] {
    const family = entry.name.match(
      /^(event|dayCell|dayHeader|resource|slot|view|select|time|set|get)/,
    )?.[1];
    return family
      ? this.entries()
          .filter((e) => e.name !== entry.name && e.name.startsWith(family) && !e.deprecated)
          .slice(0, 6)
          .map((e) => e.name)
      : [];
  }
  private browse(): void {
    if (this.entryName())
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { entry: null },
        queryParamsHandling: 'merge',
        fragment: undefined,
      });
  }
  search(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.limit.set(30);
    this.browse();
  }
  setCategory(category: string): void {
    this.category.set(category);
    this.limit.set(30);
    this.browse();
  }
  toggleDeprecated(event: Event): void {
    this.showDeprecated.set((event.target as HTMLInputElement).checked);
    this.limit.set(30);
    this.browse();
  }
  filterAvailability(event: Event): void {
    this.availability.set((event.target as HTMLSelectElement).value);
    this.limit.set(30);
    this.browse();
  }
  reset(): void {
    this.query.set('');
    this.category.set('all');
    this.availability.set('all');
    this.showDeprecated.set(false);
    this.limit.set(30);
    this.browse();
  }
}
