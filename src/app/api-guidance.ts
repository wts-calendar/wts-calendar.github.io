// Editorial guidance complements, but never replaces, the generated signatures.
export interface ApiGuide {
  description?: string;
  defaultValue?: string;
  value?: string;
  note?: string;
  demo?: string;
}

// Checked by a runtime test against the portal's installed core release.
export const VERIFIED_DEFAULTS = {
  view: 'month',
  colorScheme: 'light',
  theme: 'standard',
  buttonDisplay: 'text',
  headingLevel: 2,
  allDaySlot: true,
  allDayText: 'All day',
  slotEventOverlap: false,
  eventMaxStack: false,
  eventMinHeight: 18,
  weekNumbers: false,
  weekNumberCalculation: 'local',
  navLinks: false,
  editable: true,
  eventResizableFromStart: true,
  eventDragMinDistance: 5,
  eventLongPressDelay: 0,
  dragRevertDuration: 500,
  dragScroll: true,
  allDayMaintainDuration: false,
  eventOverlap: true,
  expandRows: false,
  tableHeaderSticky: 'auto',
  footerScrollbarSticky: 'auto',
  hideHeader: false,
  timeZone: 'local',
  dateDisambiguation: 'compatible',
} as const;

export const OPTION_GUIDES: Record<string, ApiGuide> = {
  container: {
    description:
      'The existing DOM element into which the calendar mounts. Framework wrappers supply this element for you.',
    value: "document.querySelector<HTMLElement>('#calendar')!",
    note: 'Create the element before constructing the calendar. Destroy the instance before removing its host.',
    defaultValue: 'Required for direct JavaScript construction.',
  },
  document: {
    description:
      'DOM document used to create calendar elements. Useful when mounting into another document, such as an iframe.',
    value: 'document',
    note: 'Use the same document that owns the container.',
  },
  view: {
    description:
      'The layout displayed by the calendar. Use a built-in name or a name registered in views.',
    defaultValue: "'month'",
    value: "'month'",
    demo: 'month',
    note: 'Week/day TimeGrid, list, multi-month, and Premium layouts require their corresponding modules. A view name alone does not load a module.',
  },
  viewDate: {
    description:
      'The date used to choose the initially visible calendar range. Set this together with sample events so they appear in the current view.',
    value: "'2026-09-07'",
    demo: 'month',
  },
  events: {
    description:
      'Initial event data. Each event needs a title and start; give it a stable id when you need to look it up or update it.',
    value:
      "[{ id: 'meeting', title: 'Team planning', start: '2026-09-07T10:00:00', end: '2026-09-07T11:00:00' }]",
    note: 'Use setEvents to replace data after construction, or addEvent/updateEvent/removeEvent for individual changes. These changes do not persist to a server automatically.',
    demo: 'event-editor',
  },
  eventSources: {
    description:
      'Initial range-aware event sources. Use these when data should load as the visible date range changes.',
    note: 'Open CalendarEventSource below for accepted source shapes. Use addEventSource/removeEventSource/refetchEvents after construction.',
    demo: 'event-sources',
  },
  dayView: {
    description:
      'TimeGrid day layout and interaction settings. Expand the property table for slot height, time range, and interaction tolerances.',
    value: '{ hourSegment: 30, segmentHeight: 40 }',
    note: 'Requires timeGridModule. An explicit hourSegment takes precedence over slotDuration.',
    demo: 'time-grid-day',
  },
  weekView: {
    description:
      'TimeGrid week layout and interaction settings. Configure slot duration and height independently of the day view.',
    value: '{ hourSegment: 30, segmentHeight: 40 }',
    note: 'Requires timeGridModule. An explicit hourSegment takes precedence over slotDuration.',
    demo: 'time-grid-week',
  },
  dateClick: {
    defaultValue: 'No application callback is registered.',
    value: '(info) => { console.log(info.dateStr, info.allDay); }',
    note: 'This is a cell-activation callback, not a committed range selection. Use select for ranges. Open CalendarDateClickInfo below for all callback fields.',
    demo: 'event-editor',
  },
  eventClick: {
    defaultValue: 'No application callback is registered.',
    value: '(info) => { console.log(info.event.id, info.event.title); }',
    note: 'event is the event data, el is its rendered DOM element, jsEvent is the native mouse event, and view is the active view name. Your callback can open application UI; it does not save edits automatically.',
    demo: 'event-editor',
  },
  datesSet: {
    value: '(info) => { console.log(info); }',
    note: 'Runs for the initial range as well as navigation. Avoid unconditionally navigating again inside this callback.',
  },
  eventChange: {
    description:
      'Receives an interaction transaction when an event change is reported. Inspect its typed fields before connecting your persistence layer.',
    value: '(transaction) => { console.log(transaction); }',
    demo: 'interactions',
  },
  eventDrop: {
    description:
      'Receives the transaction for a drag-and-drop event move. Use its typed fields to inspect the change.',
    value: '(transaction) => { console.log(transaction); }',
    demo: 'interactions',
  },
  eventResize: {
    description: 'Receives the transaction for an event duration resize.',
    value: '(transaction) => { console.log(transaction); }',
    demo: 'interactions',
  },
  eventDragStart: {
    description: 'Observes the start of an event drag gesture.',
    value: '(info) => { console.log(info); }',
    demo: 'interactions',
  },
  eventDragStop: {
    description:
      'Observes the end of an event drag gesture. Do not treat the gesture ending as proof that a mutation was accepted.',
    value: '(info) => { console.log(info); }',
    demo: 'interactions',
  },
  eventResizeStart: {
    description: 'Observes the start of an event resize gesture.',
    value: '(info) => { console.log(info); }',
    demo: 'interactions',
  },
  eventResizeStop: {
    description:
      'Observes the end of a resize gesture. Inspect the mutation result separately when persisting changes.',
    value: '(info) => { console.log(info); }',
    demo: 'interactions',
  },
  eventInteractionFailure: {
    description:
      'Observes a failed calendar interaction so the application can explain or log the failure.',
    value: '(info) => { console.log(info); }',
  },
  selection: {
    description:
      'Additional range-selection configuration. Open CalendarSelectionOptions for supported fields.',
    demo: 'interactions',
  },
  selectable: {
    value: 'true',
    note: 'Load interactionModule for interactive selection. Use select to receive a committed range.',
    demo: 'interactions',
  },
  select: {
    value: '(range) => { console.log(range); }',
    note: 'Inspect CalendarSelection for start/end values and resource context. Selection alone does not persist a new event.',
    demo: 'event-editor',
  },
  editable: {
    value: 'true',
    note: 'Load interactionModule. This controls event interactions; the event editor dialog is a separate optional module.',
    demo: 'interactions',
  },
  height: {
    value: '600',
    note: 'Numbers represent pixels. Use auto for content-driven height. This includes the toolbar; contentHeight only controls the view body.',
    demo: 'themes',
  },
  contentHeight: { value: '500', demo: 'themes' },
  colorScheme: { defaultValue: "'light'", value: "'dark'", demo: 'themes' },
  theme: { defaultValue: "'standard'", value: "'standard'", demo: 'themes' },
  locale: {
    value: "'bn'",
    note: 'Locale affects date formatting. Load a matching locale pack when you need translated package UI labels.',
    demo: 'locale-rtl',
  },
  localization: {
    description: 'Compatibility name for locale. Prefer locale in new integrations.',
    value: "'bn'",
    demo: 'locale-rtl',
  },
  timeZone: {
    value: "'Asia/Kolkata'",
    note: 'Use an IANA identifier, local, or UTC. An offset-aware event timestamp represents an instant; an offset-free timestamp needs a wall-clock interpretation.',
    demo: 'time-zones',
  },
  direction: { value: "'rtl'", demo: 'locale-rtl' },
  startOfWeek: {
    value: '1',
    note: 'Sunday is 0; Monday is 1. When omitted, locale week data determines the first day.',
    demo: 'locale-rtl',
  },
  dayMaxEvents: { value: '3', demo: 'month' },
  weekends: { value: 'false', demo: 'month' },
  slotDuration: {
    value: '30',
    note: 'Load timeGridModule. Explicit dayView.hourSegment/weekView.hourSegment overrides this setting.',
    demo: 'time-grid-week',
  },
  slotMinTime: { value: "'08:00'", demo: 'time-grid-week' },
  slotMaxTime: { value: "'18:00'", demo: 'time-grid-week' },
  scrollTime: { value: "'09:00'", demo: 'time-grid-week' },
  businessHours: {
    value: '{ daysOfWeek: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "17:00" }',
    note: 'Visual business-hour shading is not an authorization policy. Configure selection/mutation constraints separately.',
    demo: 'business-hours',
  },
  headerToolbar: {
    value: "{ left: 'prev,next today', center: 'title', right: 'month,week,day' }",
    note: 'Load modules for every view button you expose. A toolbar label does not register a view engine.',
    demo: 'interactions',
  },
  buttonText: { value: "{ today: 'Today', month: 'Month' }", demo: 'themes' },
  eventContent: {
    value: '(info) => info.event.title',
    note: 'Strings are text, not HTML. Return a DOM node only when you own and safely construct that node.',
    demo: 'render-hooks',
  },
  eventHistory: { value: '{ limit: 50 }', demo: 'event-editor' },
  resources: {
    description:
      'Initial resource records used by Premium resource views. Events refer to resources by their identifiers.',
    note: 'Use setResources/addResource/updateResource after construction. A valid Premium entitlement and the resource-scheduling module are required.',
  },
  resourceSources: {
    description:
      'Initial range-aware resource providers. Open CalendarResourceSource for loader and source configuration.',
    note: 'Use addResourceSource/removeResourceSource/refetchResources after construction.',
  },
  task: {
    description:
      'Initial task category data for repeated-task layouts. Open TaskInterface for its fields.',
    note: 'Repeated-task layouts require their optional module and Premium entitlement.',
  },
  customHTML: {
    description:
      'Legacy construction-time header customization. Expand the nested type before using its header element or ordering settings.',
    note: 'For new code, prefer headerToolbar, customButtons, and toolbarElements.',
  },
  extraClass: {
    description:
      'Additional class names applied to the calendar during construction. Define the matching styles in your application.',
  },
  hideHeader: {
    description: 'Suppresses the built-in calendar header at construction time.',
    value: 'true',
  },
  styleUrl: {
    description:
      'Stylesheet URL supplied to the calendar integration. Keep normal application styles in your bundler stylesheet import unless your integration needs this option.',
  },
  weekDaysFormat: {
    description:
      'Formatting pattern for the weekday headings. Use it to choose compact or longer date labels.',
    demo: 'locale-rtl',
  },
  dayOffOnWeekDays: {
    description:
      'Weekday numbers treated as days off by the calendar. Review the related exclusion option when those days should be omitted.',
    value: '[0, 6]',
  },
  excludeDayOffOnWeekDays: {
    description:
      'Specific dates exempted from the recurring day-off rule in task/resource scheduling. Accepts dates, not weekday numbers or a boolean.',
    value: "['2026-09-12']",
  },
  exCludeDayOffOnWeekDays: {
    description:
      'Legacy spelling of the date exceptions to the recurring day-off rule. Prefer excludeDayOffOnWeekDays in new configurations.',
  },
  apikey: {
    description:
      'Rejected legacy credential field. Do not provide this option; plain API keys are not accepted for Premium licensing.',
    note: 'Use the documented signed-license integration. Provider credentials, such as Google OAuth tokens, are separate from the WTS license.',
  },
};

