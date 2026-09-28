import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeCard } from './code-card';

const RANGE_LOADING = `import {
  calculateAvailableSlots,
} from '@wts-calendar/core/availability-scheduling';

async function findSlots(rangeStart, rangeEnd, resource, signal) {
  const query = new URLSearchParams({
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
    resourceId: resource.id,
  });

  const response = await fetch('/api/bookings?' + query, { signal });
  if (!response.ok) throw new Error('Unable to load bookings');
  const events = await response.json();

  return calculateAvailableSlots({
    license,
    start: rangeStart,
    end: rangeEnd,
    resource,
    events,
    slotDuration: {
      defaultMinutes: 30,
      allowedMinutes: [15, 30, 60],
    },
    minimumNoticeMinutes: 120,
    eventBufferBeforeMinutes: 10,
    eventBufferAfterMinutes: 15,
    timeZone: 'Europe/London',
    customerTimeZone: 'Asia/Kolkata',
  });
}`;

const SCHEDULER_SETUP = `import {
  CalendarBookingScheduler,
} from '@wts-calendar/core/availability-scheduling';

const bookings = new CalendarBookingScheduler({
  license,
  origin: window.location.origin,
  timeZone: 'Europe/London',
  businessHours: true,
  unavailable: companyClosures,
  slotDuration: { defaultMinutes: 30, allowedMinutes: [15, 30, 60] },
  minimumNoticeMinutes: 60,
  eventBufferBeforeMinutes: 10,
  eventBufferAfterMinutes: 10,
  resources: staff,
  events: existingCalendarEvents,
  appointments: restoredAppointments,
  roundRobinCursor: restoredCursor,
  persistenceAdapter: {
    load: (signal) => api.loadBookingState({ signal }),
    commit: (context) => api.commitBooking(context),
  },
  hooks: {
    transform: (request) => sanitizeBookingForm(request),
    validate: ({ request }) => validateBookingForm(request),
    beforeAction: ({ action, appointment }) => authorize(action, appointment),
    afterAction: ({ action, appointment }) => notify(action, appointment),
    onError: ({ action, error }) => reportBookingFailure(action, error),
  },
});`;

const BOOKING_LIFECYCLE = `const pending = await bookings.create({
  title: 'Product consultation',
  start: '2026-10-01T09:00:00',
  durationMinutes: 30,
  customerTimeZone: 'Asia/Kolkata',
  assignment: {
    mode: 'round-robin',
    resourceIds: ['sam', 'lee'],
  },
  requestedUnits: 1,
  requiresApproval: true,
  formValues: { email: 'buyer@example.com' },
});

await bookings.confirm(pending.id);
await bookings.approve(pending.id);
await bookings.reschedule(pending.id, {
  start: '2026-10-01T10:00:00',
  durationMinutes: 30,
});
await bookings.cancel(pending.id, 'Customer requested cancellation');`;

