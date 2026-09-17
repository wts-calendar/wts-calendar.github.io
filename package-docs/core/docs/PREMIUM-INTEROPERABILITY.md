# Premium interoperability

`@wts-calendar/core/premium-interoperability` is an explicit, optional integration
toolkit included in verified package-wide Premium access (`premium-interoperability` capability). It is
not auto-loaded by the standard entry or `/all`, and WTS does not operate a
credential, token, cursor, or calendar-data backend.

To obtain the WTS entitlement, follow [Premium licensing](PREMIUM-LICENSING.md).
Provider API keys and OAuth tokens are separate credentials and are not issued
by WTS Calendar.

```ts
import { connectCalendarLicense } from '@wts-calendar/core';
import { PremiumCalendarInteroperability } from
  '@wts-calendar/core/premium-interoperability';

const license = await connectCalendarLicense({
  licenseKey: deploymentConfig.licenseKey,
});
const interoperability = new PremiumCalendarInteroperability({ license });
```

Outside a browser, pass the licensed `origin` explicitly. Provider credentials
must be supplied at runtime. The toolkit does not expose client-secret,
refresh-token storage, or persistence APIs.

## Two-way Google Calendar

Request an OAuth token with an appropriate Google Calendar read/write scope and
keep it in application memory:

```ts
const google = interoperability.createGoogleCalendarAdapter({
  calendarId: 'primary',
  accessToken: () => googleConnection.accessToken(),
  timeZone: 'Asia/Kolkata',
});

const changes = await google.pull({
  start: visibleStart,
  end: visibleEnd,
  cursor: previousSyncToken,
  signal,
});

await google.push([
  { type: 'create', localId: event.id, event },
  { type: 'update', localId: event.id, remoteId, etag, event },
  { type: 'delete', localId: event.id, remoteId, etag },
], { signal });
```

Initial pulls use a bounded range. Later pulls accept Google `syncToken`
cursors and include remote deletions. Writes use POST/PATCH/DELETE and send
`If-Match` when an ETag is available.

## Microsoft 365 and Outlook

```ts
const outlook = interoperability.createMicrosoft365Adapter({
  accessToken: () => microsoftAccessToken,
  calendarId: selectedCalendarId, // omit for the default calendar
  timeZone: 'Asia/Kolkata',
  timeZoneMap: companyWindowsToIanaZones,
});
```

The adapter uses Microsoft Graph calendar-view delta queries and preserves the
returned delta link as its cursor. It maps cancellations/deletions, all-day
events, descriptions, locations, attendees, organizers, change keys, and web
links. Create/update/delete operations use Graph write endpoints and
conditional ETags.

Microsoft may return Windows time-zone identifiers. Common identifiers are
built in; supply `timeZoneMap` for tenant-specific or uncommon zones.

## CalDAV

```ts
const caldav = interoperability.createCalDavAdapter({
  calendarUrl: 'https://dav.example.com/calendars/me/work/',
  authorization: () => `Bearer ${runtimeToken}`,
  headers: () => ({ 'X-Tenant': tenantId }),
  timeZone: 'UTC',
});
```

Initial reads use `calendar-query`; incremental reads use `sync-collection` and
its sync token. Embedded `calendar-data` is preferred, with a same-origin GET
fallback. Writes use conditional PUT and DELETE with ETags. The CalDAV server
must permit the browser origin through its CORS and authentication policy.

Provider pagination is capped at 100 pages, response bodies at 10 MB, URLs may
not contain credentials, and provider pagination/delta links may not change
origin.

## ICS change detection and reconciliation

```ts
const diff = interoperability.diffICalendar(previousIcs, currentIcs, 'UTC');
// diff.added / updated / deleted / unchanged

const result = interoperability.reconcile(
  lastCommonEvents,
  localEvents,
  remoteEvents,
  'manual', // local | remote | manual
);
```

Reconciliation is a deterministic three-way comparison by stable event ID.
Conflicts retain base, local, and remote values. Manual mode reports an
unresolved conflict while preserving the local copy in the proposed result;
the application must ask the user or apply its own policy.

`synchronize()` combines pull, reconciliation, mutation planning, and optional
push. When using an incremental cursor, pass the prior `remoteBase` provider
snapshot so events absent from a delta page are not interpreted as deletions.
Push defaults to false, allowing the application to inspect conflicts and the
mutation plan first.

## Moment and Luxon migration compatibility

```ts
const formattingPlugin = await interoperability
  .loadDateFormattingCompatibility('moment'); // or luxon3
```

The peer is loaded dynamically, so selecting Moment does not load Luxon and
vice versa. Applications must install the selected peer. Existing direct
`format-moment` and `format-luxon3` entry points remain available for backward
compatibility; the licensed toolkit adds gated selection and migration
workflow rather than breaking those imports.

## FullCalendar configuration migration assistant

```ts
const migration = interoperability.migrateFullCalendarOptions(fullCalendarOptions);

console.log(migration.options);
console.log(migration.requiredModules);
console.log(migration.issues);
console.log(migration.unmappedOptions);
```

The assistant maps construction aliases, view names, dates, weekday behavior,
slot duration, layout, interaction, event/resource data, and resource-timeline
settings. It identifies required WTS modules, warns that callback payloads need
review, rejects conversion of FullCalendar license keys, and lists every option
without a registered lossless mapping. The result is a draft: run application
timezone, recurrence, interaction, accessibility, and visual acceptance tests
before removing FullCalendar.