function readable(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}
export function optionGuide(name: string): ApiGuide {
  if (OPTION_GUIDES[name]) return OPTION_GUIDES[name];
  const hook = name.match(/^(.*)(ClassNames|Class|Content|DidMount|WillUnmount)$/);
  if (!hook) return {};
  const target = readable(hook[1]);
  switch (hook[2]) {
    case 'Class':
    case 'ClassNames':
      return {
        description: `Adds application CSS classes to the ${target}. Define the CSS in your application; this hook does not create styles.`,
        value: "() => ['my-calendar-style']",
        demo: name.startsWith('resource') ? undefined : 'render-hooks',
      };
    case 'Content':
      return {
        description: `Customizes the content rendered in the ${target}. Check the linked return type for supported text or DOM-node values.`,
        value: "() => 'Custom label'",
        demo: name.startsWith('resource') ? undefined : 'render-hooks',
      };
    case 'DidMount':
      return {
        description: `Runs after the ${target} is mounted. Use the callback payload to attach application behavior to that rendered element.`,
        value: '(info) => { console.log(info); }',
      };
    default:
      return {
        description: `Runs before the ${target} is removed. Clean up listeners and application resources attached during its mount callback.`,
        value: '(info) => { console.log(info); }',
      };
  }
}

export const METHOD_EXAMPLES: Record<string, string> = {
  addEvent:
    "calendar.addEvent({ id: 'meeting', title: 'Planning', start: '2026-09-07T10:00:00' });",
  setEvents:
    "calendar.setEvents([{ id: 'meeting', title: 'Planning', start: '2026-09-07T10:00:00' }]);",
  getEvents: 'console.log(calendar.getEvents());',
  getEventById: "const event = calendar.getEventById('meeting');\nif (event) console.log(event);",
  updateEvent: "calendar.updateEvent('meeting', { title: 'Updated planning' });",
  removeEvent:
    "// Removes this event from the calendar, not from your backend.\ncalendar.removeEvent('meeting');",
  setOption: "calendar.setOption('weekends', false);",
  setOptions: 'calendar.setOptions({ weekends: false, height: 600 });',
  getOption: "console.log(calendar.getOption('timeZone'));",
  setView: "calendar.setView('month', '2026-09-07');",
  changeView: "calendar.changeView('month', '2026-09-07');",
  gotoDate: "calendar.gotoDate('2026-09-07');",
  setDate: "calendar.setDate('2026-09-07');",
  incrementDate: 'calendar.incrementDate({ days: 7 });',
  scrollToTime: "calendar.scrollToTime('09:00');",
  next: 'calendar.next();',
  prev: 'calendar.prev();',
  previous: 'calendar.previous();',
  today: 'calendar.today();',
  nextYear: 'calendar.nextYear();',
  prevYear: 'calendar.prevYear();',
  previousYear: 'calendar.previousYear();',
  whenIdle: 'await calendar.whenIdle();',
  destroy: '// Call only when the calendar is being unmounted.\ncalendar.destroy();',
  destroyAsync:
    '// Await teardown before releasing application-owned resources.\nawait calendar.destroyAsync();',
  updateSize: 'calendar.updateSize();',
  refetchEvents: 'await calendar.refetchEvents();',
  refetchSources: 'await calendar.refetchSources();',
  getEventSources: 'console.log(calendar.getEventSources());',
  removeEventSource: "calendar.removeEventSource('my-source');",
  on: "const off = calendar.on('event-click', (detail) => console.log(detail));\n// Call during your component cleanup, not immediately after subscribing.\n// off();",
  undo: 'calendar.undo();',
  redo: 'calendar.redo();',
  getEventHistoryState: 'console.log(calendar.getEventHistoryState());',
  getDate: 'console.log(calendar.getDate());',
  getView: 'console.log(calendar.getView());',
  batchRendering:
    "calendar.batchRendering(() => {\n  calendar.setOption('weekends', false);\n  calendar.setOption('height', 600);\n});",
  formatDate: "console.log(calendar.formatDate('2026-09-07'));",
  formatRange: "console.log(calendar.formatRange('2026-09-07', '2026-09-14'));",
  formatIso: "console.log(calendar.formatIso('2026-09-07'));",
  unselect: 'calendar.unselect();',
  getSelection: 'console.log(calendar.getSelection());',
};

