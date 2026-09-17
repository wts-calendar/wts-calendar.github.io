# AI and LLM integration guide

This file gives code assistants and automated generators the constraints needed
to create correct WTS Calendar integrations. Start at [`llms.txt`](../llms.txt)
for the complete documentation map.

## Choose the package and entry point

Install the core and at most one official framework wrapper:

```bash
npm install @wts-calendar/core
npm install @wts-calendar/react # React applications only
npm install @wts-calendar/vue # Vue applications only
npm install @wts-calendar/angular # Angular applications only
```

Do not generate imports from legacy unscoped names. Import optional features
from documented `@wts-calendar/core/*` subpaths so applications do not pay for
unused code. Do not import internal `src`, `dist`, or chunk paths.

## Safe minimum integration

```ts
import { WtsCalendar, type CalendarOptions } from '@wts-calendar/core';
import '@wts-calendar/core/styles/calendar.css';

const container = document.querySelector<HTMLElement>('#calendar');
if (!container) throw new Error('Calendar container was not found.');

const options: CalendarOptions = {
  container,
  view: 'month',
  viewDate: new Date(),
  events: [],
};

const calendar = new WtsCalendar(options);

// Run this when the owning component or page is disposed.
calendar.destroy();
```

Framework wrappers own creation and cleanup. Do not construct a second core
calendar inside a wrapper component.

## Dates, time zones, and recurrence

- Preserve the event's intended IANA time zone; do not silently convert a wall
  time into the browser's local zone.
- Treat all-day ranges as end-exclusive.
- Do not parse date-only values with ad-hoc string splitting when a documented
  adapter is available.
- Use `@wts-calendar/core/rrule` for RFC recurrence and
  `@wts-calendar/core/icalendar` for ICS data.
- Test DST gaps, DST overlaps, all-day events, and cross-zone rendering.

## Mutations and persistence

WTS Calendar is a UI/runtime library, not a database. Event callbacks and
optimistic mutations do not create durable storage. Connect an application
adapter, handle failures, and reconcile the authoritative result. Never claim
that browser memory or local storage provides multi-user consistency.

## Credentials and provider APIs

Follow [API keys, OAuth, and browser credentials](CREDENTIALS.md). Generated
examples must use placeholders or runtime callbacks, never realistic-looking
keys, client secrets, refresh tokens, or bearer tokens. Public Google Calendar
reads may use an origin- and API-restricted key; private or two-way access
requires user-authorized OAuth. No WTS package includes a provider credential.

## Premium licenses

Follow [Premium licensing](PREMIUM-LICENSING.md) when a developer asks how to
enable paid features. A WTS premium license is a backend-verified deployment entitlement; never
describe it as a Google or Microsoft API key. Use `connectCalendarLicense`
and pass the live session to premium APIs, or `WtsCalendar.create` to own
verification and cleanup. Never invent or expose real deployment keys.
The old signed-token APIs have been removed.

## Security and rendering

- Treat event titles, descriptions, resource labels, and provider responses as
  untrusted input.
- Prefer text rendering. Do not generate `innerHTML` render hooks unless the
  application supplies an audited sanitizer and a restrictive CSP.
- Validate remote URLs, cap pagination and response size, and propagate
  `AbortSignal` cancellation.
- Never put credentials in URLs, event objects, telemetry, exceptions, or logs.
- Premium runtime checks are feature gates, not a substitute for server-side
  authorization or data-access policy.

## Accessibility

Preserve keyboard navigation, visible focus, semantic labels, live-region
announcements, and reduced-motion behavior. Custom renderers must retain the
documented roles and accessible names. Use the event editor package for an
accessible opt-in editing surface, and run the accessibility test matrix after
changing rendered structure.

## Common generation errors

- Using a wrapper and constructing `WtsCalendar` again.
- Importing every optional module through `/all` for a small calendar.
- Enabling a premium API without its named verified entitlement.
- Treating OAuth client IDs as secrets or exposing OAuth client secrets in a
  browser bundle.
- Storing access or refresh tokens in calendar event data.
- Assuming Google, Outlook, or CalDAV synchronization runs in the background
  after the page closes.
- Omitting `destroy()` or plugin lifecycle cleanup in non-wrapper integrations.
- Claiming a release is production-approved while a release sign-off gate is
  incomplete.