@Component({
  selector: 'app-booking-guide',
  imports: [RouterLink, CodeCard],
  styles: `
    :host {
      display: block;
    }
    .booking-guide {
      max-width: 960px;
      padding-block: 32px 64px;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;
      margin: 24px 0;
    }
    section {
      margin-block: 36px;
      scroll-margin-top: 90px;
    }
    li {
      margin-block: 8px;
    }
  `,
  template: `
    <article class="container booking-guide">
      <a routerLink="/docs">← Documentation</a>
      <h1>Booking and available-slot integration</h1>
      <p>
        New to the package? Start with the
        <a routerLink="/scheduling-calendar">JavaScript scheduling calendar overview</a>.
      </p>
      <p class="notice" role="note">
        <strong>Premium, headless, and backend-neutral.</strong>
        The availability calculator and booking scheduler provide policy and workflow APIs. Your
        application owns the form UI, HTTP endpoints, authentication, and durable storage.
      </p>

      <nav aria-label="Booking guide">
        <a routerLink="/docs/booking" fragment="architecture">Architecture</a>
        <a routerLink="/docs/booking" fragment="availability">Available slots</a>
        <a routerLink="/docs/booking" fragment="workflow">Booking workflow</a>
        <a routerLink="/docs/booking" fragment="lifecycle">Lifecycle</a>
        <a routerLink="/docs/booking" fragment="conflicts">Conflict boundary</a>
      </nav>

      <section id="architecture">
        <h2>Keep rendering and availability queries bounded</h2>
        <p>
          The rendered calendar should load only its visible date range. A booking form may search a
          different bounded range and pass those busy events to
          <code>calculateAvailableSlots()</code>. The calculator intentionally performs no HTTP
          request: endpoint paths, authorization, headers, tenant rules, and response mapping belong
          to the consuming application.
        </p>
        <p>
          Do not download a full year of high-volume bookings just to render one month. Request the
          visible or searched range and resource, cancel obsolete requests, and optionally cache
          adjacent ranges. A month-wise event source and a slot-search request are related but
          independent data flows.
        </p>
      </section>

      <section id="availability">
        <h2>Fetch busy events, then calculate slots</h2>
        <app-code-card label="Server-backed available slots" [code]="rangeLoading" />
        <p>
          Slot results include calendar-zone ISO values, optional customer-zone values, the selected
          duration, resource ID, and remaining capacity. Existing event times are not changed when
          buffers are applied.
        </p>
        <ul>
          <li>Configurable default, allowed, minimum, maximum, and increment durations</li>
          <li>Minimum booking notice with a deterministic clock override</li>
          <li>Buffers before and after existing appointments</li>
          <li>Global or resource working hours and exact unavailable ranges</li>
          <li>Recurring busy events, time-zone conversion, resource capacity, and group units</li>
        </ul>
      </section>

      <section id="workflow">
        <h2>Coordinate a custom booking interface</h2>
        <p>
          <code>CalendarBookingScheduler</code> is UI-independent. Connect it to any form, modal,
          page, framework component, REST API, GraphQL service, or local prototype. It returns
          immutable snapshots and structured validation issues without requiring the rendered
          calendar.
        </p>
        <app-code-card label="Headless scheduler setup" [code]="schedulerSetup" />
        <p>
          Manual assignment validates a chosen resource. Round-robin assignment scans an eligible
          staff pool deterministically and advances its cursor only after a successful commit.
          Weighted <code>requestedUnits</code> support capacity-based group bookings.
        </p>
      </section>

      <section id="lifecycle">
        <h2>Confirmation, approval, rescheduling, and cancellation</h2>
        <app-code-card label="Appointment lifecycle" [code]="bookingLifecycle" />
        <p>
          Appointment states are <code>pending</code>, <code>confirmed</code>,
          <code>approved</code>, <code>rejected</code>, and <code>cancelled</code>. Rejected and
          cancelled records remain available for history but stop reserving capacity. Form
          transformation, validation, before-action, after-action, status-specific, and error hooks
          let the host connect policy, analytics, notifications, and custom UI feedback.
        </p>
      </section>

      <section id="conflicts">
        <h2>Make the backend authoritative</h2>
        <p>
          One scheduler instance serializes its mutations and rechecks availability immediately
          before a local commit. The optional persistence adapter commits before local state changes
          and supports idempotency keys, optimistic revisions, abort signals, and structured
          conflict or rejection results.
        </p>
        <p>
          Separate browsers are not made atomic by client-side calculation. The backend must repeat
          the time, resource, and capacity check inside a transaction or equivalent atomic write. A
          rejected server commit leaves the scheduler's previous local state intact.
        </p>
      </section>

      <section>
        <h2>Compatibility</h2>
        <p>
          This API is additive. Existing calendar rendering, event sources, resource views, and
          <code>calculateAvailableSlots()</code> integrations keep their behavior. Applications opt
          in through the Premium <code>&#64;wts-calendar/core/availability-scheduling</code> entry.
        </p>
        <div class="docs-links">
          <a routerLink="/docs/api/exports" [queryParams]="{ entry: 'CalendarBookingScheduler' }"
            >Scheduler API reference →</a
          >
          <a routerLink="/docs/api/exports" [queryParams]="{ entry: 'calculateAvailableSlots' }"
            >Availability API reference →</a
          >
        </div>
      </section>
    </article>
  `,
})
export class BookingGuide {
  readonly rangeLoading = RANGE_LOADING;
  readonly schedulerSetup = SCHEDULER_SETUP;
  readonly bookingLifecycle = BOOKING_LIFECYCLE;
}
