import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeCard } from './code-card';

const SCHEDULING_EXAMPLE = `import '@wts-calendar/core/styles/calendar.css';
import { WtsCalendar } from '@wts-calendar/core';
import { timeGridModule } from '@wts-calendar/core/time-grid';

const container = document.querySelector<HTMLElement>('#calendar');
if (!container) throw new Error('Calendar container not found');

const calendar = new WtsCalendar({
  container,
  plugins: [timeGridModule],
  view: 'week',
  timeZone: 'America/New_York',
  businessHours: true,
  selectable: true,
  eventSources: [
    async ({ start, end, signal }) => loadSchedule({ start, end, signal }),
  ],
  select: ({ startStr, endStr }) =>
    openAppointmentForm({ start: startStr, end: endStr }),
});`;

@Component({
  selector: 'app-scheduling-calendar-page',
  imports: [RouterLink, CodeCard],
  styles: `
    :host {
      display: block;
    }
    .scheduling-page {
      max-width: 1040px;
      padding-bottom: 72px;
    }
    .scheduling-page > section {
      margin-top: 44px;
    }
    .scheduling-page h2 {
      margin-bottom: 12px;
    }
    .capability-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    .capability-grid article {
      padding: 20px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--wash);
    }
    .capability-grid h3,
    .choice-grid h3 {
      margin-top: 0;
    }
    .capability-grid p {
      margin-bottom: 0;
    }
    .choice-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
      margin-top: 24px;
    }
    .choice-grid article {
      padding: 24px;
      border: 1px solid var(--line);
      border-radius: 6px;
    }
    .choice-grid ul {
      padding-left: 20px;
    }
    .choice-grid li + li {
      margin-top: 8px;
    }
    .scheduling-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }
    @media (max-width: 760px) {
      .capability-grid,
      .choice-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  template: `
    <article class="container scheduling-page">
      <header class="page-heading">
        <span class="eyebrow">JAVASCRIPT / SCHEDULING CALENDAR</span>
        <h1>Embed a scheduling calendar in your application</h1>
        <p>
          WTS Calendar is a TypeScript scheduling calendar library for JavaScript, React, Angular,
          Vue, Web Components, and React Native. Render events and appointments in month, week, day,
          list, multi-month, and resource views while keeping your own application and data layer.
        </p>
        <div class="scheduling-actions">
          <a routerLink="/docs" fragment="quickstart" class="button primary"
            >Install WTS Calendar</a
          >
          <a routerLink="/examples/time-grid-week" class="button">Open the scheduling example</a>
        </div>
      </header>

      <section aria-labelledby="use-cases-heading">
        <h2 id="use-cases-heading">Scheduling UI for real product workflows</h2>
        <p>
          Use one embedded calendar surface for appointments, team schedules, resource allocation,
          availability, or operational planning. WTS Calendar is a client package rather than a
          hosted scheduling service, so authentication, storage, and business ownership remain in
          your application.
        </p>
        <div class="capability-grid">
          <article>
            <h3>Appointment scheduling</h3>
            <p>
              Display working hours, timed events, selection, drag and resize interactions, named
              time zones, and recurring appointments.
            </p>
          </article>
          <article>
            <h3>Resource scheduling</h3>
            <p>
              Organize people, rooms, and equipment in resource grids and timelines with capacity
              and assignment policies.
            </p>
          </article>
          <article>
            <h3>Booking workflows</h3>
            <p>
              Calculate available slots, apply notice and buffer rules, assign staff, and connect
              approval or cancellation actions to your own backend.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="example-heading">
        <h2 id="example-heading">Start with an embedded weekly schedule</h2>
        <p>
          The same core API works in plain JavaScript and through the official React, Angular, and
          Vue wrappers. Event sources receive a bounded visible range and an abort signal, allowing
          the host application to load only the data the current view needs.
        </p>
        <app-code-card label="JavaScript scheduling calendar" [code]="example" />
        <p>
          Configure <code>timeZone</code> as <code>local</code>, <code>UTC</code>, or an IANA zone.
          Calendar views, recurrence, navigation, interactions, and formatting follow the same
          DST-aware date policy.
        </p>
      </section>

      <section aria-labelledby="edition-heading">
        <h2 id="edition-heading">Choose the capabilities your product needs</h2>
        <div class="choice-grid">
          <article>
            <span class="badge">Standard</span>
            <h3>Calendar rendering and interaction</h3>
            <ul>
              <li>Month, DayGrid, TimeGrid, list, multi-month, and year views</li>
              <li>Event sources, recurrence, time zones, selection, drag, and resize</li>
              <li>Angular, React, Vue, Web Component, and React Native adapters</li>
              <li>Rendering hooks, themes, accessibility, and localization</li>
            </ul>
            <a routerLink="/features">Review the complete feature index →</a>
          </article>
          <article>
            <span class="badge premium">Premium</span>
            <h3>Booking and resource operations</h3>
            <ul>
              <li>Available-slot calculation, duration choices, buffers, and minimum notice</li>
              <li>Manual or round-robin staff assignment and capacity-based group booking</li>
              <li>Resource grids, timelines, availability, and advanced planning</li>
              <li>Confirmation, approval, rescheduling, cancellation, and lifecycle hooks</li>
            </ul>
            <a routerLink="/docs/booking">Read the booking and available-slot guide →</a>
          </article>
        </div>
      </section>

      <section class="notice" aria-labelledby="backend-heading">
        <h2 id="backend-heading">Connect your own backend when needed</h2>
        <p>
          WTS Calendar does not require or silently provision a hosted backend. Static schedules can
          stay entirely in the browser. Shared bookings should load bounded event ranges from your
          API and repeat the final availability, resource, and capacity check in an atomic
          server-side transaction.
        </p>
        <div class="docs-links">
          <a routerLink="/docs">Framework quickstarts →</a>
          <a routerLink="/docs/api">Client and server API reference →</a>
          <a routerLink="/contact">Discuss a scheduling integration →</a>
        </div>
      </section>
    </article>
  `,
})
export class SchedulingCalendarPage {
  readonly example = SCHEDULING_EXAMPLE;
}
