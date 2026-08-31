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
        <span class="eyebrow"
          ><span class="status-dot" aria-hidden="true"></span> YOUR SCHEDULE. YOUR WAY.</span
        >
        <h1>One calendar.<br />Every kind of<br /><em>schedule.</em></h1>
        <p>
          A flexible JavaScript calendar for the way you build. Beautiful views, thoughtful
          interactions, and a home in your favorite framework.
        </p>
        <div class="actions">
          <a routerLink="/examples" class="button primary"
            >Explore examples <span aria-hidden="true">→</span></a
          ><a routerLink="/docs" class="button">Get started</a>
        </div>
        <div class="install-line">
          <span aria-hidden="true">$</span><code>npm install &#64;wts-calendar/core</code>
        </div>
        <p class="hero-note">TypeScript · Framework wrappers · MIT-licensed Standard</p>
      </div>
      <div class="hero-preview">
        <div class="preview-caption">
          <span><span class="status-dot" aria-hidden="true"></span> A LITTLE LESS CHAOS</span
          ><span>Built with WTS Calendar</span>
        </div>
        <app-calendar-demo [demo]="month" [compact]="true" />
      </div>
    </section>
    <section class="framework-strip container" aria-label="Supported integrations">
      <p>Fits into your stack.</p>
      <a routerLink="/docs">JavaScript</a><a routerLink="/docs">Angular</a
      ><a routerLink="/docs">React</a><a routerLink="/docs">Vue</a
      ><a routerLink="/docs">Web Components</a
      ><a routerLink="/docs">React Native <small>↗</small></a>
    </section>
    <section class="container section-space">
      <div class="section-heading">
        <div>
          <span class="eyebrow">A DIFFERENT VIEW ON YOUR DAY</span>
          <h2>The big picture.<br />And every little detail.</h2>
        </div>
        <p>Browse interactive examples.<br />Find the view that fits your product.</p>
      </div>
      <div class="view-cards">
        <a class="view-card" routerLink="/examples/month"
          ><div class="mini-calendar" aria-hidden="true">
            @for (cell of cells; track cell) {
              <span [class.mark]="[5, 9, 16, 18, 23].includes(cell)">{{ cell }}</span>
            }
          </div>
          <div>
            <h3>Month & multi-month <span>↗</span></h3>
            <p>See what is coming. Make space for what is next.</p>
          </div></a
        >
        <a class="view-card" routerLink="/examples/time-grid-week"
          ><div class="mini-week" aria-hidden="true">
            <i>09:00</i><i>10:00</i><i>11:00</i><i>12:00</i><b class="block-one">Design workshop</b
            ><b class="block-two">Focus time</b><b class="block-three">Team review</b>
          </div>
          <div>
            <h3>Week & day <span>↗</span></h3>
            <p>Give every appointment its own place in the day.</p>
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
            <h3>Agenda & lists <span>↗</span></h3>
            <p>A clear, chronological look at the days ahead.</p>
          </div></a
        >
      </div>
      <a routerLink="/examples" class="text-link section-link"
        >Explore all {{ demoCount }} examples →</a
      >
    </section>
    <section class="feature-band">
      <div class="container">
        <span class="eyebrow">THE DETAILS ARE BUILT IN</span>
        <h2>Less calendar plumbing.<br /><em>More of your product.</em></h2>
        <div class="benefit-grid">
          <article>
            <span class="benefit-number">01 / INTERACT</span>
            <h3>Make every change feel natural.</h3>
            <p>
              Drag, resize, select, and edit. Build on typed callbacks and reversible event
              mutations.
            </p>
            <a routerLink="/examples/interactions">Try interactions →</a>
          </article>
          <article>
            <span class="benefit-number">02 / INTEGRATE</span>
            <h3>Your data. Your architecture.</h3>
            <p>
              Use event sources, recurrence, time zones, and optional adapters without adopting a
              hosted backend.
            </p>
            <a routerLink="/examples/event-sources">Explore event sources →</a>
          </article>
          <article>
            <span class="benefit-number">03 / MAKE IT YOURS</span>
            <h3>A calendar that belongs.</h3>
            <p>
              Shape the view with themes, localized text, render hooks, and a third-party plugin
              SDK.
            </p>
            <a routerLink="/features">Browse all features →</a>
          </article>
        </div>
      </div>
    </section>
    <section class="container premium-banner">
      <div>
        <span class="badge premium">Premium</span>
        <h2>For schedules with<br />more moving parts.</h2>
        <p>
          Resource planning, premium interoperability, and enterprise workflows. Listed clearly,
          licensed separately.
        </p>
      </div>
      <div class="premium-topics">
        <span>Resource scheduling & timelines</span><span>Capacity, shifts & planning</span
        ><span>Calendar synchronization & migration</span
        ><span>Approvals, policies & workflows</span
        ><a routerLink="/premium/resource-grid" class="button primary">Explore Premium guides →</a>
      </div>
    </section>
  `,
})
export class OverviewPage {
  readonly month = DEMOS[0];
  readonly cells = Array.from({ length: 28 }, (_, i) => i + 1);
  readonly demoCount = DEMOS.length;
}
