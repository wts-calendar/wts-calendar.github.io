# WTS Calendar

A framework-agnostic TypeScript calendar for event and resource scheduling.

Provider credentials and API-key setup are documented separately in
[API keys, OAuth, and browser credentials](docs/CREDENTIALS.md).
For paid modules, see [how to request and use a premium license](docs/PREMIUM-LICENSING.md).

## Install

```bash
npm install @wts-calendar/core
```

```typescript
import { WtsCalendar, type CalendarOptions } from '@wts-calendar/core';

const container = document.querySelector<HTMLElement>('#calendar');

if (!container) {
  throw new Error('Calendar container was not found.');
}

const options: CalendarOptions = {
  container,
  view: 'month',
  viewDate: new Date(),
  events: [
    {
      id: 'planning',
      title: 'Planning',
      start: new Date(2026, 7, 4, 10),
      end: new Date(2026, 7, 4, 11),
    },
  ],
};

const calendar = new WtsCalendar(options);

const unsubscribe = calendar.on('event-click', ({ source }) => {
  console.log(source);
});

// Framework component cleanup:
unsubscribe();
calendar.destroy();
```

The standard entry point includes month and DayGrid views. Day/Week TimeGrid,
MultiMonth/year, agenda/list, external drag-and-drop, and larger specialist
features are optional subpath modules in the same npm package:

Import the production stylesheet once before constructing a calendar:

```typescript
import '@wts-calendar/core/styles/calendar.css';
import { WtsCalendar } from '@wts-calendar/core';
```

```typescript
import { rrulePlugin } from '@wts-calendar/core/rrule';
import { icalendarPlugin } from '@wts-calendar/core/icalendar';
import { googleCalendarPlugin } from '@wts-calendar/core/google-calendar';
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
import { repeatedTasksModule } from '@wts-calendar/core/repeated-tasks';

const calendar = new WtsCalendar({
  ...options,
  plugins: [
    interactionModule,
    timeGridModule,
    multiMonthModule,
    listModule,
    resourceSchedulingModule,
    repeatedTasksModule,
    rrulePlugin,
    icalendarPlugin,
    googleCalendarPlugin,
  ],
});
```

Import only the integrations the application uses. Simple object-based
recurrence remains part of core. The optional subpaths bundle their
implementations, so consumers do not install `rrule` or `ical.js` separately.
Applications that import a recurring `.ics` feed should configure both
`icalendarPlugin` and `rrulePlugin`.

For a showcase, prototype, or application that needs every built-in feature,
use the convenience entry point:

```typescript
import { WtsCalendar } from '@wts-calendar/core/all';
```

`/all` configures interaction, MultiMonth/year, Day/Week TimeGrid, list, resource scheduling,
repeated-task views, RRULE, iCalendar, and Google Calendar support for each
instance. It does not perform global registration.
For production bundles, prefer the standard entry plus only the modules the
application uses.

Third-party npm packages can also export arbitrary `CalendarExternalPlugin`
objects. They may register custom view engines and namespaced options with
core-owned view lifecycle cleanup. The optional `@wts-calendar/core/plugin-sdk`
entry adds dependency/conflict resolution, refined options, composable event
transforms, toolbar actions, and installation lifecycle without charging that
orchestration to the standard bundle. See
[Third-party plugin SDK](docs/PLUGIN-SDK.md).
Plugin authors can copy the private reference package in
`projects/wts-calendar-plugin-starter` and run its packed-artifact
`plugin:verify` conformance gate before publication.

### Package structure

| Import | Contents |
| --- | --- |
| `@wts-calendar/core` | Calendar core, DayGrid/month views, event APIs, sources, selection, time zones, and licensing |
| `@wts-calendar/core/native` | DOM-free controller, recurrence, navigation, event CRUD, and snapshots used by `@wts-calendar/react-native` |
| `@wts-calendar/core/time-grid` | Day, week, and custom TimeGrid views |
| `@wts-calendar/core/multi-month` | MultiMonth, year, and custom multi-month views |
| `@wts-calendar/core/list` | List day/week/month/year and custom list views |
| `@wts-calendar/core/interaction` | External and cross-calendar drag-and-drop plus `makeDraggable` |
| `@wts-calendar/core/resource-scheduling` | Resource grid, resource day/week time grids, resource timeline, and non-resource timeline |
| `@wts-calendar/core/advanced-resource-planning` | Premium capacity heatmaps, shifts/rotations, dependencies, substitutes, overbooking, forecasting, and critical paths |
| `@wts-calendar/core/premium-interoperability` | Premium Google, Microsoft 365, CalDAV, ICS reconciliation, date-format migration, and FullCalendar migration toolkit |
| `@wts-calendar/core/enterprise-workflow` | Premium approvals, state machines, audit history, field policies, offline queues, and customer backend adapters |
| `@wts-calendar/core/developer-tools` | Free typed data, headless validation/schema, diagnostics, DevTools, profiling, and theme generation |
| `@wts-calendar/core/testing` | Free deterministic fixtures, drivers, mocks, idle helpers, and assertions |
| `@wts-calendar/core/data-adapter-sdk` | Free cached/retrying REST, GraphQL, storage, and WebSocket adapter toolkit |
| `@wts-calendar/core/event-editor` | Free accessible create/edit/duplicate/delete dialog or drawer with validation and persistence hooks |
| `@wts-calendar/core/repeated-tasks` | Monthly and weekly repeated-task views |
| `@wts-calendar/core/rrule` | Advanced RFC RRULE recurrence |
| `@wts-calendar/core/icalendar` | `.ics` import and export |
| `@wts-calendar/core/google-calendar` | Public API-key and private OAuth Google Calendar adapter |
| `@wts-calendar/core/format-moment` | Optional Moment string-format compatibility plugin |
| `@wts-calendar/core/format-luxon3` | Optional Luxon 3 string-format compatibility plugin |
| `@wts-calendar/core/plugin-sdk` | Third-party ecosystem orchestration and lifecycle |
| `@wts-calendar/core/web-component` | Standards-based custom-element adapter |
| `@wts-calendar/core/styles/calendar.css` | Required standard-view stylesheet |
| `@wts-calendar/core/all` | Core plus every built-in optional module |

### React Native

Install the official native renderer with the same core package:

```bash
npm install @wts-calendar/core @wts-calendar/react-native
```

```tsx
import { WtsCalendarNative } from '@wts-calendar/react-native';

<WtsCalendarNative
  initialOptions={{ view: 'month', firstDay: 1 }}
  events={[{ id: 'launch', title: 'Launch', start: '2026-09-10T10:00:00' }]}
/>;
```

This renders native iOS/Android controls for month, week, day, and virtualized
list views. It does not create another core package, mount HTML, or use a
WebView.

`AdvancedResourcePlanner` is protected by the independent signed
`advanced-resource-planning` entitlement. It operates entirely on the runtime
snapshot supplied by the application and does not require or contact a WTS
backend. See [Advanced resource planning](docs/ADVANCED-RESOURCE-PLANNING.md).

`PremiumCalendarInteroperability` is protected by the independent signed
`premium-interoperability` entitlement. It provides runtime-only provider
adapters and migration tools and is deliberately not auto-loaded by `/all`.
See [Premium interoperability](docs/PREMIUM-INTEROPERABILITY.md).

`EnterpriseCalendarWorkflow` is protected by the independent signed
`enterprise-workflow` entitlement. It supplies runtime-only state and approval
governance, optimistic/offline mutation handling, hash-chained audit evidence,
and a transport-neutral adapter for customer systems. It is deliberately not
auto-loaded by `/all` and does not require a WTS backend. See
[Enterprise workflow](docs/ENTERPRISE-WORKFLOW.md).

The developer entries are normal/free and deliberately absent from both the
standard and `/all` production graphs. See [Developer tools](docs/DEVELOPER-TOOLS.md),
[Accessible event editor](docs/EVENT-EDITOR.md),
[Testing toolkit](docs/TESTING-TOOLKIT.md), and
[Data adapter SDK](docs/DATA-ADAPTER-SDK.md).

### Framework adapters

The official adapters preserve the same `WtsCalendar` instance and public API
instead of recreating or hiding the core controller:

```bash
npm install @wts-calendar/core @wts-calendar/react
# or: @wts-calendar/vue / @wts-calendar/angular
```

| Framework | Package | Live update contract |
| --- | --- | --- |
| Angular 17-22 | `@wts-calendar/angular` | Standalone component, typed inputs/outputs, `getApi()`, zoneless and SSR-safe lifecycle |
| React 18-19 | `@wts-calendar/react` | Ref-based `getApi()`, mount-only initial options, transactional prop updates |
| Vue 3.4+ | `@wts-calendar/vue` | Exposed `getApi()`, shallow core instance, watched option/data props |

Each adapter accepts construction-only `initialOptions`, live dynamic
`options`, and focused `events` and `resources` collections. All three are
tested against the same update and teardown contract in Chromium, Firefox,
WebKit, and touch Chromium. See each adapter package README for its native
template/JSX example.

All official adapters also accept the typed `CalendarFactory` construction
hook. Pass `createPluginCalendar` from `@wts-calendar/core/plugin-sdk` to enable
the same advanced third-party plugin lifecycle in Angular, React, Vue, or an
individual Web Component instance.

## Views

Core: `month`, `day-grid-week`, and `day-grid-day`. Optional view modules add
`day`, `week`, `multi-month`, `year`, `list-day`, `list-week`,
`list-month`, `list-year`, `list`, timeline, resource, and repeated-task views.

### Declarative toolbars

Use `headerToolbar` and `footerToolbar` to compose navigation without building
or wiring custom DOM. Commas join adjacent buttons into one group while spaces
create a visual gap. Sections accept built-in actions (`prev`, `next`,
`prevYear`, `nextYear`, `today`, and `title`), standard or named view names,
and keys from `buttons`, `customButtons`, or `toolbarElements`.

```typescript
const calendar = new WtsCalendar({
  container,
  view: 'month',
  headerToolbar: {
    start: 'prevYear,prev next,nextYear today',
    center: 'title',
    end: 'month,week,day list-month exportRange syncStatus',
  },
  footerToolbar: {
    start: 'day-grid-week',
    end: 'exportRange',
  },
  customButtons: {
    exportRange: {
      text: 'Export',
      hint: 'Export the visible calendar range',
      click: (_event, button) => {
        button.setAttribute('aria-busy', 'true');
        exportVisibleRange(calendar).finally(() => {
          button.removeAttribute('aria-busy');
        });
      },
    },
  },
  toolbarElements: {
    syncStatus: 'Synced',
  },
  buttonDisplay: 'icon-text',
  headingLevel: 2,
  buttonClass: ({ name, isSelected, isDisabled }) => [
    `calendar-action-${name}`,
    isSelected ? 'is-selected' : '',
    isDisabled ? 'is-disabled' : '',
  ],
  buttonText: {
    'list-month': 'Agenda',
  },
  buttonHints: {
    week: 'Open weekly schedule',
  },
});
```

`left` and `right` are supported aliases for `start` and `end`. The active
view button exposes `aria-pressed="true"`, titles and navigation state remain
synchronized in both toolbars, and every control has an accessible label.
Set either toolbar to `false` to suppress it. Omitting `headerToolbar` keeps
the existing package header for backward compatibility. `toolbarClass`,
`headerToolbarClass`, `footerToolbarClass`, `toolbarSectionClass`,
`toolbarTitleClass`, `buttonGroupClass`, and `buttonClass` expose typed render
information. Toolbar structure is validated before the host DOM is changed;
all toolbar options are transactionally updateable through `setOption` or
`setOptions` and are restored by `CalendarOptionChange.revert()`.

### Sizing and sticky regions

The complete sizing family is runtime-updateable. Numeric sizes are pixels;
strings accept `auto` or any valid CSS size.

