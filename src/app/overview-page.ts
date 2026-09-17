import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarDemo } from './calendar-demo';
import { DEMOS } from './site-data';
@Component({
  selector: 'app-overview-page',
  imports: [RouterLink, CalendarDemo],
  template: `
    <section class="hero container">
      <div class="hero-copy">
        <span class="eyebrow">WTS CALENDAR / CORE</span>
        <h1>Calendar infrastructure for real product workflows.</h1>
        <p>
          Month, week, agenda, editing, recurrence, localization, and resource planning. Use the
          same typed calendar API from Angular, React, Vue, or plain JavaScript.
        </p>
        <div class="actions">
          <a routerLink="/docs" fragment="quickstart" class="button primary">Install and render</a
          ><a routerLink="/examples/event-editor" class="button">Open interactive example</a>
        </div>
        <div class="install-line">
          <span aria-hidden="true">$</span><code>npm install &#64;wts-calendar/core</code>
        </div>
        <p class="hero-note">MIT core · Framework adapters · Optional commercial modules</p>
      </div>
      <div class="hero-preview">
        <div class="preview-caption">
          <span>INTERACTIVE / EVENT EDITOR</span><span>Click a date or event</span>
        </div>
        <app-calendar-demo [demo]="editor" [compact]="true" />
      </div>
    </section>
    <section class="framework-strip container" aria-label="Supported integrations">
      <p>FRAMEWORK ADAPTERS</p>
      <a routerLink="/docs">JavaScript</a><a routerLink="/docs">Angular</a
      ><a routerLink="/docs">React</a><a routerLink="/docs">Vue</a
      ><a routerLink="/docs">Web Components</a><a routerLink="/docs">React Native</a
      ><a routerLink="/docs">PHP / PSR-15</a><a routerLink="/docs">Laravel API</a
      ><a routerLink="/docs">ASP.NET Core API <small>↗</small></a>
    </section>
    <section class="container section-space">
      <div class="section-heading">
        <div>
          <span class="eyebrow">CALENDAR VIEWS</span>
          <h2>Start with the layout your product needs.</h2>
        </div>
        <p>Every preview links to a working example and its current configuration.</p>
      </div>
      <div class="view-cards">
        <a class="view-card" routerLink="/examples/month"
          ><div class="mini-calendar" aria-hidden="true">
            @for (cell of cells; track cell) {
              <span [class.mark]="[5, 9, 16, 18, 23].includes(cell)">{{ cell }}</span>
            }
          </div>
          <div>
            <h3>Month & multi-month</h3>
            <p>Dense date grids for planning and overview screens.</p>
          </div></a
        >
        <a class="view-card" routerLink="/examples/time-grid-week"
          ><div class="mini-week" aria-hidden="true">
            <i>09:00</i><i>10:00</i><i>11:00</i><i>12:00</i><b class="block-one">Design workshop</b
            ><b class="block-two">Focus time</b><b class="block-three">Team review</b>
          </div>
          <div>
            <h3>Week & day</h3>
            <p>Timed layouts for appointments and operational schedules.</p>
          </div></a
        >
        <a class="view-card" routerLink="/examples/list"
          ><div class="mini-list" aria-hidden="true">
            <strong>MONDAY, SEPTEMBER 7</strong>
            <p><span>10:00</span>Roadmap review</p>
            <strong>TUESDAY, SEPTEMBER 8</strong>
            <p><span>13:00</span>Design workshop</p>
            <p><span>15:00</span>Customer catch-up</p>
          </div>
          <div>
            <h3>Agenda & lists</h3>
            <p>Chronological event lists for compact product surfaces.</p>
          </div></a
        >
      </div>
      <a routerLink="/examples" class="text-link section-link">Browse {{ demoCount }} examples</a>
    </section>
    <section class="feature-band">
      <div class="container">
        <span class="eyebrow">CORE CAPABILITIES</span>
        <h2>Common calendar behavior, already wired.</h2>
        <div class="benefit-grid">
          <article>
            <span class="benefit-number">01 / INTERACTION</span>
            <h3>Edit events without rebuilding the basics.</h3>
            <p>
              Drag, resize, select, and edit. Build on typed callbacks and reversible event
              mutations.
            </p>
            <a routerLink="/examples/interactions">Interaction examples</a>
          </article>
          <article>
            <span class="benefit-number">02 / INTEGRATE</span>
            <h3>Keep your existing data layer.</h3>
            <p>
              Use event sources, recurrence, time zones, and optional adapters without adopting a
              hosted backend.
            </p>
            <a routerLink="/examples/event-sources">Event source examples</a>
          </article>
          <article>
            <span class="benefit-number">03 / CUSTOMIZE</span>
            <h3>Match the rest of your interface.</h3>
            <p>
              Shape the view with themes, localized text, render hooks, and a third-party plugin
              SDK.
            </p>
            <a routerLink="/features">Complete feature index</a>
          </article>
        </div>
      </div>
    </section>
    <section class="container premium-banner">
      <div>
        <span class="badge premium">Premium</span>
        <h2>Commercial modules for complex operations.</h2>
        <p>
          Resource planning, premium interoperability, and enterprise workflows. Listed clearly,
          licensed separately.
        </p>
      </div>
      <div class="premium-topics">
        <span>Resource scheduling & timelines</span><span>Capacity, shifts & planning</span
        ><span>Calendar synchronization & migration</span
        ><span>Approvals, policies & workflows</span
        ><a routerLink="/premium/resource-grid" class="button primary">Open Premium guides</a>
      </div>
    </section>
  `,
})
export class OverviewPage {
  readonly editor = DEMOS.find((demo) => demo.id === 'event-editor')!;
  readonly cells = Array.from({ length: 28 }, (_, i) => i + 1);
  readonly demoCount = DEMOS.filter((demo) => demo.directory !== false).length;
}
