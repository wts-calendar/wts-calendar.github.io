# Time Machine — Premium

Time Machine adds recorded-state replay, field-level comparison, and selective
recovery to WTS Calendar and application-owned business records. It is available
with verified **package-wide Premium access**, under the `enterprise-workflow`
capability. Verify a deployment key as described in [Premium licensing](PREMIUM-LICENSING.md).

This is an optional first release. It does **not** include draft branches,
scenario merging, automatic historical backfill, a hosted database, or a
provider synchronization service. It is included in the unreleased 2.0.0
candidate. These new subpaths are not in the previously published 1.1.1.

## Entry points

```ts
import { CalendarTimeMachine } from '@wts-calendar/core/time-machine';
import { CalendarTimeMachinePanel } from '@wts-calendar/core/time-machine-panel';
import '@wts-calendar/core/styles/calendar.css';
```

The engine is DOM-free. The panel is a separate optional web UI. Neither is
imported by the standard calendar or `all` entry. Existing calendar features,
entitlements and wrapper APIs are unchanged. No second core package is needed.

## A complete local example

This example only changes the Time Machine dataset. It does not write to a
live calendar, provider, or server. Its permissive authorization is appropriate
only for a local demonstration.

```ts
import { connectCalendarLicense } from '@wts-calendar/core';
import { CalendarTimeMachine } from '@wts-calendar/core/time-machine';
import { CalendarTimeMachinePanel } from '@wts-calendar/core/time-machine-panel';
import '@wts-calendar/core/styles/calendar.css';

async function mountHistory(container: HTMLElement, licenseKey: string) {
  const license = await connectCalendarLicense({ licenseKey });
  const machine = new CalendarTimeMachine({
    license,
    // Browser origin is inferred. Set origin explicitly for Node/SSR/native.
    authorizeRestore: () => true, // LOCAL DEMO ONLY
  });
  const original = await machine.capture([
    {
      id: 'review',
      data: {
        title: 'Design review', start: '2026-09-07T10:00:00Z',
        end: '2026-09-07T11:00:00Z', assignee: 'Ana', status: 'In progress',
      },
    },
    { id: 'request', data: { title: 'Unscheduled request', status: 'Backlog' } },
  ], { actorId: 'editor', reason: 'Initial approved plan' });

  await machine.capture([
    {
      id: 'review',
      data: {
        title: 'Final design review', start: '2026-09-08T10:00:00Z',
        end: '2026-09-08T11:00:00Z', assignee: 'Ben', status: 'Completed',
      },
    },
    { id: 'request', data: { title: 'Unscheduled request', status: 'Backlog' } },
  ], { actorId: 'import-job', reason: 'Imported assignments and progress' });

  const panel = new CalendarTimeMachinePanel({
    container, machine, actorId: () => 'demo-manager',
  });
  panel.showRevision(original.id);
  return () => { panel.destroy(); machine.destroy(); };
}
```

The runnable repository fixture at `e2e/time-machine-fixture.html` uses the
actual package to show a historical calendar, version comparison, and restore
confirmation. Run `node e2e/server.mjs` after building, then open
`http://127.0.0.1:4181/e2e/time-machine-fixture.html`. Its test-only grant and
permissive local policy must not be copied into production applications.

## Record and revision contract

`TimeMachineRecord` has a stable string `id` and a plain JSON `data` object.
Unscheduled work is valid: dates are not required. Serialize dates as ISO
strings. Arrays and nested objects are restored as **atomic top-level field
values**, not JSON-path patches. Missing fields are distinct from `null`.

For calendar data, map application events explicitly:

```ts
const records = calendar.getEvents().map(event => ({
  id: event.id ?? event.uuid,
  data: {
    title: event.title ?? '',
    start: new Date(event.start).toISOString(),
    ...(event.end ? { end: new Date(event.end).toISOString() } : {}),
    ...(event.resourceId ? { resourceId: event.resourceId } : {}),
  },
}));
// Record the authoritative event definitions, not expanded recurring occurrences.
// Preserve date-only all-day values and recurrence rules in your own projection.
```

Every revision contains:

| Field | Contract |
| --- | --- |
| `schemaVersion` | `1` |
| `id` | Unique revision identifier, also the storage idempotency key |
| `sequence` | Contiguous one-based revision number |
| `parentId` | Previous revision id, or `null` for the baseline |
| `recordedAt` | Canonical UTC ISO instant, monotonically nondecreasing |
| `actorId`, `reason` | Attribution of this capture/restore, not authorization proof |
| `kind` | `capture` or `restore` |
| `restoredFrom` | Earlier target revision id, only on a restore |
| `records` | Complete immutable snapshot, including unscheduled records |

Records are cloned, canonicalized, and deeply frozen. Functions, getters,
cycles, symbols, sparse arrays, non-finite numbers, class instances, `undefined`
and prototype-polluting keys are rejected. Maximum JSON nesting is 32; each
snapshot is limited to 100,000 JSON value nodes in addition to configured limits.
This is structural validation, **not cryptographic tamper evidence**.

