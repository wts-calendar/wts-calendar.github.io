# Calendar package structure

WTS Calendar is one npm package with several entry points. The split follows
feature weight and usage, not one entry point per view.

Machine-readable documentation discovery starts at [`../llms.txt`](../llms.txt).
Credential acquisition and browser safety are covered in
[API keys, OAuth, and browser credentials](CREDENTIALS.md).

```text
@wts-calendar/core
├── core
│   ├── month and day-grid views
│   ├── events, sources, selection, internal drag, and resize
│   ├── named time zones and DST handling
│   ├── public resource data contracts and APIs
│   └── license verification
├── native (DOM-free state/date entry used by @wts-calendar/react-native)
├── time-grid (day, week, and custom TimeGrid)
├── multi-month (multi-month, year, and custom multi-month)
├── list (list day/week/month/year and custom list)
├── interaction (external and cross-calendar drag-and-drop)
├── resource-scheduling
│   ├── resource
│   ├── resource-day-grid-day
│   ├── resource-day-grid-week
│   ├── resource-time-grid-day
│   ├── resource-time-grid-week
│   └── resource-timeline
├── advanced-resource-planning (premium runtime engine)
│   ├── capacity heatmaps and overbooking policy
│   ├── split shifts and rotating schedules
│   ├── dependencies and ranked substitutes
│   ├── demand forecasting
│   └── timeline critical-path analysis
├── premium-interoperability (premium, explicit opt-in)
│   ├── Google Calendar two-way sync
│   ├── Microsoft 365/Outlook adapter
│   ├── CalDAV sync and conditional writes
│   ├── ICS diff and three-way reconciliation
│   ├── Moment/Luxon migration loader
│   └── FullCalendar configuration migration assistant
├── enterprise-workflow (premium, explicit opt-in)
│   ├── configurable event state machines
│   ├── multi-stage approval hooks
│   ├── immutable hash-chained audit snapshots
│   ├── action and field-level policies
│   ├── optimistic/offline mutation queues
│   └── customer backend adapter interfaces
├── developer-tools (free, development opt-in)
│   ├── typed event/resource facades and JSON Schema
│   ├── diagnostics, profiling, and DevTools panel
│   └── safe theme generation and contrast reports
├── testing (free, test-only opt-in)
│   ├── deterministic clocks, IDs, and fixtures
│   └── drivers, mocks, idle helpers, and assertions
├── data-adapter-sdk (free, application opt-in)
├── event-editor (free, application opt-in)
│   ├── bounded cache, deduplication, retry, and diagnostics
│   └── REST, GraphQL, storage, and WebSocket adapters
├── repeated-tasks
│   ├── monthly-repeated-task
│   └── weekly-repeated-task
├── rrule
├── icalendar
├── google-calendar
├── format-moment (optional Moment peer)
├── format-luxon3 (optional Luxon peer)
├── plugin-sdk
├── web-component
└── all
```

## Recommended imports

Use the standard entry when only standard scheduling is needed:

```ts
import { WtsCalendar } from '@wts-calendar/core';
import '@wts-calendar/core/styles/calendar.css';
```

React Native applications use the same package's native entry through the
official renderer—there is no second core package and no WebView:

```tsx
import { WtsCalendarNative } from '@wts-calendar/react-native';

<WtsCalendarNative
  initialOptions={{ view: 'month', timeZone: 'local' }}
  events={[{ id: 'planning', title: 'Planning', start: new Date() }]}
/>;
```

Add only meaningful feature modules:

```ts
import { WtsCalendar } from '@wts-calendar/core';
import { interactionModule } from '@wts-calendar/core/interaction';
import { timeGridModule } from '@wts-calendar/core/time-grid';
import { multiMonthModule } from '@wts-calendar/core/multi-month';
import { listModule } from '@wts-calendar/core/list';
import { resourceSchedulingModule } from '@wts-calendar/core/resource-scheduling';
import { AdvancedResourcePlanner } from '@wts-calendar/core/advanced-resource-planning';
import { PremiumCalendarInteroperability } from '@wts-calendar/core/premium-interoperability';
import { EnterpriseCalendarWorkflow } from '@wts-calendar/core/enterprise-workflow';
import { CalendarDevTools } from '@wts-calendar/core/developer-tools';
import { CalendarTestDriver } from '@wts-calendar/core/testing';
import { CalendarDataClient } from '@wts-calendar/core/data-adapter-sdk';
import { createCalendarEventEditor } from '@wts-calendar/core/event-editor';
import { rrulePlugin } from '@wts-calendar/core/rrule';

const calendar = new WtsCalendar({
  container,
  plugins: [
    interactionModule,
    timeGridModule,
    multiMonthModule,
    listModule,
    resourceSchedulingModule,
    rrulePlugin,
  ],
  view: 'resource-timeline',
  license,
  resources,
  events,
});
```