```typescript
const calendar = new WtsCalendar({
  container,
  height: 'min(820px, 90vh)',
  contentHeight: 680,
  aspectRatio: 1.35, // used when height/contentHeight are omitted
  expandRows: true,
  tableHeaderSticky: 'auto',
  footerScrollbarSticky: true,
});

calendar.setOption('contentHeight', 720);
calendar.updateSize(); // call after an external layout transition if needed
```

`height` includes toolbars. `contentHeight` sizes only the active view body and
takes precedence over `aspectRatio`. Sticky table headers activate automatically
for constrained calendars. The footer scrollbar mirrors the active horizontal
timeline/resource scroller and supports two-way scrolling.

### Themes and color schemes

`standard` preserves the existing package appearance. The stock `classic`,
`monarch`, `forma`, `breezy`, and `pulse` themes share one documented token
contract and work with `light`, `dark`, or OS-driven `auto` color schemes.

```typescript
calendar.setOptions({
  theme: 'breezy',
  colorScheme: 'auto',
  themeTokens: {
    primary: '#0ea5e9',
    primaryForeground: '#082f49',
    surface: '#ffffff',
    border: '#bae6fd',
    borderRadius: '12px',
  },
});
```

The public CSS custom properties use the `--wts-calendar-*` prefix, including
`background`, `surface`, `surface-muted`, `text`, `text-muted`, `border`,
`primary`, `primary-foreground`, `today-background`, `selection-background`,
`event-background`, `event-text`, `shadow`, `font-family`, and `border-radius`.
Inline `themeTokens` win over stock palettes; pre-existing host inline styles
and variables are restored when the calendar is destroyed.

### Named custom views

Use `views` to define application-specific durations without duplicating a
view engine. DayGrid, TimeGrid, list, timeline, and multi-month definitions
reuse the normal event sources, recurrence, valid ranges, selection,
interaction, render hooks, accessibility, and lifecycle behavior.

```typescript
const calendar = new WtsCalendar({
  container,
  view: 'three-day',
  views: {
    'three-day': {
      type: 'time-grid',
      duration: { days: 3 },
      dateIncrement: { days: 3 },
      dateAlignment: 'day',
      buttonText: '3 day',
    },
    fortnight: {
      type: 'day-grid',
      duration: { weeks: 2 },
      dateIncrement: { weeks: 2 },
      dateAlignment: 'week',
    },
  },
  events,
});

calendar.setView('fortnight', '2026-08-03');
```

Each duration must contain exactly one positive `days`, `weeks`, `months`, or
`years` field. Multi-month definitions accept only months or years.

### Multi-month and year planner

`multi-month` renders a configurable rolling range; `year` renders January
through December of the active year. Both reuse month-view events, recurrence,
selection, drag, resize, valid ranges, hidden days, event sources, render
hooks, keyboard interaction, and accessibility behavior.

```typescript
import { multiMonthModule } from '@wts-calendar/core/multi-month';

const calendar = new WtsCalendar({
  container,
  plugins: [multiMonthModule],
  view: 'multi-month',
  viewDate: '2026-08-03',
  multiMonth: {
    durationMonths: 3,
    columns: 'auto',
    minimumMonthWidth: 280,
    gap: 16,
    virtualizationThreshold: 6,
  },
  events,
});

calendar.setView('year', '2026-01-01');
```

With automatic columns, panels reflow to the available width and collapse to
one column on narrow screens. `columns` also accepts a fixed integer from 1 to
6. Larger planners use browser render virtualization while retaining their
full accessible DOM and scroll range.

Repeated tasks module: `monthly-repeated-task` and `weekly-repeated-task`.

The monthly view treats task `end` dates as inclusive, clips ranges that cross
month boundaries, and keeps one expanded month at a time. Calling the
`addTask` or `updateTask` function supplied by a `day-click` or `event-click`
payload updates the task model before rerendering, so the change survives
navigation and `calendar.render()`.

The weekly view renders one task-category row across the active week. It
honors `startOfWeek`, `weekends`, `hiddenDays`, configured off-days, disabled
past/future dates, multi-day occurrences, and `allowOverlap`. Each occurrence
keeps its status and stable ID, and the same mutation helpers are available
from its `day-click` and `event-click` payloads. Arrow keys move between
interactive task cells. The grid can be themed without overriding structural
styles:

```css
.wts-calendar {
  --weekly-task-label-width: 220px;
  --weekly-task-day-min-width: 132px;
  --weekly-task-row-min-height: 96px;
  --weekly-task-border-color: #d8dee8;
  --weekly-task-today-surface: #eef7ff;
  --weekly-task-offday-surface: #fff4f1;
}
```

```typescript
const tasks = calendar.getTasks();
const focusTask = calendar.getTaskById('focus-time');

const added = calendar.addTask('focus-time', {
  id: 'focus-2026-08-04',
  start: '2026-08-04T09:00:00',
  end: '2026-08-04T11:00:00',
  reason: 'Release work',
  status: 'pending',
});

calendar.setTaskStatus(
  'focus-time',
  added.event!.id,
  'completed',
);
calendar.updateTask('focus-time', added.event!.id, {
  reason: 'Release work completed',
});
calendar.removeTask('focus-time', added.event!.id);

calendar.on('day-click', ({ source }) => {
  source.addTask({
    task: source,
    event: {
      start: source.date,
      reason: 'Completed',
    },
  });
});

calendar.on('task-add', async (transaction) => {
  await saveTaskOccurrence(
    transaction.task.id,
    transaction.event,
  );
});

calendar.on('task-update', (transaction) => {
  return updateTaskOccurrence(
    transaction.task.id,
    transaction.oldEvent,
    transaction.event,
  );
});
```

Every task category and occurrence has a stable `id`. Occurrence status is one
of `pending`, `completed`, `late`, `missed`, `skipped`, or `excused`.
Occurrence IDs must be unique within their category. Same-category date ranges
cannot overlap unless that category explicitly sets `allowOverlap: true`;
`forceOverride: true` replaces conflicting occurrences during a mutation.
Snapshots returned by `getTasks()` and `getTaskById()` are cloned and frozen.
Task mutations are optimistic transactions: returning `false`, rejecting a
promise, or calling `transaction.revert()` restores the previous task state
when no newer mutation made the transaction stale. Lifecycle events include
`task-add`, `task-update`, `task-remove`, `task-status-change`,
`task-change-pending`, `task-change-settled`, `task-change-error`, and
`task-revert`.

Task icons may be plain text or inline SVG. SVG scripts, external references,
event-handler attributes, and embedded HTML are removed before rendering.

### Async task sources

Repeated-task categories can come from static `task`, one or more
`taskSources`, or both. Every source load receives the visible range, active
view, time zone, abort signal, source ID, and load reason. Navigation aborts
obsolete requests and sequence protection ignores stale loaders that do not
honor the signal.

```typescript
const calendar = new WtsCalendar({
  container,
  license,
  plugins: [repeatedTasksModule],
  view: 'monthly-repeated-task',
  task: localTasks,
  taskSources: [{
    id: 'work-tracker',
    url: '/api/calendar/tasks',
    request: { pageSize: 100 },
    requestAdapter: ({ start, end, timeZone, request }) => ({
      from: start,
      to: end,
      timeZone,
      cursor: request.cursor,
      limit: request.pageSize,
    }),
    fetchOptions: async () => ({
      headers: {
        authorization: `Bearer ${await getAccessToken()}`,
      },
    }),
    responseAdapter: response => ({
      tasks: response.data.categories,
      meta: { revision: response.data.revision },
      page: {
        nextCursor: response.data.nextCursor,
        hasMore: Boolean(response.data.nextCursor),
        total: response.data.total,
      },
    }),
    taskDataTransform: category => ({
      id: category.id,
      version: category.version,
      name: category.code,
      title: category.label,
      enable: category.active,
      icon: category.icon ?? '',
      data: category.occurrences.map(occurrence => ({
        id: occurrence.id,
        version: occurrence.version,
        start: occurrence.start,
        end: occurrence.end,
        reason: occurrence.note,
        status: occurrence.status,
      })),
    }),
    retries: 2,
    retryDelay: attempt => attempt * 500,
  }],
});
```

Without `responseAdapter`, an endpoint may return a task array directly or:

```json
{
  "tasks": [
    {
      "id": "focus-time",
      "name": "focus-time",
      "title": "Focus time",
      "enable": true,
      "icon": "",
      "data": [
        {
          "id": "focus-2026-08-04",
          "start": "2026-08-04",
          "status": "completed"
        }
      ]
    }
  ],
  "meta": {
    "revision": 17
  }
}
```

Source operations are `addTaskSource(source)`, `removeTaskSource(id)`,
`getTaskSources()`, `refetchTasks(sourceId?, request?)`, and
`loadMoreTasks(sourceId, request?)`. `refetchSources()` also refreshes task
sources. Loads emit `task-source-loading`,
`task-source-success`, and `task-source-error`.

Each successful response replaces only that source's owned categories as one
atomic snapshot. Static tasks and other source snapshots remain intact.
Invalid or failed refreshes retain the previous successful data.
`invalidTaskPolicy: 'skip'` keeps valid categories and reports invalid records
through `skippedTasks`; the default is `reject-source`. Local task mutations
update the owning static or source snapshot, while a later successful refetch
reconciles that source to the server's stable category and occurrence IDs.
Cursor and page-based pagination append new categories and merge additional
occurrences into an existing category by its stable ID.
Optional string or numeric `version` fields are preserved on both categories
and occurrences so mutation callbacks can send optimistic-concurrency values
back to the application server.

Resource scheduling module: `resource`, `resource-day-grid-day`,
`resource-day-grid-week`, `resource-time-grid-day`,
`resource-time-grid-week`, and `resource-timeline`. Vertical resource grids
support `datesAboveResources` for date-major versus resource-major headings.

### Agenda/list views

The list views render foreground events in accessible date groups:

- `list-day` shows one calendar day.
- `list-week` follows `startOfWeek`.
- `list-month` shows the exact calendar month.
- `list-year` shows the exact calendar year.
- `list` shows a custom number of days configured with
  `listView.durationDays`.

```typescript
const calendar = new WtsCalendar({
  container,
  view: 'list',
  viewDate: '2026-08-03',
  listView: {
    durationDays: 14,
    virtualizationThreshold: 200,
    overscan: 8,
    showEmptyDays: false,
    dayFormat: 'EEEE, MMMM d, yyyy',
    eventTimeFormat: 'HH:mm',
    stickyHeaders: true,
  },
  events,
});

calendar.setView('list-month', '2026-09-01');
```

Recurring events and occurrence overrides expand through the same recurrence
and named-time-zone pipeline as grid views. Advanced RRULE expansion is
available when `rrulePlugin` is configured. Multi-day events appear in every
visible date group they intersect. Background and inverse-background events
remain availability layers and are intentionally omitted from the agenda.

List rows support event clicks, event render hooks, Arrow Up/Down and Home/End
navigation, resource labels and filtering, hidden days, valid ranges, loading
and error announcements, and an empty state. Once the configured threshold is
reached, measured variable-height rows are virtualized with overscan; only
the visible window is mounted while the full scroll range and keyboard
positions remain available. `noEventsContent` customizes the empty range.
When licensed resource scheduling is configured, `listView.resourceIds`
filters the agenda to assigned events and displays the matching resource
titles.

## External and cross-calendar drag

Set `droppable: true` on a receiving calendar. Bind backlog, kanban, or task
elements with `makeDraggable`; the returned cleanup function removes every
listener and restores the element attributes.

```typescript
const calendar = new WtsCalendar({
  container,
  view: 'month',
  droppable: true,
  dropAccept: '.calendar-backlog-item',
  eventTransferMode: 'move',
  eventOverlap: false,
  eventDragMinDistance: 6,
  eventLongPressDelay: 500,
  dragRevertDuration: 250,
  dragScroll: true,
  drop: ({ draggedEl, dateStr }) => {
    console.log('External element reached', dateStr, draggedEl);
  },
});

const backlogItem = document.querySelector<HTMLElement>('#backlog-item')!;
const stopDragging = calendar.makeDraggable(backlogItem, {
  title: backlogItem.dataset['title'] ?? 'Backlog item',
  durationMinutes: 60,
}, {
  minDistance: 6,
  longPressDelay: 500,
  appendTo: document.body,
});

calendar.on('event-receive', async (transaction) => {
  const response = await fetch('/api/calendar/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(transaction.event),
  });
  return response.ok; // false or rejection rolls the drop back automatically
});

// Component teardown:
stopDragging();
calendar.destroy();
```

