# Migration from FullCalendar

WTS Calendar targets comparable workflows, not source-compatible replacement.
Migrate one view and data contract at a time and keep the old calendar available
until timezone, recurrence, resource, interaction, and accessibility acceptance
tests pass.

## Package-name migration

The maintained scoped core is `@wts-calendar/core`. Replace legacy
`wts-calendar-v2` dependency declarations and imports with the scoped package.
The official wrappers are `@wts-calendar/react`, `@wts-calendar/react-native`,
`@wts-calendar/vue`, and `@wts-calendar/angular`. Do not use the misspelled `wts-calender` name or
organization. Version `1.0.0` begins the scoped package line; it does not imply
API compatibility with an unrelated unscoped `1.x` package.

Existing signed premium grants remain valid. Their `wts-calendar-v2` audience
is a stable licensing-protocol identifier and intentionally does not match the
new npm package name.

Licensed migrations can use
`PremiumCalendarInteroperability.migrateFullCalendarOptions()` to produce a
non-mutating WTS option draft, required-module list, callback warnings, and an
explicit list of unmapped options. It never silently discards an unknown
FullCalendar option. See [Premium interoperability](PREMIUM-INTEROPERABILITY.md).

## Vanilla JavaScript

1. Replace FullCalendar CSS/plugins with the smallest WTS export set (`.`, then
   optional `time-grid`, `multi-month`, `list`, `interaction`, `rrule`, `icalendar`,
   `google-calendar`, `resource-scheduling`, or `repeated-tasks`; use `all`
   only when appropriate).
2. Construct `WtsCalendar` with `container`, `view`, `viewDate`, `timeZone`, and
   normalized events. Keep stable IDs and explicit ISO offsets.
   `initialView`, `initialDate`, and standard FullCalendar camel-case view names
   are accepted as construction/method aliases.
3. Map FullCalendar callbacks to the event names and immutable payloads in the
   README. WTS mutations return revert handles and may use async validators.
4. Replace resource/timeline settings with the documented WTS resource options;
   do not copy undocumented DOM selectors or plugin internals.
5. Re-run keyboard, touch, RTL, print, timezone/DST, and performance acceptance
   tests before removing FullCalendar.

## Angular

Install `@wts-calendar/angular` and use its standalone
`WtsCalendarAngularComponent`. Pass construction-only values through
`initialOptions`, live option transactions through `options`, and data through
`events` or `resources`. Use `(ready)` or `getApi()` for imperative workflows.
The adapter skips construction during SSR and owns teardown. A manual wrapper
is still supported; if you build one, create/destroy the calendar in the
component lifecycle and call `destroyAsync()` when loaders remain in flight.

## React

Install `@wts-calendar/react`, render `WtsCalendarReact`, and read the core API
through `WtsCalendarReactHandle.getApi()`. `initialOptions` is mount-only;
`options`, `events`, and `resources` update the existing instance. The adapter
does not read browser globals at import time and its effect cleanup destroys the
exact instance it created, including React Strict Mode remounts.

## Vue

Install `@wts-calendar/vue`, render `WtsCalendarVue`, and call the exposed
`getApi()`. The adapter constructs in `onMounted`, holds the core in a shallow
ref, watches only `options`, `events`, and `resources`, and destroys in
`onBeforeUnmount`. It is safe to import during SSR.

## React Native

Install `@wts-calendar/core` and `@wts-calendar/react-native`, then render
`WtsCalendarNative`. Native applications use the same core date, recurrence,
event, and navigation logic through `@wts-calendar/core/native`; they do not
mount the browser calendar or use a WebView. Month, week, day, and list views
are native controls. Use `WtsCalendarNativeHandle.getApi()` for event CRUD,
selection, and navigation.

## Important contract differences

- `calendar.view` remains the legacy string; the immutable descriptor is
  `calendar.viewApi`.
- WTS callback/event payloads and method names are documented contracts but are
  not literal FullCalendar payloads.
- Moment and Luxon formatting strings are preserved by the optional
  `format-moment` and `format-luxon3` plugins. Configure exactly one.
  The premium interoperability toolkit can load and select these adapters
  during a licensed migration without statically adding both peers.
- FullCalendar v7 table/day-row/slot-header class hooks retain their public
  names; content and lifecycle hooks use WTS's typed contracts documented in
  the README.
- Premium resource/repeated-task views require a verified WTS entitlement.
- Trusted HTML hooks are application code and must never receive unsanitized
  user content.
- WTS exposes transactional updates, undo/redo, `whenIdle()`, pending-operation
  accounting, and async destruction; use them instead of timing-based teardown.