export const METHOD_DESCRIPTIONS: Record<string, string> = {
  addEvent: 'Adds one or more event records and returns the calendar event objects.',
  setEvents:
    'Replaces the calendar event data with the supplied array. This is not a backend write.',
  updateEvent: 'Applies changes to an event by id. Returns null when no matching event is found.',
  createEvent: 'Creates an event through the mutation transaction pipeline.',
  editEvent:
    'Edits an event through the mutation transaction pipeline, with optional recurrence scope.',
  removeEventWithTransaction: 'Requests removal through the mutation transaction pipeline.',
  removeEvent: 'Removes an event by id and returns whether removal succeeded.',
  removeAllEvents: 'Removes all calendar events. This does not delete records from your backend.',
  getEvents: 'Returns the current calendar event objects.',
  getEventById: 'Looks up an event by id; returns null when absent.',
  getOption: 'Reads the current value of one calendar option.',
  setOption: 'Updates one runtime-configurable option and returns its change result.',
  setOptions: 'Updates several runtime-configurable options together.',
  setView: 'Switches to a registered view, optionally at a supplied date.',
  changeView: 'Switches view with an optional date or visible-range input.',
  getView: 'Returns the active view API, including its visible range.',
  getDate: 'Returns the current calendar date.',
  gotoDate: 'Navigates to the range containing the supplied date.',
  setDate: 'Sets the active calendar date.',
  next: 'Navigates forward by the current view range.',
  prev: 'Navigates backward by the current view range.',
  previous: 'Navigates backward by the current view range.',
  today: 'Navigates to the range containing today.',
  nextYear: 'Navigates one year forward.',
  prevYear: 'Navigates one year backward.',
  previousYear: 'Navigates one year backward.',
  incrementDate: 'Moves the calendar date by a duration.',
  scrollToTime: 'Scrolls the active time grid to an HH:mm time.',
  updateSize: 'Recalculates layout after the calendar container changes size.',
  whenIdle: 'Waits for calendar-managed pending operations to settle.',
  destroy: 'Starts calendar teardown and releases its rendering and listeners.',
  destroyAsync: 'Returns a promise for asynchronous calendar teardown.',
  on: 'Subscribes to an event-bus notification and returns an unsubscribe function.',
  off: 'Removes a matching event-bus callback, or listeners for that name when no callback is supplied.',
  undo: 'Attempts to undo the most recent recorded event change.',
  redo: 'Attempts to redo a previously undone event change.',
  clearEventHistory: 'Clears the stored event undo/redo history.',
  getEventHistoryState: 'Reads current undo/redo availability and history state.',
  batchRendering: 'Groups synchronous changes into a rendering batch.',
  batchRenderingAsync: 'Groups asynchronous changes into a rendering batch.',
  select: 'Creates a programmatic selection from dates or a selection input.',
  unselect: 'Clears the active selection and reports whether one was cleared.',
  getSelection: 'Returns the active selection or null.',
  format: 'Formats a Date using the calendar formatting configuration.',
  formatDate: 'Formats one calendar date with optional formatting settings.',
  formatRange: 'Formats a pair of dates as a range.',
  formatIso: 'Formats a date as an ISO string using the supplied settings.',
  render: 'Requests a calendar render.',
  rerenderEvents: 'Requests a refresh of rendered events.',
};