For delegated HTML drag sources, use `externalEventData` instead of binding
each element:

```typescript
const calendar = new WtsCalendar({
  container,
  droppable: true,
  externalEventData: ({ element }) => ({
    title: element.dataset['title'] ?? 'Untitled event',
    durationMinutes: Number(element.dataset['duration'] ?? 60),
  }),
});
```

Dragging an event into another droppable `WtsCalendar` moves it by default.
Set `eventTransferMode: 'copy'` on the source calendar, or pass
`{ mode: 'copy' }` to `makeDraggable`, to copy instead. Cross-calendar moves
preserve the source event identity; copies receive a fresh identity.

The receiving calendar emits `event-receive` once for every accepted external
or cross-calendar event. The `drop` callback always runs for an accepted
external element, even when its event data specifies `create: false`; in that
case `event-receive` does not run. The calendar additionally emits the legacy
`external-drop` event for a created external event or `event-transfer` for a
calendar transfer. A moved source emits `event-leave`. Transaction callbacks may return
`false`, reject, or call `transaction.revert()`. Valid range, hidden-day,
business-hour, `eventConstraint`, `eventOverlap`, `eventAllow`, resource, and
capacity checks run before callbacks. `dropAccept` accepts a CSS selector or a
predicate receiving the external element.

Pointer and touch input use an event-only preview without highlighting cells.
For keyboard input, focus a bound external item and press Space, use the arrow
keys to choose a target, then Enter to commit or Escape to cancel. On an event
inside a calendar, Shift+Space starts a cross-calendar keyboard transfer.

## Standard and premium licensing

Month, week, day, and agenda/list views are standard features. Their event
APIs, event sources, named time zones, and rendering hooks work without a
license. Grid views additionally provide selection and drag/resize
interactions.

Resource scheduling, including `resource`, `resource-day-grid-day`,
`resource-day-grid-week`, `resource-time-grid-day`,
`resource-time-grid-week`, and `resource-timeline`, and the monthly/weekly
repeated-task views are
premium features. All resource views use the existing
`resource-scheduling` license feature; they do not require separate grants.
Premium access uses a signed Ed25519 license token rather than a plain API key.
To obtain one, contact the maintainer using the steps in
[Premium licensing](docs/PREMIUM-LICENSING.md). That guide lists the information
to provide, the available entitlement names, and safe browser-only delivery.

The signed audience remains `wts-calendar-v2` as a stable entitlement protocol
identifier after migration to the `@wts-calendar/core` npm name. This preserves
existing customer grants; the audience is not an import or package name and
must not be mechanically rewritten.

Example:

```typescript
import {
  WtsCalendar,
  verifyCalendarLicense,
} from '@wts-calendar/core';
import {
  resourceSchedulingModule,
} from '@wts-calendar/core/resource-scheduling';

// Supply the signed token at runtime. It may come from a customer-controlled
// backend or runtime configuration; never commit a production token.
const license = await verifyCalendarLicense(runtimeConfig.wtsCalendarLicense);

const calendar = new WtsCalendar({
  container,
  license,
  plugins: [resourceSchedulingModule],
  view: 'resource',
  resources: [
    { id: 'design', title: 'Design team' },
  ],
  events: [
    {
      title: 'Design review',
      start: '2026-08-04T10:00:00',
      resourceId: 'design',
    },
  ],
});

console.log(calendar.getLicenseStatus());
```

### Resource DayGrid

Use `resource-day-grid-day` or `resource-day-grid-week` for resource columns
without a time axis. Timed and all-day events share the resource/date cell.
`datesAboveResources: false` (the default) groups columns by resource first;
set it to `true` to group by date first. The same heading option applies to
Resource TimeGrid.

### Resource day and week time grids

Use `resource-time-grid-day` or `resource-time-grid-week` to display resources
as columns in a timed schedule. Both views require at least one configured
resource or resource source. An event is placed in a resource column through
its `resourceId`:

```typescript
const calendar = new WtsCalendar({
  container,
  license,
  view: 'resource-time-grid-week',
  viewDate: '2026-08-03',
  resources: [
    { id: 'design', title: 'Design' },
    { id: 'engineering', title: 'Engineering' },
  ],
  weekView: {
    hourSegment: 30,
    segmentHeight: 40,
    dragTolerance: 6,
    resizeTolerance: 1,
  },
  resourceTimeGrid: {
    columnWidth: 168,
    virtualizationThreshold: 24,
    overscan: 2,
  },
  columnResizing: {
    enabled: true,
    minWidth: 72,
    maxWidth: 480,
    keyboardStep: 12,
  },
  selectable: true,
  events: [
    {
      id: 'review',
      title: 'Design review',
      start: '2026-08-04T10:00:00',
      end: '2026-08-04T11:00:00',
      resourceId: 'design',
    },
  ],
});

calendar.on('select', ({ start, end, resourceId }) => {
  console.log({ start, end, resourceId });
});

calendar.setView('resource-time-grid-day', '2026-08-04');
```

The day form reuses `dayView` options and the week form reuses `weekView`
options, including `hourSegment`, `hourSegmentRange`, `segmentHeight`,
`dragTolerance`, and `resizeTolerance`. Global `slotMinTime`, `slotMaxTime`,
`scrollTime`, business hours, valid ranges, and named time-zone behavior also
apply.

Editable timed events can be moved to another time or resource column and
resized using pointer, touch, or keyboard input. A committed move updates
`start`, preserves the event duration, and sets the destination `resourceId`;
a committed resize updates `end` without changing `resourceId`. Selection is
timed and returns the selected column's `resourceId`. The normal
`event-drop`, `event-resize`, constraint, pending-validation, rollback, and
selection APIs are used.

Resource columns have a configurable fixed width and the view uses horizontal
overflow when all columns do not fit. Once the flattened date × resource
column count reaches `virtualizationThreshold`, only the visible columns plus
`overscan` are mounted. Headers, all-day cells, timed cells, event hooks,
selection focus, and scroll geometry remain synchronized. Set a higher
threshold to keep small schedules fully mounted. The existing all-day
`resource` view retains its independent row-virtualization behavior.

Resources with `parentId` are rendered as an expandable hierarchy in both
resource time-grid modes and in the all-day `resource` view. Collapsing a
parent removes its descendant columns or rows, including descendant events,
without changing the event or resource data. Expansion state survives date
navigation and dynamic option rebuilds. Toggle buttons support click, touch,
Enter/Space, and Arrow Left/Right interaction. The
`resourceTimeline.resourcesInitiallyExpanded` option supplies the initial
state consistently across every resource scheduling view.

Collapsed parents retain a text summary of the hidden subtree. The summary
contains the visible-range event count, peak concurrent `resourceUnits`, the
sum of leaf-resource capacity, utilization, unavailable assignments, and
capacity conflicts. The same calculation is used by Resource, Resource Time
Grid, and Resource Timeline, including their virtualized layouts.

```typescript
const calendar = new WtsCalendar({
  container,
  license,
  view: 'resource-timeline',
  resources,
  events,
  resourceTimeline: {
    resourcesInitiallyExpanded: false,
  },
  resourceSummaryContent: ({ summary }) =>
    `${summary.eventCount} scheduled · ` +
    `${summary.bookedUnits}/${summary.capacity ?? '—'} units` +
    (summary.conflictCount ? ` · ${summary.conflictCount} conflicts` : ''),
});
```

Summary content is text-only. Each collapsed row or column also exposes
`data-calendar-resource-event-count`,
`data-calendar-resource-booked-units`,
`data-calendar-resource-capacity`, and
`data-calendar-resource-conflict-count` for application styling and testing.
Use `--calendar-resource-summary-*` CSS variables to customize its typography
and conflict colors.

### Resource timeline

Use `timeline` for the same horizontal date scale without resource rows. It
renders every ordinary event in one virtualized lane stack and does not
require `resources` or assign a synthetic resource ID to callbacks:

```typescript
import { WtsCalendar } from '@wts-calendar/core';
import { resourceSchedulingModule } from
  '@wts-calendar/core/resource-scheduling';

const calendar = new WtsCalendar({
  container,
  license,
  plugins: [resourceSchedulingModule],
  view: 'timeline',
  viewDate: '2026-08-03',
  events,
  resourceTimeline: { durationDays: 30, slotWidth: 88 },
});
```

Named timeline durations are also supported through `views`. Timeline remains
part of the optional resource-scheduling entry point because both layouts
share the same two-axis scale, interaction, and virtualization engine.

Use `resource-timeline` for a multi-day plan with resources as rows and days
as horizontal slots:

```typescript
const calendar = new WtsCalendar({
  container,
  license,
  view: 'resource-timeline',
  viewDate: '2026-08-03',
  resources: [
    {
      id: 'delivery',
      title: 'Product delivery',
      capacity: 12,
      extendedProps: { location: 'Global' },
    },
    {
      id: 'design',
      parentId: 'delivery',
      title: 'Design',
      capacity: 4,
      extendedProps: { location: 'London' },
    },
    {
      id: 'engineering',
      parentId: 'delivery',
      title: 'Engineering',
      capacity: 8,
      extendedProps: { location: 'Remote' },
    },
  ],
  resourceTimeline: {
    durationDays: 30,
    slotWidth: 88,
    rowMinHeight: 52,
    resourceAreaWidth: 220,
    resourceVirtualizationThreshold: 50,
    slotVirtualizationThreshold: 60,
    resourceOverscan: 6,
    slotOverscan: 3,
    resourcesInitiallyExpanded: true,
    resourceAreaColumns: [
      {
        field: 'title',
        header: 'Team',
        width: 220,
        minWidth: 160,
        maxWidth: 360,
      },
      {
        field: 'capacity',
        header: 'Capacity',
        width: 96,
        resizable: false,
      },
      { field: 'location', header: 'Location', width: 120 },
      {
        field: 'summary',
        header: 'Summary',
        width: 140,
        value: (resource) => `${resource.capacity ?? 0} seats`,
      },
    ],
  },
  selectable: true,
  events: [
    {
      id: 'launch',
      title: 'Launch preparation',
      start: '2026-08-04',
      end: '2026-08-08',
      isAllDay: true,
      resourceId: 'design',
      editable: true,
    },
  ],
});
```

The timeline supports deterministic overlap lanes, foreground and background
events, business and valid-range shading, resource-scoped selection,
cross-resource/date dragging, end-date resizing, lifecycle hooks, asynchronous
interaction validation, and named time zones. Drag and resize are available
through pointer, touch, and keyboard input.

Resource rows and day slots virtualize independently once their configured
thresholds are reached. Sticky resource names, date headers, focus restoration,
selection state, and balanced `eventDidMount`/`eventWillUnmount` hooks remain
synchronized as either axis scrolls. `durationDays` accepts 1–366 calendar
days; navigation advances by the configured duration.

Set `parentId` to build any validated, cycle-free resource hierarchy shared by
the all-day resource grid, resource day/week time grids, and resource
timeline. Expandable rows and columns retain their state across navigation and
dynamic option rebuilds and expose tree semantics for assistive technology.
`resourceAreaColumns` accepts built-in `title` and `capacity` fields, exact
`extendedProps` keys, or a text-only `value` callback. Values are assigned
with `textContent`; HTML column values are not accepted. A trusted
`content` render hook may instead return text or DOM nodes. Explicit column
widths are combined into the sticky resource area. When columns are omitted,
`resourceAreaWidth` continues to control the single resource-title column.

