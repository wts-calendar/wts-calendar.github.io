# Changelog

All notable changes are documented here. This project follows Semantic
Versioning.

## [Unreleased]

## [1.1.4] - 2026-09-21

### Improved

- Month-view `+more` now opens a non-modal popover anchored to its trigger,
  repositioning to fit the viewport. Its compact agenda list has aligned times,
  event-color accents, and a pointer, without a backdrop or close button.
- The popover inherits calendar surface, text, shape, and accent tokens, including
  scoped theme variables and dark mode. Escape and outside-click dismissal and
  keyboard focus restoration remain available.

## [1.1.3] - 2026-09-17

This release retains the licensing migration below despite remaining on the 1.x
line.

### Breaking

- Replace offline signed tokens with backend-verification sessions. Use
  `WtsCalendar.create(options, connection)` or `connectCalendarLicense(connection)`.
  Remove `verifyCalendarLicense`, `createLicensed`, signed claims/grants, pinned
  signing keys, and local key-generation/signing scripts. Existing 1.x tokens
  must be exchanged for backend deployment keys. Review this migration before
  upgrading; the 1.1.3 version number does not imply licensing API compatibility.
- Use one backend request schema with installed package version and no legacy
  contract selector. Validate the returned package, version, origin, commercial
  model, and explicit package-wide Premium authorization.
- Verified Calendar Premium/Enterprise licenses unlock all Premium capabilities
  defined by the installed package. Backend `features` metadata is no longer an
  authorization input; no per-key feature selection or label migration is needed.
  Domain, version coverage, tier, revocation and perpetual-policy checks remain.
- Covered Calendar releases retain perpetual runtime rights after maintenance
  expiry and during current-session outages. Explicit revocation or uncovered
  versions deny premium authorization without clearing calendar data. Other
  packages' subscription grants are not treated as perpetual Calendar licenses.

### Added

- Production license verification defaults to the WTS package portal, so callers
  need only a deployment key. A trusted `verificationUrl` override remains
  available for staging/proxy deployments; Standard calendars remain offline.

- Optional `eventContrastColor: 'auto'` selects black/white event text using
  rendered-background luminance, including theme variables and alpha colors.
  Explicit text overrides remain authoritative; CSS colors and runtime changes
  are supported across standard and resource event views.

- Responsive `dayNarrowWidth` (default 100px; 0 disables) for Month/DayGrid,
  TimeGrid date headers, and MultiMonth/year. Actual column resizing updates
  localized compact labels and `isNarrow` date-hook state without recreating
  events; custom labels and full accessible dates are preserved.

- Optional Angular Material 3 theme adapter with inherited system colors,
  typography family, shape, elevation, and CSS-driven light/dark switching.

- First-party optional MUI and shadcn/ui theme adapters, with inherited CSS
  variables, light/dark switching, custom tokens, and integration examples.
  The calendar's shared theme tokens now also reach standard view borders,
  list surfaces, default event colors, and keyboard focus rings.

- Premium Time Machine: immutable recorded snapshots, time lookup, field-level
  diffs, selective restores with current authorization/validation, expected-head
  conflict checks, and a customer-owned atomic storage contract. Uses the
  existing `enterprise-workflow` entitlement; no standard-bundle import.
- Separate optional Time Machine panel with real read-only calendar previews,
  accessible comparison and confirmation, and preservation of unselected work.
  Branching and scenario merging are not part of this first release.

### Fixed

- Dense TimeGrid updates no longer allocate hidden lanes beyond `eventMaxStack`.
  Preserve visible lane reuse, strict ordering and complete overflow/popover data.
- Reuse event-order collation rules across comparisons to reduce dense Month
  and TimeGrid sorting cost without changing numeric, case or accent ordering.
- Share identical Month date-span and grid-bucket calculations during indexing;
  edits, navigation and time-zone changes retain their normal invalidation.
- Themed month date labels now use the active text tokens, including past dates
  and today, so legacy cell colors cannot make dark previews unreadable.

## [1.1.2] - 2026-09-10

### Fixed

- Align simultaneous week TimeGrid events in horizontal lanes without vertical
  stacking (Suman201/wts-calendar-angular-example#1).
- Keep one vertical time-grid scroller when height or contentHeight is set,
  including day view, expanded rows, and runtime resizing.
- This CSS-only hotfix preserves the published 1.1.1 JavaScript, types, exports,
  and dependencies. Unreleased features above are not included.

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