Use the all-features entry for demos or applications that use every module:

```ts
import { WtsCalendar } from '@wts-calendar/core/all';
```

Modules are configured per calendar instance. Importing a module does not
register it globally or enable its premium license entitlement.

Angular, React, Vue, and Web Component adapters accept the shared
`CalendarFactory` contract. Supplying `createPluginCalendar` gives every adapter
the optional ecosystem runtime while leaving the default construction path and
standard bundle unchanged.

The React Native renderer instead uses `NativeCalendarController` from
`@wts-calendar/core/native`. That entry has no browser DOM declarations and
provides month/week/day/list ranges, time-zone date math, recurrence, event
CRUD, navigation, selection, immutable snapshots, and subscriptions.

The standards-based custom element is available without adding adapter code to
the standard JavaScript bundle:

```ts
import { defineWtsCalendarElement } from '@wts-calendar/core/web-component';
```

Feature view factories receive a core-owned `lifecycle` scope. Use
`lifecycle.signal`, `addCleanup()`, `setTimeout()`, and
`requestAnimationFrame()`, and `addEventListener()` for plugin work. Core aborts and cleans this scope
when initialization fails, the view changes, or the calendar is destroyed,
even when the feature view's own `destroy()` throws.

## Compatibility rules

- Month and DayGrid imports remain unchanged.
- Day/week/custom TimeGrid, MultiMonth/year/custom multi-month, list, and
  external/cross-calendar dragging require `time-grid`, `multi-month`, `list`,
  and `interaction` respectively. `/all` enables all four.
- Optional views require their module at construction time.
- Missing modules produce an actionable configuration error before the host
  DOM is mutated.
- Premium modules still require a verified license grant.
- Advanced planning has its own `advanced-resource-planning` entitlement and
  never persists or transmits the supplied runtime snapshot.
- Premium interoperability has its own `premium-interoperability` entitlement.
  It is not enabled by `/all`: provider adapters, credentials, and optional
  Moment/Luxon peers remain explicit application choices.
- Enterprise workflow has its own `enterprise-workflow` entitlement. It is not
  enabled by `/all`, owns no backend, and leaves authoritative authorization,
  durable queue storage, and append-only audit persistence to customer systems.
- Developer, testing, and data-adapter entries are free explicit imports. They
  are not enabled by `/all`, keeping debug and test machinery outside production
  bundles unless an application deliberately imports it.
- The accessible event editor is a free explicit import and is excluded from
  standard and `/all` graphs; its stylesheet is also excluded from `calendar.css`.
- `plugins` is immutable after construction; create the calendar with every
  module it may switch to.
- Simple object recurrence remains in core. RFC RRULE and iCalendar stay
  optional.
- Google Calendar stays optional, supports public API keys or source-scoped
  short-lived OAuth tokens, and adds no dependency to the standard entry.
- Independent packages may implement `CalendarExternalPlugin`; see
  [Third-party plugin SDK](PLUGIN-SDK.md). Names, dependencies, conflicts,
  views, options, transforms, toolbar actions, installation, and cleanup are
  validated per instance. Advanced orchestration is isolated in the optional
  `plugin-sdk` entry.

## Build outputs

Every entry point ships ESM, CommonJS, and TypeScript declarations:

```text
dist/index.*
dist/resource-scheduling.*
dist/advanced-resource-planning.*
dist/premium-interoperability.*
dist/enterprise-workflow.*
dist/developer-tools.*
dist/testing.*
dist/data-adapter-sdk.*
dist/event-editor.*
dist/styles/event-editor.css
dist/repeated-tasks.*
dist/rrule.*
dist/icalendar.*
dist/google-calendar.*
dist/format-moment.*
dist/format-luxon3.*
dist/interaction.*
dist/time-grid.*
dist/multi-month.*
dist/list.*
dist/plugin-sdk.*
dist/web-component-entry.*
dist/chunks/*
dist/styles/*.css
dist/all.*
```

The public entry filenames remain stable. Internal `dist/chunks` files are
shared by those entries so the package stores core and optional implementations
once per module format instead of embedding duplicate copies in `all` and the
Web Component entry. Consumers should continue importing only documented
package exports; chunk filenames are private build details.

The standard bundle must not contain Day/Week TimeGrid, MultiMonth, list,
external-drag, resource-timeline, or repeated-task implementations. Package
tests enforce this boundary.