Resource visibility and ordering are independent from the source collection.
`resourceFilter` receives the resource, its assigned events, the active view,
event presence, and descendant-match count. Matching descendants retain their
ancestors, so a filter cannot create an invalid tree. Set
`filterResourcesWithEvents` for the common event-presence filter. Source order
is preserved unless `resourceOrder` supplies comma-separated fields,
descending `-field` entries,
comparator functions, or a mixed array. None of these operations mutate the
application's resource array.

Resource Timeline supports both the compatible `resourceGroupField` shortcut
and nested `resourceGroupFields`. Group tiers accept derived-value callbacks,
labels, empty labels, and independent ordering. Setting `group: true` or a
group definition on a resource-area column adds that column as an outer group
tier. Column groups, nested global groups, and the existing `parentId`
hierarchy can be used together:

```typescript
const calendar = new WtsCalendar({
  container,
  license,
  plugins: [resourceSchedulingModule],
  view: 'resource-timeline',
  resources,
  events,
  resourceFilter: ({ resource }) => resource.extendedProps?.active !== false,
  resourceOrder: ['-capacity', 'title'],
  resourceGroupOrder: 'asc',
  resourceGroupFields: [
    { field: 'region', label: 'Region', order: 'desc' },
    {
      field: 'utilizationBand',
      value: (resource) => Number(resource.capacity ?? 0) >= 10
        ? 'Large'
        : 'Small',
    },
  ],
  resourceTimeline: {
    resourceAreaColumns: [
      { field: 'team', header: 'Team', group: true },
      {
        field: 'title',
        header: 'Resource',
        classNames: ({ resource }) =>
          resource?.extendedProps?.active === false ? 'is-inactive' : [],
        didMount: ({ el }) => observeResourceCell(el),
        willUnmount: ({ el }) => unobserveResourceCell(el),
      },
    ],
  },
});
```

Resource rendering uses balanced lifecycle hooks across ordinary rendering,
virtual-window recycling, filtering, grouping, collapse/expand, navigation,
option rebuilds, and destruction. The public surfaces are:

- Column-header class/content/lifecycle, plus header-inner, divider, and
  header-row classes.
- Resource-cell class/content/lifecycle, plus row, indent, and expander classes.
- Resource-lane class/content/lifecycle, plus lane-top and lane-bottom
  class/content hooks.
- Group-header and group-lane class/content/lifecycle, plus their inner classes.
- Vertical Resource TimeGrid day-header and lane classes/content/lifecycle.
- Per-column class, content, mount, and unmount hooks that compose with global
  cell hooks.

Every render info object identifies the view, resource or group, depth, field,
field value, optional date, virtualization status, and virtual index. A group
info object additionally exposes its stable key, field, raw value, display
text, nesting level, parent key, and complete descendant resource count.

Column resizing is enabled by default in resource scheduling views. It is
applied where changing width does not break scheduling geometry:

- Resource Timeline metadata columns resize independently. Set
  `resizable: false`, `minWidth`, or `maxWidth` on an individual
  `resourceAreaColumns` entry. Its date-slot borders resize the shared
  timeline scale, keeping every date, event, background, and virtual spacer
  aligned; these commits use `columnId: 'timeline-slots'`.
- Resource Time Grid changes the shared resource-column width, keeping
  virtualization, headers, slots, and events aligned.
- The all-day Resource view supports the resource-name column and individual
  date columns, including correct multi-day event spans.

Drag a header edge with pointer or touch, or focus its separator and press
Arrow Left/Right. Shift changes the keyboard step by 4× and Escape cancels an
active pointer resize. Committed changes emit one `column-resize` callback:

```typescript
calendar.on('column-resize', ({
  view,
  columnId,
  previousWidth,
  width,
  source,
}) => {
  console.log({ view, columnId, previousWidth, width, source });
});
```

Widths survive navigation and re-rendering for the lifetime of the calendar
instance. Set `columnResizing: false` to disable all handles. Customize the
visible hover/focus indicator with
`--calendar-column-resizer-color`; ordinary month/week/day columns and
Resource Timeline date slots retain uniform scheduling widths while allowing
the shared scale to be resized.

### Resource availability and assignment policies

Availability and declarative assignment rules live on each resource. Event
requirements travel with the event, so the same decision is enforced for
programmatic selection and mutation, pointer/touch/keyboard drag and resize,
external receive, and calendar-to-calendar transfer:

```typescript
const resources = [{
  id: 'design',
  title: 'Design',
  availability: {
    workingHours: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
    },
    unavailable: [{
      start: '2026-08-12T13:00:00',
      end: '2026-08-12T17:00:00',
      reason: 'Design offsite',
    }],
  },
  assignmentPolicy: {
    allowedEventTypes: ['design'],
    skills: ['figma', 'research'],
    roles: ['reviewer'],
  },
}];

const events = [{
  id: 'review',
  title: 'Design review',
  start: '2026-08-11T13:00:00',
  end: '2026-08-11T14:00:00',
  resourceId: 'design',
  resourceRequirements: {
    eventType: 'design',
    skills: ['figma'],
    roles: ['reviewer'],
  },
}];
```

Timed assignments must fit completely within one working interval. All-day
assignments require a matching working weekday. Any intersection with an
exact unavailable range is rejected. Resource cells expose
`data-calendar-resource-unavailable` and the optional
`data-calendar-resource-unavailable-reason`, receive `aria-disabled="true"`,
and do not expose selection or drop metadata.

Use `resourceAssignmentAllow` for application or server approval after the
built-in synchronous rules pass. It may return a boolean, a structured
decision, or a promise:

```typescript
const calendar = new WtsCalendar({
  // ...
  resourceAssignmentAllow: async ({ event, resource, operation }) => {
    const response = await fetch('/api/calendar/assignments/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventId: event.id,
        resourceId: resource.id,
        operation,
      }),
    });
    if (response.ok) return true;
    return {
      allowed: false,
      code: 'approval-required',
      message: 'Resource approval is required.',
    };
  },
});

calendar.on('resource-assignment-invalid', ({ context, decision }) => {
  console.log(context.operation, context.resource.id, decision);
});
```

Promise decisions use the existing pending, timeout, settled, error, and
automatic rollback lifecycle. Built-in failures are reported through
`event-constraint-violation` or `select-invalid` with structured codes:
`resource-unavailable`, `resource-event-type`, `resource-skill`, and
`resource-role`. Use transactional `createEvent` and `editEvent` when async
approval is required; synchronous `addEvent` and `updateEvent` enforce the
declarative resource rules.

`WtsCalendar.createLicensed(options, token)` is an equivalent convenience
API. Tokens are verified against the public key pinned in the package and may
be restricted by expiry, feature, and exact browser origin. A fabricated
grant, a modified token, an expired token, or an unlicensed origin is rejected
before the premium calendar mutates the DOM. Premium checks also apply to
later `setView`, `addEvent`, `setEvents`, `updateEvent`, and event-source
operations. The deprecated `apikey` option is rejected because a public API
key is not a meaningful browser-side guard.

The signing private key must exist only in a secrets manager or isolated
licensing service. Never place it in a browser bundle, repository, CI artifact,
or customer application. To create and sign a local development key from this
package directory:

```bash
npm run license:keygen
npm run license:sign -- \
  .license-private/wts-calendar-ed25519-private.pem \
  test/fixtures/license-claims.json \
  .license-private/development-license.token
```

The `.license-private` directory is ignored by version control. Replace the
development signing key and token before publishing a production release.
Standard and premium implementations intentionally ship together in
`@wts-calendar/core`. Runtime verification raises the cost of casual misuse, but
client-side code can always be patched by a determined attacker. Stronger
commercial enforcement should therefore come from the licensing service:
short-lived signed tokens, account and origin binding, controlled renewal,
revocation, and purchase-entitlement checks.

## Visible dates and working hours

Scheduling boundaries apply consistently to month, week, day, resource, and
resource day/week time-grid views:

```typescript
const calendar = new WtsCalendar({
  container,
  weekends: false,
  hiddenDays: [3], // additionally hide Wednesday; Sunday is 0
  validRange: {
    start: '2026-07-01', // inclusive
    end: '2026-10-01',   // exclusive
  },
  slotMinTime: '08:00',
  slotMaxTime: '19:00',
  scrollTime: '08:30',
  scrollTimeReset: true,
  nowIndicator: true,
  businessHours: [
    {
      daysOfWeek: [1, 2, 4, 5],
      startTime: '09:00',
      endTime: '17:30',
    },
  ],
});
```

`hiddenDays` uses weekday numbers `0` through `6`. `weekends: false` adds
Sunday and Saturday to that list. Hiding all seven weekdays is rejected.
Hidden columns are removed from layout, keyboard navigation, selection, and
drop targets rather than rendered as empty placeholders.

`validRange.start` is inclusive and `validRange.end` is exclusive. Dates
outside it remain visible where a complete month or week grid needs context,
but they are disabled and cannot be selected, dropped onto, or resized into.
Previous and next controls disable at the range boundary, and asynchronous
event-source requests are clipped to the valid range.

`slotMinTime` and `slotMaxTime` control the day/week time window;
`slotMaxTime` accepts `24:00`. Existing `dayView.hourSegmentRange` or
`weekView.hourSegmentRange` values take precedence for backward
compatibility. `scrollTime` selects the initial position. With
`scrollTimeReset: false`, user scroll position is preserved when the view
refreshes; the default is `true`.

`slotDuration` controls time-grid row resolution while `snapDuration`
independently controls drag and resize snapping. `slotLabelFormat`,
`allDaySlot`, and `allDayText` configure the time axis. Use
`slotEventOverlap`, `eventMaxStack`, and `eventMinHeight` to control dense
timed-event layout. `slotLabelTiers` adds independently formatted and spaced
axis tiers. When `eventMaxStack` hides overlapping events,
`timeGridMoreLinkContent` customizes the link and `timeGridMoreLinkClick`
chooses an accessible popover, expansion, or an application callback.

```typescript
const calendar = new WtsCalendar({
  container,
  view: 'week',
  slotDuration: 30,
  slotLabelTiers: [
    { format: 'EEE MMM d', interval: 1440 },
    { format: 'HH:mm', interval: 60 },
  ],
  eventMaxStack: 3,
  timeGridMoreLinkContent: ({ count }) => `${count} conflicts`,
  timeGridMoreLinkClick: 'popover',
});
```

Events without `end` render with `defaultTimedEventDuration` (60 minutes) or
`defaultAllDayEventDuration` (one calendar day). Rendering does not mutate
application data unless `forceEventDuration: true` is configured. Date-only
starts infer all-day behavior; an explicitly timed event remains timed even
when it spans midnight or a full day.

Month grids support `fixedWeekCount`, `showNonCurrentDates`, `dayMaxEvents`,
`moreLinkClick`, `displayEventTime`, `displayEventEnd`, and
`eventTimeFormat`. Overflow callbacks receive the hidden events, all events,
date, count, and active view. Same-range refreshes reuse the existing month
grid and only reconcile event/background layers. Run `npm run benchmark:month`
inside the package to measure the 5,000-event baseline; pass a different event
count as the script's first argument when invoking the benchmark file directly.
`npm run benchmark:time-grid` measures a 5,000-event overlap cluster and
verifies that `eventMaxStack` leaves only the configured visible lanes mounted;
the remaining events stay virtual and are available through the accessible
popover.

Set `weekNumbers: true` to add week numbers. `weekNumberCalculation` accepts
`'ISO'`, `'local'`, or a callback. `navLinks: true` turns appropriate date and
week labels into day/week navigation controls.

Shared structural hooks are available across month, week, day, and list
rendering: `dayCell*`, `dayHeader*`, `slotLabel*`, and `slotLane*` class,
content, mount, and unmount callbacks. Hook strings are inserted as text. DOM
nodes must belong to the configured calendar document. All-day events expose
an invisible end-edge resize target in day/week views, supporting pointer,
keyboard, and Escape cancellation without adding a visible divider.