## Engine API

| API | Behavior |
| --- | --- |
| `capture(records, actor, signal?)` | Append a full confirmed snapshot; returns the new revision |
| `getHistory()` | Return immutable recorded revisions; contains sensitive data |
| `getHead()` | Latest revision or `null` |
| `getRevision(id)` | Exact revision; throws if unknown |
| `at(Date \| string)` | Last recorded revision at/before an instant; `null` before the baseline |
| `compare(fromId, toId)` | Added/removed/updated records and before/after field presence and values |
| `prepareRestore(targetId, selections)` | Pure, immutable restore preview scoped to this engine and current head |
| `restore(plan, actor, signal?)` | Authorize, validate, compare-and-swap, append a new revision |
| `refresh(signal?)` | Load complete authorized history from storage; required before the first write when storage exists |
| `subscribe(listener)` | Observe confirmed local commits/refreshes; returns an unsubscribe function |
| `restoreEnabled` | Whether a restore authorization callback is configured, not a permission decision |
| `destroy()` | Abort pending operations, clear memory/listeners; never delete persisted history |

`at()` means **recorded knowledge at that instant**, not the dates on the
calendar. If imported source data was incomplete, Time Machine cannot infer
unrecorded state. An instant after the last revision returns that latest
recorded state, not a prediction. Callers must use instants with offsets for
unambiguous history lookup.

### Selective restore

```ts
const plan = machine.prepareRestore(original.id, [
  { recordId: 'review', fields: ['assignee'] },
]);
// plan.changes describes current -> proposed values. No hooks or writes ran.
const restored = await machine.restore(plan, {
  actorId: currentUser.id,
  reason: 'Correct imported assignment while retaining completion progress',
});
```

Only `assignee` changes. Later title, date, status and unrelated-record updates
are retained. Omit `fields` to restore an entire record, including its existence:
an old deleted record can be recreated; a record absent in the target can be
removed. The latter is a deletion and must be explicitly authorized by the host.
Partial-field resurrection/deletion is rejected. `data.id` is ordinary data;
the outer stable record `id` cannot be renamed through field restore.

Plans from another engine, fabricated/copied plans, stale plans and no-op plans
are rejected. Any later captured revision invalidates the expected head; prepare
a fresh plan against the latest state. There is no automatic conflict override
or silent retry. A successful restore adds a new revision with provenance;
the original revisions remain unchanged.

## Configuration

| Option | Default / meaning |
| --- | --- |
| `license` | Required verified grant containing `enterprise-workflow` |
| `origin` | Browser origin; required outside a browser for origin-scoped grants |
| `storage` | None: local, in-memory dataset only |
| `authorizeRestore(context)` | Absent: deny all restores. Must explicitly return `true` |
| `validateRestore(context)` | Optional application constraints; must return `true` if configured |
| `now()` | `new Date()`; backwards timestamps rejected |
| `idGenerator()` | `crypto.randomUUID()`; must produce unique non-empty ids |
| `maxRevisions` | `200` |
| `maxRecords` | `10000` records per snapshot |
| `maxRevisionBytes` | `2097152` UTF-8 serialized bytes per revision |
| `onListenerError(error)` | Optional isolated observer-error reporting |

Limits throw instead of silently pruning history. These are full snapshots:
plan memory/storage for the configured record and revision limits. Archive into
a separately managed history namespace/epoch before starting a fresh baseline;
do not remove old entries from an existing contiguous chain. `refresh()` rejects
rewrites/truncation of an already observed prefix.

Only one write or refresh can run per instance at a time. Overlapping attempts
are rejected rather than implicitly queued. Read operations remain available.
Pass an `AbortSignal` for cancellation. Cancellation cannot undo a transaction
already committed remotely. Adapter resolution means committed; if it rejects
after a potentially successful write, refresh before another write.

## Authoritative persistence and business integration

The package does not provision a database or claim distributed locking. Implement
`TimeMachineStorageAdapter` on your existing backend. The published PHP/.NET CRUD
packages do not yet implement Time Machine storage endpoints automatically.

```ts
import {
  CalendarTimeMachine, TimeMachineConflictError,
  type TimeMachineStorageAdapter,
} from '@wts-calendar/core/time-machine';

// Example transport contract. Implement these endpoints in your own application.
const storage: TimeMachineStorageAdapter = {
  async load(signal) {
    const response = await fetch('/api/work/history', { credentials: 'same-origin', signal });
    if (!response.ok) throw new Error('Unable to load authorized history');
    return response.json();
  },
  async append(context, signal) {
    const response = await fetch('/api/work/history', {
      method: 'POST', credentials: 'same-origin', signal,
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': context.revision.id,
        // Include your application's CSRF protection for cookie-authenticated writes.
      },
      body: JSON.stringify(context),
    });
    if (response.status === 409) throw new TimeMachineConflictError();
    // A queued approval is NOT a committed restore.
    if (response.status !== 201) throw new Error('Restore/capture was not confirmed committed');
  },
};

const machine = new CalendarTimeMachine({
  license, storage,
  authorizeRestore: async context => {
    // Integrate current user permissions and approvals here. Backend rechecks them.
    return checkRestorePermission(context);
  },
  validateRestore: context => validateWholeProposedDataset(context.plan.records),
});
await machine.refresh();
```

