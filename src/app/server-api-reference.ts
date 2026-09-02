export interface ServerReferenceEntry {
  package: 'PHP' | 'ASP.NET Core' | 'Shared';
  name: string;
  type: string;
  defaultValue: string;
  description: string;
}

const sharedDescriptions = {
  pageSize: 'Default number of events returned when the request does not provide a page size.',
  maxPageSize:
    'Largest accepted page size. Larger requests are rejected instead of silently loading an unbounded result.',
  maxWindow:
    'Largest permitted start-to-end query range. Protects storage from accidental unbounded scans.',
  maxPayload: 'Maximum JSON request-body size accepted for create and update operations.',
  maxTitle: 'Maximum event title length.',
  maxDescription: 'Maximum event description length.',
  maxCustom: 'Maximum serialized custom-data size for one event.',
  updateMatch: 'When enabled, updates without an If-Match precondition return HTTP 428.',
  deleteMatch: 'When enabled, deletes without an If-Match precondition return HTTP 428.',
} as const;

export const SERVER_OPTIONS: readonly ServerReferenceEntry[] = [
  {
    package: 'PHP',
    name: 'routePrefix',
    type: 'string',
    defaultValue: '/api/calendar/events',
    description: 'Path prefix matched by CalendarApiHandler. A trailing slash is normalized.',
  },
  {
    package: 'PHP',
    name: 'defaultPageSize',
    type: 'int',
    defaultValue: '250',
    description: sharedDescriptions.pageSize,
  },
  {
    package: 'PHP',
    name: 'maxPageSize',
    type: 'int',
    defaultValue: '1000',
    description: sharedDescriptions.maxPageSize,
  },
  {
    package: 'PHP',
    name: 'maxQueryDays',
    type: 'int',
    defaultValue: '366',
    description: sharedDescriptions.maxWindow,
  },
  {
    package: 'PHP',
    name: 'maxPayloadBytes',
    type: 'int',
    defaultValue: '131072',
    description: sharedDescriptions.maxPayload,
  },
  {
    package: 'PHP',
    name: 'maxTitleLength',
    type: 'int',
    defaultValue: '300',
    description: sharedDescriptions.maxTitle,
  },
  {
    package: 'PHP',
    name: 'maxDescriptionLength',
    type: 'int',
    defaultValue: '16000',
    description: sharedDescriptions.maxDescription,
  },
  {
    package: 'PHP',
    name: 'maxCustomDataBytes',
    type: 'int',
    defaultValue: '32768',
    description: sharedDescriptions.maxCustom,
  },
  {
    package: 'PHP',
    name: 'requireIfMatchForUpdate',
    type: 'bool',
    defaultValue: 'false',
    description: sharedDescriptions.updateMatch,
  },
  {
    package: 'PHP',
    name: 'requireIfMatchForDelete',
    type: 'bool',
    defaultValue: 'false',
    description: sharedDescriptions.deleteMatch,
  },
  {
    package: 'ASP.NET Core',
    name: 'pattern',
    type: 'string',
    defaultValue: '/api/calendar/events',
    description:
      'Route-group pattern passed to MapWtsCalendarEvents. It must not be null, empty, or whitespace.',
  },
  {
    package: 'ASP.NET Core',
    name: 'DefaultPageSize',
    type: 'int',
    defaultValue: '250',
    description: sharedDescriptions.pageSize,
  },
  {
    package: 'ASP.NET Core',
    name: 'MaxPageSize',
    type: 'int',
    defaultValue: '1000',
    description: sharedDescriptions.maxPageSize,
  },
  {
    package: 'ASP.NET Core',
    name: 'MaxQueryWindow',
    type: 'TimeSpan',
    defaultValue: '366 days',
    description: sharedDescriptions.maxWindow,
  },
  {
    package: 'ASP.NET Core',
    name: 'MaxPayloadBytes',
    type: 'long',
    defaultValue: '131072',
    description: sharedDescriptions.maxPayload,
  },
  {
    package: 'ASP.NET Core',
    name: 'MaxTitleLength',
    type: 'int',
    defaultValue: '300',
    description: sharedDescriptions.maxTitle,
  },
  {
    package: 'ASP.NET Core',
    name: 'MaxDescriptionLength',
    type: 'int',
    defaultValue: '16000',
    description: sharedDescriptions.maxDescription,
  },
  {
    package: 'ASP.NET Core',
    name: 'MaxCustomDataBytes',
    type: 'int',
    defaultValue: '32768',
    description: sharedDescriptions.maxCustom,
  },
  {
    package: 'ASP.NET Core',
    name: 'RequireIfMatchForUpdate',
    type: 'bool',
    defaultValue: 'false',
    description: sharedDescriptions.updateMatch,
  },
  {
    package: 'ASP.NET Core',
    name: 'RequireIfMatchForDelete',
    type: 'bool',
    defaultValue: 'false',
    description: sharedDescriptions.deleteMatch,
  },
];

export const SERVER_ROUTES = [
  {
    method: 'GET',
    route: '/api/calendar/events?start={ISO}&end={ISO}',
    success: '200',
    purpose: 'Load a bounded range; supports timeZone, cursor and limit.',
  },
  {
    method: 'GET',
    route: '/api/calendar/events/{id}',
    success: '200 + ETag',
    purpose: 'Load one event and its current version.',
  },
  {
    method: 'POST',
    route: '/api/calendar/events',
    success: '201 + Location + ETag',
    purpose: 'Validate and create one event.',
  },
  {
    method: 'PATCH / PUT',
    route: '/api/calendar/events/{id}',
    success: '200 + ETag',
    purpose: 'Replace the stored event; send If-Match to detect stale edits.',
  },
  {
    method: 'DELETE',
    route: '/api/calendar/events/{id}',
    success: '204',
    purpose: 'Delete an event; If-Match can protect the mutation.',
  },
] as const;