Overflow and current-time surfaces use the same balanced lifecycle contract:
`moreLinkClassNames`/`Content`/`DidMount`/`WillUnmount`,
`morePopoverClassNames`/`Content`/`DidMount`/`WillUnmount`, and
`nowIndicatorClassNames`/`Content`/`DidMount`/`WillUnmount`. More-link info
includes the hidden and complete event sets; popover info also exposes its
anchor; now-indicator info distinguishes the time-grid line from the axis
marker with `isAxis` and includes the resource in scheduling views.

```typescript
const calendar = new WtsCalendar({
  container,
  dayMaxEvents: 3,
  nowIndicator: true,
  moreLinkClassNames: ({ count }) => [`has-${count}-hidden-events`],
  moreLinkContent: ({ count }) => `Show ${count} more`,
  morePopoverDidMount: ({ el, hiddenEvents }) => {
    console.log('Overflow opened', el, hiddenEvents);
  },
  morePopoverWillUnmount: ({ el }) => {
    console.log('Overflow closed', el);
  },
  nowIndicatorClassNames: ({ isAxis }) => [
    isAxis ? 'current-time-axis' : 'current-time-line',
  ],
});
```

Top-level `businessHours` controls visible working/non-working shading.
`interactionConstraints.businessHours` remains the rule that rejects invalid
drag, resize, and selection operations; when visible business hours are not
set, the constraint schedule is also used for shading. `nowIndicator` renders
the current time only when it is inside the active time grid and valid range.

## Background events and availability

Set an event's `display` to `background` for blocked, preferred, or
informational ranges. Use `inverse-background` to shade everything outside
one or more availability intervals. Inverse events with the same `groupId`
form one union before the complement is calculated.

```typescript
const calendar = new WtsCalendar({
  container,
  events: [
    {
      id: 'maintenance',
      title: 'Maintenance',
      start: '2026-08-04T12:00:00',
      end: '2026-08-04T14:00:00',
      display: 'background',
      color: '#ef4444',
    },
    {
      id: 'design-hours',
      groupId: 'design-availability',
      title: 'Design availability',
      start: '2026-08-03T09:00:00',
      resourceId: 'design',
      display: 'inverse-background',
      recurring: {
        frequency: 'weekly',
        daysOfWeek: [1, 2, 3, 4, 5],
        startDate: '2026-08-03',
        startTime: '09:00',
        endTime: '17:00',
      },
    },
  ],
});
```

Background events support all-day and timed ranges, recurrence, named time
zones, and global or resource-specific placement. They are visual layers:
they are not focusable, draggable, clickable, or counted as collisions by
event-overlap and selection constraints.

Event `color` remains the default layer color, but it does not become an
inline `background-color`. Applications can override the rendered colors and
opacity with inherited CSS variables:

```css
.calendar-host {
  --calendar-background-event-color: #fee2e2;
  --calendar-background-event-opacity: 0.3;
  --calendar-inverse-background-event-color: #e5e7eb;
  --calendar-inverse-background-event-opacity: 0.2;
}

/* Optional override only for previous/next-month cells. */
.calendar-host .calendar-outside-month {
  --calendar-background-event-color: #f8fafc;
  --calendar-inverse-background-event-color: #f8fafc;
}
```

Rendering can be controlled globally and overridden per event. `eventDisplay`
and an event's `display` accept `auto`, `block`, `list-item`, `background`,
`inverse-background`, and `none`. The event-level value wins. `eventColor`,
`eventTextColor`, and `backgroundEventColor` provide calendar-wide defaults;
event `color` and `textColor` remain local overrides.

`eventOrder` accepts a comma-separated field list, a comparator, or an array
containing either. Prefix a field with `-` for descending order. Custom fields
may be supplied through `event.meta`; the default is
`start,-duration,allDay,title`. Time grids normally prioritize chronological
compaction and use the configured order to break ties. Set `eventOrderStrict`
to preserve the configured order across an overlapping cluster.

Use the rendering and interaction hooks to customize event segments:

```typescript
const calendar = new WtsCalendar({
  container,
  events,
  eventOrder: '-priority,start,title',
  eventClassNames: ({ event, isBackground }) =>
    isBackground ? ['availability-layer'] : [`event-${event.id}`],
  eventContent: ({ event, timeText }) =>
    `${timeText ? `${timeText} ` : ''}${event.title}`,
  eventDidMount: ({ el, event, isStart, isEnd }) => {
    el.dataset['analyticsEvent'] = event.id ?? '';
    el.dataset['segment'] = `${isStart}-${isEnd}`;
  },
  eventWillUnmount: ({ el }) => {
    // Release element-scoped integrations here.
  },
  eventMouseEnter: ({ el }) => {
    el.dataset['hovered'] = 'true';
  },
  eventMouseLeave: ({ el }) => {
    delete el.dataset['hovered'];
  },
  eventClick: ({ event, jsEvent }) => {
    console.log(event.id, jsEvent.type);
  },
});
```

`eventClassNames` and `eventContent` accept either a static value or a callback;
an event's own `classNames` are merged first. Content applies only to foreground
labels. Strings are inserted as text, never HTML; returned DOM nodes must belong
to the calendar's configured `document`. The immutable render info includes
`event`, `view`, `display`, `timeText`, `isBackground`, `isStart`, `isEnd`,
`isMirror`, `isPast`, `isFuture`, and `isToday`.

`eventDidMount` and `eventWillUnmount` are balanced once per rendered segment,
including background segments. `eventClick`, `eventMouseEnter`, and
`eventMouseLeave` receive the event, element, native event, and active view.
Changing event-rendering options through `setOptions()` rebuilds segments with
the same unmount/mount balance, and `destroy()` unmounts every remaining
segment.

## Event API

- `addEvent(event | events)`
- `setEvents(events)` for atomic replacement
- `getEvents()`
- `getEventById(id)`
- `updateEvent(id, changes)`
- `createEvent(input)`
- `editEvent(id, changes, { occurrence | scope })`
- `removeEventWithTransaction(id, { occurrence | scope })`
- `updateRecurringEvent(id, changes, { occurrence | scope })`
- `removeRecurringEvent(id, { occurrence | scope })`
- `removeEvent(id)`
- `removeAllEvents()`
- `undo()` / `redo()` / `clearEventHistory()`
- `getEventHistoryState()`
- `importICalendar(source, options)`
- `exportICalendar(options)`
- `addEventSource(source)`
- `removeEventSource(id)`
- `getEventSources()`
- `refetchEvents(sourceId?)`
- `on(name, callback)` / `off(name, callback)`

`setEvents()` validates the complete replacement before changing the store,
renders once, and emits `events-set`. Use `batchRendering(() => { ... })` to
coalesce several synchronous add, update, or remove operations into one
render. Use `await batchRenderingAsync(async () => { ... })` when mutations
span an asynchronous boundary. Returning a Promise from `batchRendering()`
throws so an asynchronous batch cannot silently render early.

### Headless event creation and editing

The package does not impose a dialog framework. Enable `eventCreation` to
turn an accepted selection into an `event-create-request`; the application
can open its own Angular, React, Vue, Web Component, or native dialog and then
commit or cancel the request.

```typescript
const calendar = new WtsCalendar({
  container,
  selectable: true,
  eventCreation: { defaultTitle: 'New event' },
  eventHistory: { limit: 100 },
});

calendar.on('event-create-request', request => {
  openEventDialog(request.suggestedEvent).then(values => {
    if (values) request.commit(values);
    else request.cancel();
  });
});

calendar.on('event-edit-request', request => {
  openEventDialog(request.event).then(values => {
    if (values) {
      request.update(values, {
        scope: request.recurring ? 'occurrence' : 'series',
      });
    } else {
      request.cancel();
    }
  });
});

calendar.on('event-remove-request', request => {
  confirmRemoval(request.event).then(confirmed => {
    if (confirmed) request.confirm();
    else request.cancel();
  });
});
```

Double-clicking an event or pressing Enter emits `event-edit-request`.
Delete/Backspace emits `event-remove-request`. Escape cancels an outstanding
request. Touch applications can use the existing `event-click` callback to
open the same editor and call `editEvent()` directly.

Create, edit, and remove are optimistic transactions. Listen to
`event-create`, `event-edit`, or `event-remove` to persist a transaction, or
configure one shared validator:

```typescript
const calendar = new WtsCalendar({
  container,
  eventMutationValidator: async transaction => {
    const response = await fetch('/api/calendar/events', {
      method: transaction.type === 'create'
        ? 'POST'
        : transaction.type === 'remove'
          ? 'DELETE'
          : 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(transaction.event),
    });
    return response.ok;
  },
});
```

Returning or resolving `false`, rejecting, or exceeding
`interactionValidationTimeout` restores the exact pre-mutation snapshot.
The lifecycle emits `event-mutation-pending`, `event-mutation-settled`,
`event-mutation-error`, and `event-mutation-revert`. Each accepted
create/edit/remove, drag, resize, or cross-calendar transfer creates one
bounded history entry. `Ctrl/Cmd+Z`, `Ctrl+Y`, and `Ctrl/Cmd+Shift+Z` call the
same undo/redo APIs.

Recurring requests expose three scopes:

- `occurrence` writes one deterministic occurrence override.
- `future` atomically splits the recurrence at the selected occurrence.
- `series` changes or removes the complete series.

Future scope supports core recurrence and RRULE `COUNT`/`UNTIL` schedules,
including exception partitioning. Its split is one transaction and one undo
entry.

User-initiated drag, drop, and resize commits emit one `update-event` callback
with the stored `CalendarEvent`. Set `editable: false` to disable editing or
`draggable: false` to disable dragging for an event.

In month view, drag an event to move it while preserving its time and
duration. Use the event's end edge to extend or shrink it across dates and
weeks. The resize target supports pointer/touch input plus Left/Right arrows;
press Enter to commit or Escape to cancel. Month resizing preserves the
existing end time instead of converting it to midnight.

Editable events in month, day, week, resource, and resource time-grid views
are keyboard draggable: focus an event, press Space to grab it, move with the
arrow keys, then press Enter or Space to commit. In resource time grids,
Up/Down changes time and Left/Right changes resource columns. Enter opens the
event without starting a drag. Escape cancels without an update. Day, week,
and resource time-grid resize targets use the arrow keys to adjust duration,
Enter or Space to commit, and Escape to restore the original duration. Drag
and resize previews animate the event itself and do not highlight grid cells.

## Accessibility

Primary calendar views expose named grids, rows, cells, events, toolbar
controls, resize separators, and modal dialogs to assistive technology. Cells
use roving focus, so only one grid cell participates in the page Tab order.
Use the arrow keys to move between cells, Home/End to move to the first or last
cell in the current row or time column, and Tab to leave the grid.

Selection, event movement, resize results, validation failures, navigation,
and cancellations are announced through a polite live region. Opening the
more-events dialog traps focus inside it; Escape closes the dialog and restores
focus to its trigger. Moving and resizing always have keyboard alternatives,
so drag gestures are not required.

## Range selection

Set `selectable: true` to enable pointer, touch, and keyboard selection in the
month, day, week, resource, and resource time-grid views. Month and resource
ranges are all-day; day, week, and resource time-grid ranges use the active
time grid. Resource selections include the selected column's `resourceId`.
Range ends are always exclusive.

```typescript
const calendar = new WtsCalendar({
  container,
  selectable: true,
  selectMirror: true,
  selectMinDistance: 6,
  selectLongPressDelay: 700,
  unselectAuto: true,
  unselectCancel: '.event-editor',
  selectOverlap: event =>
    event.display === 'background' || event.display === 'inverse-background',
  selection: {
    snapDuration: 15,
    minimumDuration: 30,
  },
  selectAllow: selection => selection.end > selection.start,
  dateClick: info => {
    console.log(info.dateStr, info.allDay, info.resource);
  },
  select: selection => {
    console.log(
      selection.startStr,
      selection.endStr,
      selection.resource,
    );
  },
  unselect: ({ selection, jsEvent }) => {
    console.log('cleared', selection.startStr, jsEvent?.type);
  },
});

calendar.select({
  start: '2026-08-04T09:00:00',
  end: '2026-08-04T10:00:00',
});
calendar.getSelection();
calendar.unselect();
```

