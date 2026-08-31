import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { CalendarDemo } from './calendar-demo';
import { DEMOS, FEATURES, LIST_VIEWS } from './site-data';
@Component({
  selector: 'app-examples-page',
  imports: [RouterLink, RouterLinkActive, CalendarDemo],
  template: ` <div class="examples-layout container">
    <aside class="examples-sidebar">
      <span class="eyebrow">EXAMPLE DIRECTORY</span>
      <label class="sidebar-search"
        >Find an example<input
          type="search"
          placeholder="Search examples…"
          (input)="query.set($any($event.target).value)"
      /></label>
      <nav aria-label="Calendar examples">
        @for (group of groups; track group) {
          @if (inGroup(group).length) {
            <h2>{{ group }}</h2>
            @for (example of inGroup(group); track example.id) {
              <a
                [routerLink]="['/examples', example.id]"
                routerLinkActive="active"
                ariaCurrentWhenActive="page"
                >{{ example.title }}</a
              >
            }
          }
        }
      </nav>
      <div class="premium-sidebar">
        <h2>Premium features</h2>
        <p>Available with a separate license.</p>
        @for (group of premiumGroups; track group) {
          <a routerLink="/pricing">{{ group }} <span class="badge premium">Premium</span></a>
        }
        <a class="text-link" routerLink="/features">See all features →</a>
      </div>
    </aside>
    <section class="example-main">
      @for (demo of selected(); track demo.id + ':' + demo.view) {
        <div class="example-heading">
          <div class="breadcrumb">
            <a routerLink="/examples">Examples</a><span aria-hidden="true">/</span>{{ demo.group }}
          </div>
          <div class="title-row">
            <h1>{{ demo.title }}</h1>
          </div>
          <p>{{ demo.description }}</p>
        </div>
        <app-calendar-demo [demo]="demo" />
        <p class="fine-print">
          Changes stay in this browser session and reset when switching examples or reloading. No
          account, backend, or credentials required.
        </p>
      } @empty {
        <div class="empty-state">
          <h1>Example not found</h1>
          <p>
            Choose an example from the directory. Premium features have no public examples on this
            site.
          </p>
          <a class="button primary" routerLink="/examples/month">Open month example →</a
          ><a class="button" routerLink="/features">Feature catalogue</a>
        </div>
      }
    </section>
  </div>`,
})
export class ExamplesPage {
  readonly query = signal('');
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap);
  private readonly queryParams = toSignal(this.route.queryParamMap);
  readonly selected = computed(() =>
    DEMOS.filter((demo) => demo.id === this.params()?.get('id')).map((demo) =>
      demo.id === 'list'
        ? {
            ...demo,
            view:
              LIST_VIEWS.find((view) => view === 'list-' + this.queryParams()?.get('period')) ??
              demo.view,
          }
        : demo,
    ),
  );
  readonly groups = [...new Set(DEMOS.map((demo) => demo.group))];
  readonly premiumGroups = [
    ...new Set(
      FEATURES.filter((feature) => feature.tier === 'Premium').map((feature) => feature.group),
    ),
  ];
  inGroup(group: string) {
    return DEMOS.filter(
      (demo) =>
        demo.group === group &&
        demo.title.toLowerCase().includes(this.query().trim().toLowerCase()),
    );
  }
}