export function methodDescription(name: string, original: string): string {
  if (METHOD_DESCRIPTIONS[name]) return METHOD_DESCRIPTIONS[name];
  if (!original.startsWith('Public WtsCalendar')) return original;
  const source = name.match(/^(add|remove|refetch|get|loadMore)(Event|Resource|Task)?Sources?$/);
  if (source)
    return `${({ add: 'Registers a', remove: 'Removes a', refetch: 'Reloads', get: 'Returns information about', loadMore: 'Loads the next page from a' } as Record<string, string>)[source[1]]} ${source[2]?.toLowerCase() || 'calendar'} source${['get', 'refetch'].includes(source[1]) ? 's' : ''}. See the signature for identifiers and request options.`;
  return `${readable(name).replace(/^./, (s) => s.toUpperCase())}. The signature below specifies its inputs and return value; linked types describe the data contract.`;
}

export const FIELD_DESCRIPTIONS: Record<string, string> = {
  'CalendarEventClickInfo.event': 'The event data associated with the clicked segment.',
  'CalendarEventClickInfo.el': 'The DOM element for that rendered event segment.',
  'CalendarEventClickInfo.jsEvent': 'The native mouse event that triggered the callback.',
  'CalendarEventClickInfo.view': 'The active view name.',
  'CalendarDateClickInfo.date': 'The activated date as a Date object.',
  'CalendarDateClickInfo.dateStr': 'String representation of the activated date.',
  'CalendarDateClickInfo.allDay': 'Whether the activated cell is an all-day date cell.',
  'CalendarDateClickInfo.dayEl': 'The activated date-cell element.',
};