Press or drag across selectable cells to create a range. Keyboard users can
focus a cell, press Enter or Space to start, extend with the arrow keys, and
press Enter or Space to commit. Escape cancels a draft or clears the committed
range. Accepted ranges emit `select`; clearing or replacing a range emits
`unselect`; rejected ranges emit `select-invalid` with the constraint result.
Selections reuse `interactionConstraints` for business hours, overlap, and
resource capacity. `selectConstraint: 'businessHours'`, an event `groupId`, or
a dedicated constraint object limits only selections. The root `selectOverlap` option
matches FullCalendar semantics: `false` rejects every intersecting foreground
or background event, while a function approves each intersecting event.
`selection.allowOverlap` remains supported as a legacy foreground-only alias.

`dateClick` fires for an unambiguous date/time activation. A positive
`selectMinDistance` separates a mouse click from a drag selection. Touch input
uses `selectLongPressDelay`: movement before the hold remains available for
page/calendar scrolling, and movement after the hold extends the selection.
`selectMirror` replaces TimeGrid cell highlighting during a draft with an
event-like placeholder. Callback selections are immutable and include
exclusive `start`/`end`, zoned `startStr`/`endStr`, `view`, `jsEvent`, and the
selected resource when applicable.

Programmatic selection accepts either the object form shown above or
`calendar.select(start, end?)`. When `end` is omitted, date-only input selects
one exclusive calendar day and timed input selects one snap interval.

Event clicking and hovering use `eventClick`, `eventMouseEnter`, and
`eventMouseLeave`. Their payload contains `event`, `el`, `jsEvent`, and `view`.
Events with a safe `url` navigate after `eventClick`; call
`info.jsEvent.preventDefault()` to cancel that navigation.

## Live Event API

`getEventById()`, `getEvents()`, `addEvent()`, and event-source callbacks expose
live `CalendarEvent` objects. Programmatic mutations retain the object's
identity, validate through the calendar store, and schedule one coalesced
render:

```typescript
const event = calendar.getEventById('planning');

event?.setProp('title', 'Updated planning');
event?.setExtendedProp('priority', 'high');
event?.setStart('2026-08-05T10:00:00', { maintainDuration: true });
event?.moveDates({ days: 1, minutes: 30 });
event?.setAllDay(true, { maintainDuration: true });

console.log(event?.startStr, event?.endStr);
console.log(event?.formatRange({ hour: '2-digit', minute: '2-digit' }));
console.log(event?.toPlainObject());

event?.remove();
```

The mutation surface includes `setProp`, `setExtendedProp`, `setStart`,
`setEnd`, `setDates`, `setAllDay`, `moveStart`, `moveEnd`, `moveDates`,
`formatRange`, `getResources`, `setResources`, `toPlainObject`, and `remove`.
Date mutations use the configured date adapter, so calendar-day movement keeps
wall-clock time stable across named-zone DST transitions. Render-hook event
snapshots are detached and intentionally reject mutation; obtain the live event
by ID when a hook needs to update it.

## Async event sources

`eventSources` accepts inline arrays, loader functions, or URL source objects.
Every load receives the current visible range with an exclusive end, calendar
time zone, active view, abort signal, source ID, and load reason. Navigation,
view changes, refetching, removal, and destruction abort obsolete requests;
sequence protection also ignores stale loaders that do not honor the signal.

```typescript
const calendar = new WtsCalendar({
  container,
  timeZone: 'America/New_York',
  eventSources: [{
    id: 'appointments',
    url: '/api/appointments',
    requestAdapter: ({ start, end, timeZone }) => ({
      fromDate: start,
      toDate: end,
      timezone: timeZone,
      status: ['open', 'confirmed'],
    }),
    fetchOptions: async () => ({
      headers: {
        authorization: `Bearer ${await getAccessToken()}`,
      },
    }),
    responseAdapter: response => response.data.appointments,
    eventDataTransform: appointment => ({
      id: appointment.bookingId,
      title: appointment.customerName,
      start: appointment.startsAt,
      end: appointment.endsAt,
      resourceId: appointment.employeeId,
      meta: appointment,
    }),
    retries: 2,
    retryDelay: attempt => attempt * 500,
  }],
});
```

GET sources receive `start`, `end`, `timeZone`, and `view` query parameters by
default. `requestAdapter` replaces those parameters. POST sources send the
parameter object as JSON unless `fetchOptions.body` is supplied.

Without `responseAdapter`, the endpoint may return either a direct event array
or the structured form:

```json
{
  "events": [
    {
      "id": "event-101",
      "title": "Project meeting",
      "start": "2026-08-04T10:00:00Z",
      "end": "2026-08-04T11:00:00Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

Source snapshots are atomic. A request, response, mapping, validation, or
identifier error leaves the source's previous successful events visible.
`invalidEventPolicy` defaults to `reject-source`; set it to `skip` to retain
valid records and expose rejected records through `skippedEvents`.

Lifecycle events are `event-source-loading`, `event-source-success`, and
`event-source-error`. Loading emits once with `loading: true` and once with
`loading: false` for the active request. Errors contain a typed
`CalendarEventSourceError`. Static events and other source snapshots are not
removed when one source refreshes or fails.

Function sources use the same context and response contract:

```typescript
eventSources: [
  async ({ start, end, timeZone, signal }) => {
    return schedulingService.getEvents({
      start,
      end,
      timeZone,
      signal,
    });
  },
]
```

Source objects may provide `color`, `textColor`/`contrastColor`, `className` or
`classNames`, editing flags, `display`, `overlap`, `constraint`,
`defaultAllDay`, and per-source `success`/`failure` callbacks. Per-event values
take precedence over source defaults.

`lazyFetching` defaults to `true`. Each source keeps up to eight successful
range snapshots and reuses a containing range only for the same time zone and
view. Set `lazyFetching: false` globally or on one source to require every
navigation request. Explicit refetches and local mutations of source-owned
events invalidate affected snapshots, preventing an old cached response from
rolling back a live edit. Success details expose `cached`; `getEventSources()`
exposes each source's `cachedRangeCount` for diagnostics.

By default, multiple asynchronous sources commit independently but render as a
single batch after every source settles. Set `progressiveEventRendering: true`
to render each successful source immediately. `rerenderDelay` debounces rapid
event/API updates; delayed renders count as pending work, so `whenIdle()` does
not resolve until the DOM is current.

### Google Calendar source

Google Calendar support is an optional adapter and adds no code or dependency
to the standard entry. It reads public or OAuth-authorized Google calendars
through the Calendar API, paginates responses, expands Google recurring
instances, maps all-day and timed events, and honors cancellation and normal
source defaults.

```typescript
import { WtsCalendar } from '@wts-calendar/core';
import { googleCalendarPlugin } from '@wts-calendar/core/google-calendar';

const calendar = new WtsCalendar({
  container,
  plugins: [googleCalendarPlugin],
  googleCalendarApiKey: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY,
  eventSources: [{
    id: 'company-holidays',
    googleCalendarId: 'company-holidays@example.com',
    color: '#2563eb',
    textColor: '#ffffff',
  }],
});
```

For public calendars, the key must be allowed to call the Google Calendar API.
Restrict browser keys by site origin and API in Google Cloud.
`googleCalendarApiKey` can instead be supplied on an individual source.
The adapter sends public keys in the `X-Goog-Api-Key` request header, not in
the request URL. See the complete [credential safety guide](docs/CREDENTIALS.md).

For a private calendar in a browser-only application, load Google Identity
Services and create an in-memory connection. The package never persists the
token and never accepts an OAuth client secret or refresh token:

```html
<!-- Load GIS before the application module initializes the connection. -->
<script src="https://accounts.google.com/gsi/client"></script>
```

```typescript
import {
  createGoogleCalendarBrowserConnection,
  googleCalendarPlugin,
} from '@wts-calendar/core/google-calendar';

const googleConnection = createGoogleCalendarBrowserConnection({
  clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});

const googleSource = {
  id: 'my-google-calendar',
  googleCalendarId: 'primary',
  googleCalendarAccessToken: googleConnection.accessToken,
} as const;

const calendar = new WtsCalendar({
  container,
  plugins: [googleCalendarPlugin],
});

connectGoogleButton.addEventListener('click', async () => {
  // Keep this call directly inside a user gesture so the popup is not blocked.
  await googleConnection.connect();
  if (!calendar.getEventSources().some(({ id }) => id === googleSource.id)) {
    calendar.addEventSource(googleSource);
    await calendar.whenIdle();
  } else {
    await calendar.refetchEvents(googleSource.id);
  }
});

