export const REPOSITORY = 'https://github.com/Suman201/wts-calendar-angular-example';
export const DOCS_ROOT =
  'https://github.com/wts-calendar/wts-calendar.github.io/blob/wts/source/package-docs/';
export const DOCS_BASE = DOCS_ROOT + 'core/';
// Set only to the owner's confirmed public licensing contact.
export const PREMIUM_CONTACT_EMAIL: string = 'suman.mandal@webskitters.com';
export const LICENSE_REQUEST = PREMIUM_CONTACT_EMAIL
  ? 'mailto:' + PREMIUM_CONTACT_EMAIL + '?subject=WTS%20Calendar%20premium%20license%20request'
  : '';
export const PREMIUM_PREVIEWS: Readonly<Record<string, { src: string; alt: string }>> = {
  'Resources & planning': {
    src: 'previews/premium/resource-non-resource-timeline.jpg',
    alt: 'Screenshot of the actual WTS Calendar resource timeline with sample assignments',
  },
  'Premium interoperability': {
    src: 'previews/premium/ics-change-detection-reconciliation.jpg',
    alt: 'Actual ICS comparison API results displayed in an application-owned capture table',
  },
  'Enterprise workflow': {
    src: 'previews/premium/multi-stage-approvals.jpg',
    alt: 'Actual approval API results displayed in an application-owned capture table',
  },
};
export interface Demo {
  id: string;
  title: string;
  group: string;
  view: string;
  description: string;
}
export const LIST_VIEWS = ['list-day', 'list-week', 'list-month', 'list-year'] as const;
export const DEMOS: readonly Demo[] = [
  [
    'month',
    'Month',
    'Views',
    'month',
    'A familiar month grid with timed events, multi-day events, and overflow links.',
  ],
  [
    'day-grid-week',
    'DayGrid week',
    'Views',
    'day-grid-week',
    'A week at a glance without hourly slots.',
  ],
  [
    'day-grid-day',
    'DayGrid day',
    'Views',
    'day-grid-day',
    'A focused day layout for all-day and timed events.',
  ],
  [
    'time-grid-week',
    'TimeGrid week',
    'Views',
    'week',
    'An hourly week with all-day events and overlapping appointments.',
  ],
  [
    'time-grid-day',
    'TimeGrid day',
    'Views',
    'day',
    'A detailed daily schedule with configurable time slots.',
  ],
  ['multi-month', 'Multi-month', 'Views', 'multi-month', 'Three months in a responsive grid.'],
  ['year', 'Year', 'Views', 'year', 'A full year for a longer-term perspective.'],
  [
    'list',
    'List',
    'Views',
    'list-week',
    'A chronological agenda. Switch between day, week, month, and year in the calendar header.',
  ],
  [
    'custom-view',
    'Custom date range',
    'Views',
    'work-week',
    'A named five-day view with its own duration and navigation step.',
  ],
  [
    'recurrence',
    'Recurring events',
    'Events & data',
    'month',
    'A repeating weekly team meeting alongside individual events.',
  ],
  [
    'rrule',
    'RRULE & exclusions',
    'Events & data',
    'month',
    'Monday and Wednesday sessions using an RFC recurrence rule and an excluded date.',
  ],
  [
    'ics',
    'iCalendar import / export',
    'Events & data',
    'month',
    'Import a safe sample ICS event, then download the current calendar as an ICS file.',
  ],
  [
    'event-sources',
    'Sources & caching',
    'Events & data',
    'month',
    'An in-memory async loader, request counter, lazy fetching, and explicit refresh. No backend required.',
  ],
  [
    'event-editor',
    'Event editor & history',
    'Interaction',
    'week',
    'Create, edit, duplicate, or delete an event in the built-in editor. Undo and redo changes.',
  ],
  [
    'interactions',
    'Drag, resize & select',
    'Interaction',
    'week',
    'Switch between month, week, and day to move or resize events, select dates or times, and inspect callback activity.',
  ],
  [
    'constraints',
    'Business hours',
    'Interaction',
    'week',
    'Weekday scheduling from 09:00 to 17:00 with business-hour constraints and overlap prevention.',
  ],
  [
    'background',
    'Background events',
    'Customization',
    'week',
    'Shade a time range and compare month, week, and day grids using the calendar header.',
  ],
  [
    'themes',
    'Themes & appearance',
    'Customization',
    'month',
    'Compare themes, color schemes, and weekend visibility across month, week, day, and list views.',
  ],
  [
    'time-zones',
    'Time zones',
    'Customization',
    'week',
    'Search browser-supported time zones and compare the same events across month, week, day, and list views.',
  ],
  [
    'locale-rtl',
    'Localization & RTL',
    'Customization',
    'month',
    'Search languages and date locales, then compare month, week, day, and list views with automatic text direction.',
  ],
  [
    'render-hooks',
    'Event render hooks',
    'Customization',
    'month',
    'Customize event content and observe mount and unmount callbacks as you switch month, week, day, and list views.',
  ],
  [
    'accessibility',
    'Keyboard & print',
    'Customization',
    'month',
    'Explore keyboard focus, event activation, and printing across month, week, day, and list views.',
  ],
].map(([id, title, group, view, description]) => ({ id, title, group, view, description }));