### Required server transaction

1. Authenticate the requester; derive identity/tenant from the session, never
   trust submitted `actorId` or a browser-side `true` authorization result.
2. Scope history reads and writes to records the user may access. Historical
   permissions are not permission to read data today.
3. Enforce current record/field permissions, explicit deletes, completed
   approvals and application constraints against the proposed result.
4. Check `expectedHeadId` **and authoritative business-record versions** inside
   the transaction. A matching history head is insufficient if business data
   changed without being captured. Recompute/validate selections using stored
   target/current revisions; never blindly accept the browser's full snapshot.
5. Atomically apply approved business changes and append the immutable revision.
   Captures must agree with authoritative data. Use the revision id as an
   idempotency key so a lost response cannot cause duplicate effects.
6. Resolve `append()` only after commit. Return conflict/rejection otherwise.
   Do not report a queued approval or partial batch as committed.

On any append exception, the engine blocks further writes until a successful
refresh. It does not roll back remote data or retry. For a multi-stage approval,
wait for completion, refresh, re-prepare/review the plan, and confirm with current
versions. Existing [workflow policies](ENTERPRISE-WORKFLOW.md) can participate in
your `authorizeRestore` callback; the engine does not bypass or impersonate them.

**Replay and comparison never call storage or workflow hooks.** Restores are
explicit new operations, not re-executions of old events. Do not replay payment,
email, webhook or provider side effects from history. Any intended external
side effect of an approved restore is a separate, authorized, idempotent host
workflow. No network requests are made by the engine or panel themselves.

## Panel API and frameworks

`CalendarTimeMachinePanel` takes `container`, `machine`, optional `actorId()`
(evaluated at confirmation), `readOnly`, `showCalendar` (default `true`), `locale`,
`injectStyles` (default `true`), and `pageSize` (default `50`, range `1..200`).
Comparison and data rows are paginated; selections persist across comparison
pages but reset when switching revisions or receiving a newer snapshot.
`locale` formats timestamps and the embedded calendar; panel control text is
English in this first release.
`showRevision(id)` only changes the selected
historical preview. `destroy()` removes only the panel's DOM, styles and owned
calendar instance; it does not destroy the shared engine or host content.

Mount into a dedicated sibling container, not the live calendar container.
Its isolated month preview maps only `title`, `start`, `end`, and `isAllDay` in
UTC. Undated records remain in recorded data. Resource assignment and all other
fields are visible in the diff. The panel does not reconstruct resource views,
expand RRULE series, forward URLs, or inherit application event callbacks. A
preview validation failure falls back to the complete recorded-data view.

The UI includes labeled native controls, keyboard navigation, a review and
confirmation step, live status/error announcements, responsive scrollable
tables, dark/forced-color styling, and restored focus. CSS is scoped to
`.wts-time-machine`; theme tokens include `--tm-bg`, `--tm-text`, `--tm-muted`,
`--tm-border`, `--tm-accent`, `--tm-soft`, and `--tm-danger`. Core calendar styles
remain separately imported. Supply equivalent CSS and set `injectStyles: false`
under strict CSP policies that prohibit injected style elements.

For React, mount the panel in `useEffect` and return `panel.destroy()` as its
cleanup. In Vue use `onMounted`/`onBeforeUnmount`; in Angular use
`ngAfterViewInit`/`ngOnDestroy`. Keep the engine stable across renders and capture
only confirmed source updates. These are the same existing core objects, not
new wrapper packages. Do not subscribe to replay and then re-capture it.

React Native can use the DOM-free engine where the required license Web Crypto,
`TextEncoder`, `AbortController`, and UUID/clock runtime facilities are provided;
inject `idGenerator` if needed. The web panel is **not a native component**, and
this first release does not claim device validation of a native history UI.

## Security and retention

History may contain deleted personal data, old assignments and confidential
fields. Permission-filter at the server before exposing records to a browser.
Keep secrets and provider tokens out of snapshots. Export only with explicit
authorization and redaction. `getHistory()` is not an anonymized diagnostic
bundle. Browser freezes are not secure storage, encryption or tamper evidence.
Apply your own retention/deletion policy and storage controls. Reconstructing
state requires captured revisions; Time Machine cannot recover uncaptured past
changes or guarantee an accurate history when clients omit updates.