disconnectGoogleButton.addEventListener('click', async () => {
  calendar.removeEventSource(googleSource.id);
  await googleConnection.disconnect({ revoke: true });
});
```

Request the narrowest Google scope that satisfies the application. Read-only
display defaults to `calendar.events.readonly`. Browser-only authorization is
runtime-only: the user must be present, must reconnect after page reload, and
must click Connect again when the short-lived token expires. The calendar never
opens a consent popup during an automatic refresh. Offline/background sync is
intentionally unavailable without a backend.

## Async resource sources and persistence

`resourceSources` accepts inline arrays, loader functions, or REST source
objects and supports request/response adapters, authentication headers, record
transforms, retries, cancellation, filtering, and cursor or page-based
pagination. Direct resource operations remain independent; range navigation
and `refetchSources()` coordinate participating resource and event feeds.

```typescript
const calendar = new WtsCalendar({
  container,
  license,
  view: 'resource-time-grid-week',
  events,
  resourceSources: [{
    id: 'teams',
    url: '/api/calendar/resources',
    method: 'GET',
    request: {
      filters: { active: true },
      pageSize: 100,
    },
    requestAdapter: ({ start, end, request }) => ({
      active: request.filters?.active,
      cursor: request.cursor,
      limit: request.pageSize,
      scheduledFrom: start,
      scheduledTo: end,
    }),
    fetchOptions: async () => ({
      headers: {
        authorization: `Bearer ${await getAccessToken()}`,
      },
    }),
    responseAdapter: response => ({
      resources: response.data.teams,
      meta: response.data.summary,
      page: {
        nextCursor: response.data.nextCursor,
        hasMore: Boolean(response.data.nextCursor),
        total: response.data.total,
      },
    }),
    resourceDataTransform: team => ({
      id: team.teamId,
      parentId: team.departmentId,
      title: team.name,
      capacity: team.capacity,
      extendedProps: {
        role: team.role,
        location: team.location,
      },
    }),
    retries: 2,
    retryDelay: attempt => attempt * 500,
    refetchOnNavigation: false,
  }],
});
```

Without a `responseAdapter`, the endpoint may return a resource array directly
or this structured response:

```json
{
  "resources": [
    {
      "id": "design",
      "parentId": "delivery",
      "title": "Design team",
      "capacity": 6
    }
  ],
  "meta": {
    "filtered": true
  },
  "page": {
    "nextCursor": "team_101",
    "hasMore": true,
    "total": 240
  }
}
```

Source operations are:

- `addResourceSource(source)`
- `removeResourceSource(id)`
- `getResourceSources()`
- `refetchResources(sourceId?)`
- `refetchSources()`
- `loadMoreResources(sourceId)`

Loads emit `resource-source-loading`, `resource-source-success`, and
`resource-source-error`. Successful source snapshots are atomic; an invalid
or failed response leaves the previous snapshot visible. Removing or
refetching one source does not remove static resources or another source's
snapshot.

A remotely loaded resource may use a parent from its own source or from the
static `resources` array. Parent/child links cannot cross two different async
sources; keeping each hierarchy within one source prevents partial hierarchy
commits when independent endpoints refresh at different times.

The resource store also provides:

- `addResource(resource)`
- `setResources(resources)`
- `getResources()`
- `getResourceById(id)`
- `updateResource(id, changes)`
- `removeResource(id, options?)`

These mutations are optimistic and emit `add-resource`, `update-resource`,
`remove-resource`, or `resources-set`. The emitted
`CalendarResourceMutation` includes the new and previous resource state,
affected events, and an idempotent `revert()` method. Persistence remains
application-owned:

```typescript
async function saveResourceMutation(
  mutation: CalendarResourceMutation,
): Promise<void> {
  const resourceId =
    mutation.type === 'update' || mutation.type === 'remove'
      ? mutation.resource?.id ?? mutation.oldResource?.id
      : undefined;
  const url = resourceId
    ? `/api/calendar/resources/${encodeURIComponent(resourceId)}`
    : '/api/calendar/resources';
  const method = {
    add: 'POST',
    update: 'PATCH',
    remove: 'DELETE',
    set: 'PUT',
  }[mutation.type];
  const payload = mutation.type === 'set'
    ? { resources: mutation.resources }
    : mutation.resource;

  try {
    const response = await fetch(url, {
      method,
      headers: payload
        ? { 'content-type': 'application/json' }
        : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch {
    mutation.revert();
  }
}

for (const eventName of [
  'add-resource',
  'update-resource',
  'remove-resource',
  'resources-set',
] as const) {
  calendar.on(eventName, saveResourceMutation);
}
```

`resource-revert` reports a successful rollback. `removeResource` defaults to
rejecting removal when the resource owns child resources or assigned events.
Use explicit policies when the application intends a different result:

```typescript
calendar.removeResource('design', {
  children: 'promote',
  assignedEvents: 'unassign',
});
```

## Interaction transactions and rollback

Every committed user drag emits `event-drop`; every committed resize emits
`event-resize`, followed by `event-change`. The payload contains the optimistic
`event`, exact `oldEvent`, `relatedEvents`, `view`, `el`, `jsEvent`,
resource changes, duration deltas, and an idempotent `revert()` function.
Calling `revert()` restores the previous event only while that interaction is
still the latest mutation, so a delayed server failure cannot overwrite a
newer application update.

```typescript
calendar.on('event-drop', async ({ event, oldEvent, revert }) => {
  try {
    await saveEvent(event);
  } catch {
    revert();
  }
});
```

Lifecycle callbacks pair exactly once for every gesture that starts, including
cancelled gestures:

```typescript
const calendar = new WtsCalendar({
  container,
  editable: true,
  eventStartEditable: true,
  eventDurationEditable: true,
  eventResizableFromStart: true,
  eventResourceEditable: true,
  eventDragStart: ({ event, el, jsEvent, view }) => {},
  eventDragStop: ({ event, el, jsEvent, view }) => {},
  eventResizeStart: ({ event, el, jsEvent, view }) => {},
  eventResizeStop: ({ event, el, jsEvent, view }) => {},
  eventDrop: ({ event, oldEvent, delta, oldResource, newResource, revert }) => {},
  eventResize: ({ event, oldEvent, startDelta, endDelta, revert }) => {},
  eventChange: ({ event, oldEvent, type, revert }) => {},
  eventInteractionFailure: ({ transaction, reason, error }) => {},
});
```

`editable`, `eventStartEditable`, `eventDurationEditable`,
`eventResizableFromStart`, and `eventResourceEditable` can be overridden on an
individual event with `editable`, `startEditable`, `durationEditable`,
`resizableFromStart`, and `resourceEditable`. WTS keeps its historical defaults
(`editable: true`, start-edge resize enabled, and zero touch delay); set these
options explicitly when porting a FullCalendar configuration.

`eventConstraint` accepts `businessHours`, a `groupId`, a concrete date range,
or a recurring days/time window. `eventOverlap` accepts a boolean or predicate.
`eventAllow(dropInfo, draggedEvent)` is the final synchronous decision after
overlap and constraint evaluation.

For centralized constraints or server validation, provide
`interactionValidator`. Returning or resolving `false`, throwing, or rejecting
automatically reverts the interaction:

```typescript
const calendar = new WtsCalendar({
  container,
  events,
  interactionValidationTimeout: 15_000,
  interactionValidator: async ({ event, oldEvent, type }) => {
    const response = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event, oldEvent, type }),
    });
    return response.ok;
  },
});
```

Async handlers and validators time out after 30 seconds by default, producing
`CalendarInteractionTimeoutError` through `event-change-error` and reverting
the transaction. Configure `interactionValidationTimeout` in milliseconds, or
set it to `0` when the application owns timeout handling.

While asynchronous validation is pending, that event is rendered with
`data-calendar-pending="true"`, `aria-busy="true"`, and further drag/resize
gestures disabled. Lifecycle events are:

- `event-drop`
- `event-resize`
- `event-drag-start`
- `event-drag-stop`
- `event-resize-start`
- `event-resize-stop`
- `event-change`
- `event-interaction-failure`
- `event-change-pending`
- `event-revert`
- `event-change-error`
- `event-change-settled`

`event-change-settled` provides `{ transaction, accepted }`.
`event-change-error` provides `{ transaction, error }`. The existing
`update-event` callback remains backward compatible and fires once for the
optimistic user commit; rollback notifications use `event-revert`.

## Built-in interaction constraints

Use `interactionConstraints` for synchronous scheduling rules. These rules run
before `update-event`, `event-drop`/`event-resize`, and
`interactionValidator`. Invalid gestures therefore never mutate the event
store or enter the asynchronous pending state.

```typescript
const calendar = new WtsCalendar({
  container,
  resources: [
    { id: 'room-a', title: 'Room A', capacity: 4 },
  ],
  events: [
    {
      id: 'planning',
      title: 'Planning',
      start: '2026-08-03T10:00',
      end: '2026-08-03T11:00',
      resourceId: 'room-a',
      resourceUnits: 2,
    },
  ],
  interactionConstraints: {
    businessHours: [
      {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '17:00',
      },
      {
        daysOfWeek: [6],
        startTime: '10:00',
        endTime: '14:00',
        resourceIds: ['room-a'],
      },
    ],
    eventOverlap: false,
    overlapScope: 'resource',
    resourceCapacity: true,
  },
});
```

`businessHours: true` is shorthand for Monday-Friday from 09:00 through
17:00. Multiple intervals support split schedules. Times are wall-clock times
in the configured calendar time zone; `24:00` is accepted as an interval end.

When `eventOverlap` is false, `overlapScope: 'global'` compares all events and
`'resource'` compares events assigned to the same resource. Capacity checking
uses `CalendarResource.capacity` and the simultaneous sum of
`event.resourceUnits` (default 1).

Rejected interactions emit `event-constraint-violation` with
`{ transaction, result }`. `result.violations` contains typed
`business-hours`, `event-overlap`, or `resource-capacity` entries and any
conflicting events. The same result is available as
`transaction.constraintResult`. A rejected preflight transaction has
`state: 'reverted'`; `revert()` returns false because no mutation was applied.
`event-change-settled` then emits once with `accepted: false`.

## Calendar API

- `viewApi` / `getView()`
- `viewName` / legacy string-valued `view`
- `changeView(view, dateOrRange?)` / `setView(view, date?)`
- `setDate(date)`
- `gotoDate(date)`
- `incrementDate({ years, months, weeks, days, hours, minutes, ... })`
- `getOption(name)`
- `setOption(name, value)`
- `setOptions(changes)`
- `refetchSources()`
- `getDate()`
- `next()` / `prev()` / `previous()` / `today()`
- `nextYear()` / `prevYear()` / `previousYear()`
- `formatDate(date, format)` / `formatRange(start, end, format)` / `formatIso(date)`
- `scrollToTime('09:30')`
- `render()`
- `rerenderEvents()`
- `updateSize()`
- `batchRendering(callback)`
- `batchRenderingAsync(callback)`
- `whenIdle()`
- `destroy()`
- `destroyAsync()`

### View API and render lifecycle

`calendar.viewApi` and `calendar.getView()` return a new immutable descriptor
of the currently rendered view. `calendar.viewName` is its name. The existing
string-valued `calendar.view` remains as a compatibility alias so current WTS
applications are not silently broken.

```typescript
const calendar = new WtsCalendar({
  container,
  view: 'month',
  viewClassNames: ({ view }) => `calendar-view-${view.type}`,
  viewDidMount: ({ view, el }) => {
    console.log(view.title, view.activeStart, view.activeEnd, el);
  },
  viewWillUnmount: ({ view, el }) => {
    console.log(`Leaving ${view.type}`, el);
  },
  datesSet: ({ start, end, startStr, endStr, timeZone, view }) => {
    loadRange({ start, end, startStr, endStr, timeZone, view });
  },
});

const view = calendar.viewApi;
view.type;         // 'month'
view.title;        // localized toolbar title
view.activeStart;  // first rendered date
view.activeEnd;    // exclusive last rendered date
view.currentStart; // nominal interval start
view.currentEnd;   // exclusive nominal interval end
view.calendar === calendar;
```

`viewDidMount` and `viewWillUnmount` are paired exactly once around each view
root lifetime. A plain `render()` or `rerenderEvents()` does not remount the
view. Returned Promises are tracked by `pendingOperationCount`, `whenIdle()`,
and `destroyAsync()`. Rejections are isolated and reported without preventing
the remaining cleanup work.

`changeView(name, date)` switches view and date atomically. A named custom view
also accepts an explicit exclusive range:

```typescript
calendar.changeView('project-sprint', {
  start: '2026-08-03',
  end: '2026-08-17',
});
```

The `datesSet` range uses the actively rendered dates. For month view this
includes leading and trailing dates, while `view.currentStart/currentEnd`
describe the nominal month. Dates are defensive copies and cannot mutate
calendar state.

Always call `destroy()` when the owning application component unmounts.
`destroy()` is idempotent. Mutating, rendering, navigation, and subscription
methods called after destruction throw `CalendarLifecycleError`; inspect
`isDestroyed` when lifecycle ownership is shared. `lifecycleState` exposes
the explicit `initializing`, `ready`, `destroying`, `destroyed`, and `failed`
states. Construction is transactional: a failed view or plugin factory
restores the host DOM. Destruction is best-effort across every subsystem and
reports aggregated cleanup failures only after the remaining cleanup has run.
Render requests made by callbacks during an active render are coalesced into
bounded follow-up passes. A non-settling render loop or an option update whose
rollback also fails moves the instance to `failed` and performs full teardown
instead of leaving a partially usable calendar.

`events`, `view`, and `viewDate` are live, read-only snapshots of the current
core state. Toolbar navigation and event API calls are immediately reflected
by these properties. Mutating an array returned by `events` or `getEvents()`
does not add or remove calendar events; use the event API for those changes.
`option` returns a frozen snapshot, including frozen day/week view options, so
configuration cannot be changed accidentally without a supported API call.

`pendingOperationCount` reports the number of tracked source loads, async
interaction decisions, async callbacks, batch operations, and lifecycle
cleanups that have not settled. `whenIdle()` resolves only after those
operations and any resulting render work have settled. It does not reject
because an individual operation failed; operation-specific APIs and lifecycle
events continue to report those failures.

`destroy()` remains synchronous and immediately aborts sources, cancels
interactions, removes listeners, restores the host, and starts every registered
cleanup. Optional feature modules may return a Promise from `destroy()` or from
`lifecycle.addCleanup()`. Use `await calendar.destroyAsync()` when application
shutdown must wait for those asynchronous cleanups. `destroyAsync()` is
idempotent and rejects with `CalendarLifecycleError` containing an aggregated
cause only after all cleanup operations have settled.

### Dynamic options

Use `setOption()` for one runtime configuration change or `setOptions()` to
validate and commit several related changes atomically:

```typescript
const change = calendar.setOptions({
  view: 'week',
  viewDate: '2026-08-03',
  weekends: false,
  nowIndicator: true,
  weekView: {
    hourSegment: 30,
    segmentHeight: 36,
  },
});

calendar.on('option-change', ({ changedOptionNames }) => {
  console.log('Applied:', changedOptionNames);
});

