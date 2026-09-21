# API reference

The canonical constructor, methods, callbacks, emitted events, plugins, and
TypeScript examples are maintained in [README.md](../README.md). The public npm
entry points are `.`, `native`, `time-grid`, `multi-month`, `list`, `interaction`,
`rrule`, `icalendar`, `google-calendar`, `format-moment`, `format-luxon3`,
`theme-mui`, `theme-shadcn`, `theme-angular-material`,
`resource-scheduling`, `advanced-resource-planning`, `repeated-tasks`,
`premium-interoperability`, `enterprise-workflow`, `time-machine`,
`time-machine-panel`, `developer-tools`, `testing`,
`data-adapter-sdk`, `event-editor`, `plugin-sdk`, `web-component`, and
`all`. The packed-artifact gate
loads every entry through both ESM and CommonJS and verifies its declaration
file.

The `native` entry exports `NativeCalendarController`,
`createNativeCalendar`, and self-contained native event, day, range, option,
and snapshot types. It is the shared engine for `@wts-calendar/react-native`
and does not expose `HTMLElement`, `Document`, CSS, or browser events.

The premium `advanced-resource-planning` entry exports
`AdvancedResourcePlanner` and its planning contracts. Its APIs cover capacity
heatmaps, split and rotating shifts, dependency-aware booking, ranked
substitutes, overbooking policies, demand forecasting, and critical-path
analysis. See [Advanced resource planning](ADVANCED-RESOURCE-PLANNING.md).

The separately entitled `premium-interoperability` entry exports
`PremiumCalendarInteroperability`. It creates two-way Google Calendar,
Microsoft 365/Outlook, and CalDAV adapters; performs ICS diff and three-way
reconciliation; loads Moment/Luxon migration compatibility on demand; and
analyzes FullCalendar configuration. See
[Premium interoperability](PREMIUM-INTEROPERABILITY.md).

The separately entitled `enterprise-workflow` entry exports
`EnterpriseCalendarWorkflow` and its actor, state-machine, approval, policy,
mutation, audit, and backend-adapter contracts. It provides optimistic runtime
records, multi-stage decisions, retry and rollback semantics, and SHA-256
hash-chain verification without prescribing a customer backend. See
[Enterprise workflow](ENTERPRISE-WORKFLOW.md).

The opt-in `time-machine` entry exports `CalendarTimeMachine`,
`TimeMachineConflictError`, and JSON record/revision/diff/restore/storage types.
The separate `time-machine-panel` entry exports `CalendarTimeMachinePanel` and
`createCalendarTimeMachinePanel`. Both require the existing `enterprise-workflow`
entitlement. See [Time Machine](TIME-MACHINE.md) for complete contracts, examples,
limits, current authorization, and atomic persistence requirements.

The free `developer-tools`, `testing`, and `data-adapter-sdk` entries provide
typed data facades, configuration/schema validation, runtime diagnostics,
DevTools, profiling, safe theme generation, deterministic drivers/fixtures,
and backend-neutral data clients. See [Developer tools](DEVELOPER-TOOLS.md),
[Testing toolkit](TESTING-TOOLKIT.md), and
[Data adapter SDK](DATA-ADAPTER-SDK.md).

The free opt-in `event-editor` entry supplies an accessible transactional
create/edit/duplicate/delete dialog or drawer. See
[Accessible event editor](EVENT-EDITOR.md).

The formatting entries export optional peer-backed plugins. Add exactly one to
`plugins` to use Moment or Luxon strings in configured formatting options and
the instance `formatDate`/`formatRange` methods. Neither peer enters the
standard or all-features browser bundle.

The free `theme-mui` and `theme-shadcn` entries export `createMuiCalendarTheme`
and `createShadcnCalendarTheme`, respectively. These pure option factories map
application design tokens to `themeTokens`; unlike plugins, their results go
directly into calendar options, not `plugins`. See
[MUI and shadcn/ui themes](THEME-INTEGRATIONS.md).

The free `theme-angular-material` entry exports
`createAngularMaterialCalendarTheme` and `AngularMaterialCalendarThemeOptions`.
It maps inherited Material 3 system tokens from `mat.theme()` to calendar
options, including CSS-driven light/dark mode. See the
[Angular Material example](THEME-INTEGRATIONS.md#angular-material-material-3-v19).

Construction accepts `initialView`/`initialDate` and FullCalendar camel-case
built-in view names. The canonical stored view names remain WTS kebab-case.

The `google-calendar` entry exports `googleCalendarPlugin`,
`createGoogleCalendarBrowserConnection`, `GoogleCalendarConnectionError`, and
`mapGoogleCalendarEvent`. The browser connection is deliberately runtime-only:
`connect()` must run from a user gesture, `accessToken` is passed to a Google
event source, and `disconnect()` clears the in-memory token (with optional
revocation). It does not expose client-secret, refresh-token, or persistence
APIs.

Only exported declarations are public API. Imports from `dist/utils`,
`dist/views`, or source paths are unsupported even when a declaration file is
present for editor navigation.