export interface Feature {
  id: string;
  title: string;
  description: string;
  group: string;
  tier: 'Free' | 'Premium';
  demo?: string;
  guide?: string;
}
function entries(
  group: string,
  tier: Feature['tier'],
  rows: readonly (readonly string[])[],
): Feature[] {
  return rows.map(([title, description, demo, guide]) => ({
    id: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-$/, ''),
    title,
    description,
    group,
    tier,
    ...(tier === 'Free' ? { demo: demo || undefined, guide: guide || 'docs/API.md' } : {}),
  }));
}
export const FEATURES: readonly Feature[] = [
  ...entries('Views & layouts', 'Free', [
    ['Month DayGrid', 'Multi-day events, adjacent dates, and event overflow.', 'month'],
    ['DayGrid week & day', 'Week and day layouts without hourly slots.', 'day-grid-week'],
    [
      'TimeGrid week & day',
      'Hourly slots, overlapping events, and an all-day row.',
      'time-grid-week',
    ],
    ['Multi-month & year', 'Responsive multi-month and annual grids.', 'multi-month'],
    ['Agenda & list views', 'Day, week, month, year, and custom-range lists.', 'list'],
    [
      'Named custom views',
      'Configure view duration, alignment, and navigation increments.',
      'custom-view',
    ],
  ]),
  ...entries('Events & data', 'Free', [
    [
      'Event CRUD API',
      'Stable IDs and create, update, remove, and batch operations.',
      'event-editor',
    ],
    [
      'Array, function & URL sources',
      'Load events directly or through customer-controlled data sources.',
      'event-sources',
    ],
    [
      'Google Calendar source',
      'Read public or authorized calendars with the optional source adapter.',
      '',
      'docs/CREDENTIALS.md',
    ],
    ['iCalendar import & export', 'Parse and serialize ICS data with an optional plugin.', 'ics'],
    [
      'Simple recurring events',
      'Weekly recurrence, exclusions, and occurrence editing.',
      'recurrence',
    ],
    ['RFC RRULE recurrence', 'Rules, recurrence sets, additional dates, and exceptions.', 'rrule'],
    [
      'Time zones & DST',
      'Local, UTC, and IANA time zones with date-adapter handling.',
      'time-zones',
    ],
    [
      'Event display & ordering',
      'Foreground, background, inverse, hidden, and ordered events.',
      'background',
    ],
    [
      'Lazy fetching & caching',
      'Bounded range reuse, invalidation, and explicit refresh.',
      'event-sources',
    ],
    ['Source paging & errors', 'Pagination, cancellation, retry, and validation contracts.'],
    [
      'Coordinated source refresh',
      'Refresh multiple sources with lifecycle tracking.',
      'event-sources',
    ],
    [
      'Occurrence & series edits',
      'Apply changes to one occurrence or a recurring series.',
      '',
      'docs/EVENT-EDITOR.md',
    ],
  ]),
  ...entries('Interaction', 'Free', [
    [
      'Date, event & hover callbacks',
      'Typed date clicks, event clicks, and hover lifecycle.',
      'month',
    ],
    ['Date & time selection', 'Select ranges with constraints and cancellation.', 'interactions'],
    [
      'Event dragging',
      'Move events with pointer, touch, or supported keyboard controls.',
      'interactions',
    ],
    ['Event resizing', 'Adjust event boundaries with validation and rollback.', 'interactions'],
    ['External dragging', 'Turn external elements into draggable event sources.'],
    ['Cross-calendar transfer', 'Copy or move events with receive and leave callbacks.'],
    [
      'Touch interactions',
      'Long press, movement thresholds, and scroll cancellation.',
      'interactions',
    ],
    [
      'Keyboard interactions',
      'Navigation, activation, editing, and Escape cancellation.',
      'accessibility',
    ],
    ['Async validation & rollback', 'Pending, accepted, rejected, error, and revert states.'],
    [
      'Business hours & constraints',
      'Availability windows, overlap policies, and allow callbacks.',
      'constraints',
    ],
    ['Undo, redo & transactions', 'Reversible event mutations with history state.', 'event-editor'],
    ['Overflow popovers', 'Accessible overflow controls and dismissible event lists.', 'month'],
  ]),
  ...entries('Customization', 'Free', [
    ['Declarative toolbar', 'Compose navigation, title, view, and custom controls.'],
    ['Sizing & sticky regions', 'Height, aspect ratio, expansion, and sticky elements.'],
    ['Themes & color schemes', 'Built-in themes with light, dark, and automatic modes.', 'themes'],
    ['Event render hooks', 'Classes, content, mount, and unmount callbacks.', 'render-hooks'],
    ['Day, header & slot hooks', 'Customize calendar cells and time-axis surfaces.'],
    ['Popover & indicator hooks', 'Customize overflow, popover, and now-indicator surfaces.'],
    ['View & toolbar lifecycle', 'Typed view descriptors and structural hooks.', 'render-hooks'],
    [
      'Localization & RTL',
      'Locale text, date formatting, week rules, and direction.',
      'locale-rtl',
    ],
    ['Hidden days & weekends', 'Control visible weekdays and weekend display.', 'themes'],
    [
      'Moment / Luxon formatting',
      'Optional formatting plugins for existing date libraries. Migration tooling is premium.',
      '',
      'docs/CONFIGURATION.md',
    ],
  ]),
  ...entries('Resources & planning', 'Premium', [
    ['Resource grid', 'Organize events into resource lanes.'],
    ['Resource DayGrid', 'Day and week grids grouped by resource.'],
    ['Resource TimeGrid', 'Hourly day and week schedules with resource columns.'],
    ['Resource & non-resource timeline', 'Horizontal scheduling along a configurable time axis.'],
    ['Dates above resources', 'Choose the date and resource header arrangement.'],
    ['Resource CRUD & sources', 'Manage resource records, loading, and pagination.'],
    ['Resource hierarchy', 'Parent-child resources with expandable groups.'],
    [
      'Resource grouping, ordering & filtering',
      'Organize resources with fields, comparators, and nested groups.',
    ],
    [
      'Resource columns & render hooks',
      'Resizable columns and resource-specific content and lifecycle hooks.',
    ],
    ['Resource availability & assignment', 'Per-resource hours and assignment validation.'],
    ['Capacity, skills & roles', 'Weighted capacity and declarative scheduling requirements.'],
    ['Resource virtualization & print', 'Large scheduling surfaces and print layouts.'],
    ['Repeated-task views', 'Monthly and weekly repeated-task schedules.'],
    ['Utilization & capacity heatmaps', 'Expose resource usage and available capacity.'],
    ['Split shifts & rotating schedules', 'Model shift segments and repeating rotations.'],
    [
      'Resource dependencies & substitutes',
      'Describe dependent resources and replacement choices.',
    ],
    ['Overbooking policies', 'Configure and evaluate resource overbooking rules.'],
    ['Demand & availability forecasting', 'Compare planned demand with modeled availability.'],
    ['Dependencies & critical paths', 'Analyze task dependencies and critical-path indicators.'],
  ]),
  ...entries('Premium interoperability', 'Premium', [
    [
      'Two-way Google Calendar synchronization',
      'Reconcile changes with Google Calendar through customer-authorized adapters.',
    ],
    [
      'Microsoft 365 / Outlook adapter',
      'Integrate Microsoft calendars with customer-managed authentication.',
    ],
    ['CalDAV adapter', 'Connect compatible CalDAV services through an adapter.'],
    ['ICS change detection & reconciliation', 'Detect and reconcile feed changes.'],
    [
      'Moment / Luxon migration toolkit',
      'Translate legacy formatting configuration with migration diagnostics.',
    ],
    [
      'Configuration migration assistant',
      'Convert supported legacy options and flag changes that need manual migration.',
    ],
  ]),
  ...entries('Enterprise workflow', 'Premium', [
    ['Multi-stage approvals', 'Compose approval stages through workflow hooks.'],
    ['Configurable event state machines', 'Model allowed event states and transitions.'],
    [
      'Immutable audit history',
      'Create immutable audit snapshots; durable storage remains customer-managed.',
    ],
    [
      'Permissions & field-level policies',
      'Apply editing policies; enforce authoritative access in your backend.',
    ],
    [
      'Optimistic / offline mutation queues',
      'Queue and reconcile mutations with customer-provided persistence.',
    ],
    [
      'Existing-backend interfaces',
      'Connect workflow adapters to your organization’s infrastructure.',
    ],
  ]),
  ...entries('Developer experience', 'Free', [
    ['Strict TypeScript contracts', 'Typed options, events, plugins, adapters, and callbacks.'],
    [
      'ESM / CJS & optional entry points',
      'Import the modules your application needs.',
      '',
      'docs/PACKAGE-STRUCTURE.md',
    ],
    [
      'Third-party plugin SDK',
      'Create plugins with views, dependencies, actions, and scoped cleanup.',
      '',
      'docs/PLUGIN-SDK.md',
    ],
    [
      'Plugin conformance tooling',
      'Validate packaged plugin compatibility.',
      '',
      'docs/PLUGIN-SDK.md',
    ],
    ['Angular wrapper', 'Standalone component, typed inputs, and a calendar controller.', 'month'],
    ['React wrapper', 'React component with ref-based API access.', '', 'README.md'],
    ['Vue wrapper', 'Vue component with reactive options and API access.', '', 'README.md'],
    ['Web Component', 'Use a custom element outside a framework.', '', 'README.md'],
    [
      'React Native wrapper',
      'Android/iOS integration package. Device validation is a separate step.',
      '',
      'README.md',
    ],
    [
      'Built-in event editor',
      'Create, edit, duplicate, and delete without building a form from scratch.',
      'event-editor',
    ],
    [
      'Developer tools',
      'Diagnostics and runtime inspection utilities.',
      '',
      'docs/DEVELOPER-TOOLS.md',
    ],
    [
      'Testing toolkit',
      'Deterministic data and calendar testing helpers.',
      '',
      'docs/TESTING-TOOLKIT.md',
    ],
    [
      'Data adapter SDK',
      'Typed contracts for customer-controlled data integration.',
      '',
      'docs/DATA-ADAPTER-SDK.md',
    ],
    ['Lifecycle & batching', 'Batch updates, await idle state, and clean up resources.'],
    [
      'SSR-safe adapter imports',
      'Import adapters safely; the web calendar mounts in the browser.',
      '',
      'README.md',
    ],
  ]),
  ...entries('Accessibility & delivery', 'Free', [
    [
      'Semantic structure & labels',
      'Calendar landmarks, accessible names, and state labels.',
      'accessibility',
    ],
    [
      'Focus management & live feedback',
      'Keyboard focus recovery and interaction announcements.',
      'accessibility',
    ],
    [
      'Pointer & touch alternatives',
      'Keyboard operations supplement pointer interaction.',
      'accessibility',
    ],
    [
      'Print-friendly rendering',
      'Print standard calendar views from the browser.',
      'accessibility',
    ],
    [
      'Accessibility guidance',
      'Integration guidance and automated coverage; not a substitute for manual assistive-technology checks.',
      '',
      'docs/ACCESSIBILITY.md',
    ],
    [
      'Browser & lifecycle test guidance',
      'Documented test coverage and consumer validation procedures.',
      '',
      'docs/CONSUMER-VALIDATION.md',
    ],
    [
      'Security & credential guidance',
      'Keep provider credentials, tokens, and customer data out of public demos.',
      '',
      'docs/CREDENTIALS.md',
    ],
    [
      'Migration & troubleshooting',
      'Configuration mapping, integration guidance, and issue diagnosis.',
      '',
      'docs/MIGRATION.md',
    ],
  ]),
];
export const FEATURE_GROUPS = [...new Set(FEATURES.map((feature) => feature.group))];
export const PREMIUM_FEATURES = FEATURES.filter((feature) => feature.tier === 'Premium');
export const PREMIUM_GROUPS = [...new Set(PREMIUM_FEATURES.map((feature) => feature.group))].map(
  (name) => ({ name, features: PREMIUM_FEATURES.filter((feature) => feature.group === name) }),
);
