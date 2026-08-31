# Changelog

All notable changes are documented here. This project follows Semantic
Versioning.

## [Unreleased]

## [1.1.1] - 2026-08-31

### Changed

- Package homepage metadata now links to the hosted resource-grid example at
  https://wts-calendar.github.io/premium/resource-grid.

### Fixed

- Declarative toolbar buttons no longer interpolate through low-contrast colors
  on hover; the no-transition rule now also overrides legacy grouped-button styles.
- Header and footer date titles explicitly use the calendar text theme token,
  keeping dark and automatic color schemes readable under host heading styles.
  Applications can override them with `--calendar-toolbar-title-color`.
- Native header/footer buttons remain interactive after changing locale, theme,
  time zone, or other options, including rollback. Rebuilt headers stay above
  the calendar body in both visual and keyboard order. Toolbar listeners are released
  when their toolbar is replaced or the calendar is destroyed, not on view rebuild.
- Stacked Month/DayGrid events have a consistent 4 px vertical gap, adjustable
  through `--month-event-gap`. Multi-day continuation lanes and overflow links
  track the same gap, including when applications change it at runtime.
- Numeric date/time tokens now honor locale numbering systems, including Bengali
  digits and explicit `-u-nu-latn` overrides. ISO dates and event identifiers remain
  locale-independent; installed Moment/Luxon formatters retain control of their output.
- Month/DayGrid resize targets stay visually hidden, including on hover, under
  application button styles. Consistent label/target height prevents overlap;
  edge resizing and visible keyboard focus remain available in LTR and RTL.
- Resource views now default to Previous, date title, and Next, without unrelated
  List/Month/Week/Day or repeated-task switches. Explicit toolbar layouts remain
  supported, and switching view families updates the default without stale listeners.
- Month, DayGrid, and multi-month event spans now extend toward the correct
  RTL edge, including resize handles, pointer previews, and keyboard resizing.
- Event labels resolve their own text direction independently of calendar
  geometry, keeping mixed English/Arabic text and ellipses readable.
- Cancelling a month resize restores the original event bars and removes
  temporary segments, including previews that cross into other month panels.

## [1.1.0] - 2026-08-28

### Added

- Added the DOM-free `@wts-calendar/core/native` entry with time-zone-aware
  navigation, event CRUD, recurrence expansion, selection, immutable
  snapshots, and subscriptions.
- Added the official `@wts-calendar/react-native` package with accessible
  native month, week, day, and virtualized list views, themes, callbacks,
  custom event rendering, and imperative controller access.

## [1.0.1] - 2026-08-26

### Fixed

- Corrected repository, homepage, and issue-tracker metadata for the core and
  framework wrapper packages.
- Removed `llms.txt` promotion from public READMEs and repaired stale Markdown
  links in the release and capability documentation.

## [1.0.0] - 2026-08-26

### Added

- Free opt-in `event-editor` entry with accessible dialog/drawer UI,
  transactional create/edit/duplicate/delete flows, recurrence scopes,
  resource/time-zone controls, typed custom fields, async validation,
  authorization, persistence conflict handling, and optimistic rollback.
- React, Vue, and Angular event-editor snapshot/controller helpers without
  adding the editor to adapter or standard runtime bundles.

- Nineteen canonical calendar views, modular premium entry points, resource
  scheduling, repeated tasks, remote sources, iCalendar, RRULE, Google Calendar,
  timezone support, keyboard interaction, RTL, print, and touch coverage.
- Runtime-only Google Identity Services connection for private calendars using
  short-lived in-memory access tokens, explicit user consent, and revocation.
- Fail-closed legal, package, reproducibility, security, accessibility,
  performance, provenance, and RC verification workflows.
- Optional `time-grid`, `list`, and `interaction` entry points. The `/all` and
  Web Component entries enable them automatically, preserving every feature
  while keeping the standard executable below 100 KiB gzip.
- Separately entitled `advanced-resource-planning` runtime entry with capacity
  heatmaps, split/rotating shifts, dependencies, substitutes, overbooking
  policy, demand forecasting, and timeline critical-path analysis.
- Separately entitled `premium-interoperability` entry with two-way Google
  Calendar, Microsoft 365, and CalDAV adapters; conditional writes; ICS diff
  and reconciliation; on-demand Moment/Luxon compatibility; and a
  FullCalendar configuration migration assistant.
- Separately entitled `enterprise-workflow` entry with configurable event state
  machines, multi-stage approval hooks, immutable hash-chained audit snapshots,
  deny-precedence field policies, optimistic/offline mutation queues, and
  transport-neutral adapters for customer-owned backends.
- Free opt-in developer entries for typed application data, headless
  configuration/schema validation, runtime diagnostics and DevTools, profiling,
  theme generation, deterministic test fixtures and drivers, and cached/retrying
  REST, GraphQL, storage, and WebSocket data adapters.
- React/Vue controller and snapshot primitives, an Angular signal controller,
  and a plugin author CLI covering scaffold, watch, local link, compatibility,
  packed size, rollback, and lifecycle verification.
- Scoped `@wts-calendar/core`, `@wts-calendar/react`, `@wts-calendar/vue`, and
  `@wts-calendar/angular` package identities under the `wts-calendar` npm
  organization.
- `llms.txt` discovery files, an AI integration guide, and credential guidance
  for safe API-key and OAuth configuration.

### Fixed

- Selective month-view event invalidation now updates changed events without
  forcing a full view rebuild.
- Weekly repeated-task custom buttons now execute the configured action.

### Security

- Remote source URLs allow only HTTP(S) and reject embedded credentials.
- Remote source retries, retry delays, response sizes, calendar pages, iCalendar
  input size, and recurrence expansion have explicit ceilings.
- Public Google Calendar keys use `X-Goog-Api-Key` and are excluded from request
  URLs; OAuth mode excludes the public key entirely.

### Release status

Version `1.0.0` is the first stable scoped-package candidate. It must be
published under npm tag `latest` only after every automated, manual
assistive-technology, pinned-runner, registry, and provenance gate documented
in `docs/RELEASE-CANDIDATE.md` is complete.

## [1.1.5] - Legacy unscoped release

The final `wts-calendar-v2` package published to npm. Its detailed historical change log
was not available in this workspace and is not reconstructed here.