// Safe only while this remains the latest option transaction.
change.revert();
```

The entire candidate configuration is validated before the DOM or active
calendar state changes. Invalid batches leave the calendar untouched.
Range-sensitive changes refetch event sources once and resource sources that
set `refetchOnNavigation: true`. Active interactions are cancelled, while
compatible selection, focus, scroll, and Resource Timeline expansion state are
preserved.

When both source types refetch, their event and resource responses are staged
together. The package validates the combined ownership snapshot and then
commits both with one render. A failure retains both previous snapshots.

Use `refetchSources()` when an application refreshes coordinated event and
resource feeds explicitly. It reloads every configured source and emits:

- `source-refresh-loading`
- `source-refresh-success`
- `source-refresh-error`

The aggregate context contains the transaction ID, visible range, view, time
zone, reason, and participating source IDs. Existing per-source
loading/success/error events remain available for source-level observability.
Starting a newer coordinated refresh aborts and invalidates the older
transaction, so late responses cannot commit.

Host/lifetime options (`container`, `document`, `license`, `styleUrl`, header
markup/classes), events, event sources, resources, and resource sources cannot
be replaced through `setOptions()`. Use the dedicated event/resource/source
APIs for data collections and create a new calendar instance to change its
host, license, or header structure.

Event titles, descriptions, and resource labels are rendered as text. Values
returned by `customHTML` and task `icon` fields are intentionally interpreted
as trusted HTML; never pass unsanitized user input to those APIs.

## Dates and time zones

Set `timeZone` to `local` (the default), `UTC`, or an IANA name such as
`America/New_York`. All calendar views, recurrence, navigation, and
interactions use the same Temporal-backed date policy.

```typescript
const calendar = new WtsCalendar({
  container,
  locale: 'en-US',
  timeZone: 'America/New_York',
  dateDisambiguation: 'compatible',
  viewDate: '2026-03-08',
  events: [
    {
      title: 'New York stand-up',
      start: '2026-03-08T09:00:00',
      end: '2026-03-08T09:30:00',
    },
  ],
});

calendar.on('dates-set', ({ start, end, startStr, endStr, view, timeZone }) => {
  loadVisibleRange({ start, end, startStr, endStr, view, timeZone });
});

calendar.incrementDate({ weeks: 1 });
calendar.scrollToTime('09:30');
```

Date values follow these rules:

- `Date` objects and strings with `Z` or a numeric offset represent instants.
- `YYYY-MM-DD` represents midnight on that calendar date in `timeZone`.
- Offsetless ISO date-times represent wall-clock values in `timeZone`.
- Calendar-day arithmetic preserves the wall-clock time across 23- and
  25-hour daylight-saving days.
- Day boundaries use an exclusive end: the end of March 8 is the start of
  March 9 in the configured zone.

Skipped or repeated wall-clock times use `dateDisambiguation`:
`compatible` (default), `earlier`, `later`, or `reject`. `compatible` follows
Temporal behavior by moving a skipped time forward and choosing the earlier
instant for a repeated time. Use `reject` when an application must require the
user to resolve an invalid or ambiguous wall time explicitly.

`CalendarDateAdapter` is exported for application-level parsing, formatting,
calendar arithmetic, and date-key generation using exactly the same rules as
the calendar:

```typescript
import { CalendarDateAdapter } from '@wts-calendar/core';

const dates = new CalendarDateAdapter('America/New_York', 'reject');
const start = dates.parse('2026-11-01T09:00:00');
const nextDay = dates.addCalendarDays(start, 1);
const key = dates.dateKey(nextDay);
```

Named-zone behavior uses the Temporal polyfill and the host runtime's IANA
time-zone data. Keep browsers and server runtimes updated when time-zone laws
change.

### Locales

`locale` controls `Intl` date text, locale week data, built-in toolbar labels,
all-day text, empty-list text, accessible button hints, and direction. It can
be changed at runtime. The old `localization` option remains as a deprecated
alias.

```typescript
const calendar = new WtsCalendar({
  container,
  locale: 'fr-FR',
  locales: [{
    code: 'fr-FR',
    firstDay: 1,
    buttonText: { next: 'Après', prev: 'Avant' },
    allDayText: 'Journée entière',
    noEventsText: 'Aucun rendez-vous',
  }],
});

calendar.setOption('locale', 'ar-EG'); // labels, week start, and RTL update
```

Built-in calendar-owned text is included for English, French, Spanish,
German, Portuguese, Arabic, Hebrew, Japanese, Chinese, and Hindi. Region and
calendar-specific date formatting continues to come from `Intl`. An explicit
`startOfWeek` or `direction` always takes precedence over locale metadata and
continues to do so after runtime locale changes.

Standalone `formatDate`, `formatRange`, and `formatIso` exports accept locale
and time-zone overrides without constructing a calendar. The instance methods
default to the calendar's active locale and time zone.

## Browser interaction tests

The browser suite imports the built package artifact directly and covers
month, day, week, and resource interactions in Chromium, Firefox, and WebKit,
plus native touch dragging in Chromium. Its DST cases verify skipped and
repeated New York wall-clock times, Escape cancellation, outside release, and
exactly one `update-event` callback per committed gesture. Axe checks enforce
WCAG A/AA rules for every primary view across all three desktop engines.

```bash
npm run test:browser:install
npm run test:browser
```

CI runs the same suite through
`.github/workflows/wts-calendar-browser.yml`.

## Recurrence

The package supports both the original object-based recurrence API and RFC
5545 RRULE strings. The original API provides daily, weekly, monthly, and
annual rules with `interval`, date bounds, times, and weekday exclusions.

```typescript
calendar.addEvent({
  id: 'fortnightly-sync',
  title: 'Fortnightly sync',
  start: '2026-08-03T09:00:00',
  recurring: {
    frequency: 'weekly',
    interval: 2,
    daysOfWeek: [1],
    startTime: '09:00',
    endTime: '10:00',
    endDate: '2026-12-31',
  },
});
```

Use `rrule` for advanced schedules such as nth/last weekdays, `COUNT`,
`UNTIL`, and multiple occurrences per day. `rdate` adds individual
occurrences and `exdate` removes them; exclusions always take precedence.
`start` is the recurrence DTSTART, while `end` or `duration` determines each
occurrence's duration.

```typescript
import { rrulePlugin } from '@wts-calendar/core/rrule';

const calendar = new WtsCalendar({
  container,
  plugins: [rrulePlugin],
});

calendar.addEvent({
  id: 'billing-review',
  title: 'Billing review',
  start: '2026-08-03T09:00:00',
  end: '2026-08-03T10:00:00',
  rrule: 'FREQ=MONTHLY;BYDAY=-1MO;COUNT=12',
  rdate: ['2026-12-21'],
  exdate: ['2026-11-30'],
});
```

Rendering recurrence never changes the source event returned by
`getEvents()`. A rendered occurrence has a deterministic `uuid`, the source
series identifier in `recurrenceId`, and its zoned calendar date in
`occurrenceDate` and `occurrenceDateKey`. `occurrenceKey` additionally
distinguishes multiple instances on the same date. Recurrence times retain
their configured wall-clock value when the UTC offset changes at a
daylight-saving boundary.

Generated occurrences remain read-only for direct drag and resize. Use the
explicit occurrence-versus-series APIs so an application cannot silently
modify the wrong scope:

```typescript
calendar.updateRecurringEvent(
  'billing-review',
  { start: '2026-09-28T11:00:00', title: 'Rescheduled billing review' },
  { occurrence: '2026-09-28T09:00:00' },
);

calendar.removeRecurringEvent(
  'billing-review',
  { occurrence: '2026-10-26T09:00:00' },
);

calendar.updateRecurringEvent(
  'billing-review',
  { color: '#6d4aff' },
  { scope: 'series' },
);
```

RRULE values are evaluated as wall-clock schedules in the configured calendar
time zone. An embedded `DTSTART` line is intentionally ignored in favor of
the event's typed `start` value, keeping all recurrence and ordinary event
date handling under the same DST/disambiguation policy. Expansion is capped
at 1,000 occurrences per event per calendar day to reject accidental or
hostile high-frequency rules before they overwhelm a view.

## iCalendar (`.ics`) import and export

Import RFC 5545 `VCALENDAR` text directly into a calendar. The default mode
appends validated events; `mode: 'replace'` validates the complete file before
atomically replacing the static event store.

```typescript
import { icalendarPlugin } from '@wts-calendar/core/icalendar';

const calendar = new WtsCalendar({
  container,
  plugins: [icalendarPlugin],
});

const response = await fetch('/feeds/team-calendar.ics');
const result = calendar.importICalendar(await response.text(), {
  mode: 'append',
  invalidEventPolicy: 'reject-calendar',
  eventDataTransform: (event) => ({
    ...event,
    color: event.color ?? '#2563a9',
  }),
});

console.log(result.events.length, result.calendarName);
```

`DTSTART`, exclusive `DTEND`, `DURATION`, all-day values, UTC, floating
date-times, `TZID`, RRULE, RDATE, EXDATE, and `RECURRENCE-ID` exceptions are
mapped to the package event model. Cancelled exceptions suppress an
occurrence; changed exceptions populate `recurrenceOverrides`. Imported named
time zones are retained in `recurrenceTimeZone`, so recurring wall times
remain stable across DST even when the calendar displays another time zone.

Standard `LOCATION`, `STATUS`, `URL`, `ORGANIZER`, `SEQUENCE`, and `CATEGORIES`
values are preserved under `event.meta.ical`. Package-specific resource,
group, display, and capacity values round-trip through `X-WTS-*` properties.
Use `eventDataTransform` to map provider-specific data or return `null` to
skip an event intentionally. With `invalidEventPolicy: 'skip'`, malformed
events are reported in `skippedEvents`; the default rejects the entire
calendar.

Export the current event store as folded, escaped CRLF-delimited `.ics`
content:

```typescript
const ics = calendar.exportICalendar({
  calendarName: 'Delivery schedule',
  prodId: '-//Example Inc//Delivery Calendar//EN',
  method: 'PUBLISH',
});

const download = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
```

Standalone `parseICalendar(source, options)` and
`serializeICalendar(events, options)` functions are exported from
`@wts-calendar/core/icalendar`. The parser limits input to 5,000,000 characters
and 10,000 `VEVENT` components; the serializer applies the same event cap.
The Web Component exposes matching `importICalendar()` and
`exportICalendar()` methods when `icalendarPlugin` is supplied through its
`options` property, and dispatches `icalendar-import` after a successful store
mutation.

## Web Component

Register the standards-based adapter once, then use it from plain HTML or any
framework that supports custom elements:

```typescript
import {
  defineWtsCalendarElement,
  type WtsCalendarElement,
} from '@wts-calendar/core/web-component';

defineWtsCalendarElement();

const calendar = document.querySelector<WtsCalendarElement>('wts-calendar');

if (calendar) {
  calendar.events = [
    {
      id: 'planning',
      title: 'Planning',
      start: '2026-08-04T10:00:00',
      end: '2026-08-04T11:00:00',
    },
  ];

  calendar.addEventListener('event-click', (event) => {
    console.log(event.detail);
  });
}
```

```html
<wts-calendar
  view="month"
  view-date="2026-08-03"
  locale="en-US"
  time-zone="America/New_York"
  date-disambiguation="compatible"
  start-of-week="1"
></wts-calendar>
```

The element supports `view`, `view-date`, `locale`, `time-zone`,
`date-disambiguation`, `start-of-week`, `hide-header`, and `style-url`
attributes. Use the `events`, `resources`, `tasks`, or `options` properties for
complex data. Calendar callbacks are forwarded as bubbling, composed native
`CustomEvent`s. Removing the element automatically destroys the calendar
instance. Dynamic attributes update the connected instance transactionally;
immutable construction attributes recreate it. Disconnect/reconnect preserves
runtime event, resource, task, view, and dynamic-option state when those
collections are not owned by remote sources.

See [ROADMAP.md](./ROADMAP.md) for the production-hardening plan.