export const SERVER_RESPONSES = [
  {
    status: '400',
    meaning:
      'Malformed identifiers, query values, range, cursor, time zone, JSON, or If-Match header.',
  },
  { status: '404', meaning: 'The requested event does not exist.' },
  {
    status: '405',
    meaning:
      'Unsupported collection/item method. PHP returns Allow; ASP.NET routing supplies the response.',
  },
  {
    status: '409',
    meaning: 'The supplied event version is stale or the mutation conflicts with stored state.',
  },
  { status: '413', meaning: 'The JSON body exceeds MaxPayloadBytes / maxPayloadBytes.' },
  { status: '415', meaning: 'Create or update did not use application/json.' },
  {
    status: '422',
    meaning:
      'The JSON shape is valid but event fields fail validation or storage rejects the mutation.',
  },
  { status: '428', meaning: 'If-Match is required by configuration but was not supplied.' },
  {
    status: '401 / 403',
    meaning:
      'Host-owned authentication and authorization failures; apply policy before the package endpoint.',
  },
  {
    status: '500',
    meaning:
      'Host-owned exception handling for store, option, serialization, or infrastructure failures.',
  },
] as const;

export const SERVER_STORAGE_METHODS = [
  {
    operation: 'Query',
    php: 'query(CalendarEventQuery): CalendarEventPage',
    dotnet: 'QueryAsync(query, cancellationToken): ValueTask<WtsCalendarEventPage>',
    contract:
      'Return half-open range matches, stable ordering, an opaque cursor, and optional collection version/meta.',
  },
  {
    operation: 'Find',
    php: 'find(string $id): ?StoredCalendarEvent',
    dotnet: 'FindAsync(id, cancellationToken): ValueTask<WtsCalendarStoredEvent?>',
    contract: 'Return the event plus a nonempty opaque version, or null when absent.',
  },
  {
    operation: 'Create',
    php: 'create(CalendarEvent): MutationResult',
    dotnet: 'CreateAsync(event, cancellationToken): ValueTask<WtsCalendarMutationResult>',
    contract: 'Return Created plus a stored event containing its final ID and version.',
  },
  {
    operation: 'Update',
    php: 'update(id, event, expectedVersion): MutationResult',
    dotnet:
      'UpdateAsync(id, event, expectedVersion, cancellationToken): ValueTask<WtsCalendarMutationResult>',
    contract:
      'Return Updated, NotFound, Conflict, or Rejected; compare expectedVersion atomically.',
  },
  {
    operation: 'Delete',
    php: 'delete(id, expectedVersion): MutationResult',
    dotnet:
      'DeleteAsync(id, expectedVersion, cancellationToken): ValueTask<WtsCalendarMutationResult>',
    contract:
      'Return Deleted, NotFound, Conflict, or Rejected; compare expectedVersion atomically.',
  },
] as const;

export const SERVER_COMPATIBILITY = [
  {
    package: 'wts-calendar/server-php',
    version: '1.0.0',
    runtime: 'PHP 8.2+',
    dependencies: 'PSR-7 2.x, PSR-15 1.x, PSR-17 1.x; the host supplies concrete HTTP factories.',
  },
  {
    package: 'Wts.Calendar.AspNetCore',
    version: '1.0.0',
    runtime: '.NET 8 or .NET 10',
    dependencies: 'ASP.NET Core shared framework; no third-party runtime package.',
  },
] as const;

export const EVENT_FIELDS = [
  [
    'id',
    'string',
    'Stable event identifier; 1–200 printable characters in .NET and bytes in PHP. A create store may assign it.',
  ],
  ['title', 'string', 'Required display title, limited by the configured title length.'],
  ['start', 'string', 'Required yyyy-MM-dd or ISO date-time containing Z or an explicit offset.'],
  [
    'end',
    'string | null',
    'Optional exclusive end in the same date kind as start; must be later than start.',
  ],
  [
    'isAllDay',
    'boolean | null',
    'Optional. When true, start and end must be date-only. PHP additionally rejects date-only start when false.',
  ],
  [
    'description',
    'string | null',
    'Optional long-form description, limited by server configuration.',
  ],
  ['url', 'string | null', 'Optional HTTP(S) URL. PHP also rejects embedded credentials.'],
  [
    'editable / removeable',
    'boolean | null',
    'Optional client interaction flags preserved by both packages.',
  ],
  [
    'display / color / textColor',
    'string | null',
    'Optional presentation values passed through to the calendar client.',
  ],
  [
    'classNames',
    'string[] | null',
    'Optional classes; at most 64 entries of up to 200 characters/bytes each.',
  ],
  [
    'resourceId / resourceUnits',
    'string / number',
    'Optional resource assignment; units must be greater than zero.',
  ],
  [
    'rrule / rdate / exdate',
    'string / string[]',
    'Recurrence data. PHP uses lowercase keys; current .NET JSON emits rRule, rDate, and exDate.',
  ],
  [
    'recurrenceTimeZone',
    'string | null',
    'Optional time-zone identifier associated with recurrence expansion.',
  ],
  [
    'extendedProps / meta',
    'object | null',
    'Application-owned JSON counted toward the custom-data byte limit.',
  ],
  [
    'additional fields',
    'object',
    'Unknown top-level fields are retained. PHP also recognizes a broader set of client event properties.',
  ],
] as const;
