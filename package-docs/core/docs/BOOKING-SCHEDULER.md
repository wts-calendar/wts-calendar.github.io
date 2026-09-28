# Headless booking workflow

`CalendarBookingScheduler` is the Premium, UI-independent booking coordinator
exported by `@wts-calendar/core/availability-scheduling`. It complements the
rendered calendar and `calculateAvailableSlots()`; it does not create forms,
dialogs, pages, or backend records.

## Included policies

- Minimum booking notice and configurable slot duration
- Global/resource working hours and exact unavailable ranges
- Event buffers and conflict prevention
- Calendar and customer IANA time-zone projections
- Form transformation and validation hooks
- Pending, confirmed, approved, rejected, and cancelled states
- Reschedule and cancellation operations
- Manual resource/staff selection
- Deterministic round-robin assignment
- Weighted capacity/group bookings
- Before-action, after-action, status, action-specific, and error callbacks
- Immutable reads for a fully custom/headless interface

All operations require a backend-verified package-wide Premium session with the
`availability-scheduling` capability. This does not add per-feature backend
grants; the installed package defines the capability set.

## Construction

```typescript
import {
  CalendarBookingScheduler,
} from '@wts-calendar/core/availability-scheduling';

const bookings = new CalendarBookingScheduler({
  license,
  origin: window.location.origin,
  timeZone: 'Europe/London',
  businessHours: true,
  unavailable: companyClosures,
  slotDuration: {
    defaultMinutes: 30,
    allowedMinutes: [15, 30, 60],
  },
  minimumNoticeMinutes: 60,
  eventBufferBeforeMinutes: 10,
  eventBufferAfterMinutes: 10,
  resources: staff,
  events: existingCalendarEvents,
  appointments: restoredAppointments,
  roundRobinCursor: restoredCursor,
  persistenceAdapter: {
    load: (signal) => api.loadBookingState({ signal }),
    commit: ({ action, appointment, expectedRevision, idempotencyKey, signal }) =>
      api.commitBooking({
        action,
        appointment,
        expectedRevision,
        idempotencyKey,
        signal,
      }),
  },
  hooks: {
    transform: (request) => sanitizeBookingForm(request),
    validate: ({ request }) => validateBookingForm(request),
    beforeAction: ({ action, appointment }) => authorize(action, appointment),
    afterAction: ({ action, appointment }) => updateAnalytics(action, appointment),
    onError: ({ action, error }) => reportBookingFailure(action, error),
  },
});
```

The optional persistence adapter is implemented by the consuming application;
WTS does not provide or require a backend. Adapter commits run before local
state changes. A thrown error, `{ status: 'conflict' }`, or
`{ status: 'rejected' }` leaves the scheduler's previous state intact. Reuse a
command's `idempotencyKey` when the host retries it, and return storage
`revision` values for optimistic concurrency.

Use `afterAction` for notifications, analytics, and UI effects—not primary
persistence. Adapter callbacks receive the caller's `AbortSignal`.

`getAvailableSlots()` uses the constructor defaults and current active
appointments. When no `resourceId` is supplied, it returns a sorted union for
all configured resources. `customerTimeZone` adds customer-facing ISO strings
without changing stored instants or resource availability rules.

## Appointment lifecycle

```typescript
const pending = await bookings.create({
  title: 'Demo',
  start: '2026-10-01T09:00:00',
  durationMinutes: 30,
  customerTimeZone: 'Asia/Kolkata',
  assignment: { mode: 'round-robin', resourceIds: ['sam', 'lee'] },
  requestedUnits: 1,
  requiresApproval: true,
  formValues: { email: 'buyer@example.com' },
});

await bookings.confirm(pending.id);
await bookings.approve(pending.id);
await bookings.reschedule(pending.id, {
  start: '2026-10-01T10:00:00',
  durationMinutes: 30,
});
await bookings.cancel(pending.id, 'Customer requested cancellation');
```

Active appointments reserve capacity. Rejected and cancelled appointments stay
in history but stop reserving it. Round-robin cursors advance only after a
successful commit, so failed and rejected requests do not consume a turn.

## State, external updates, and UI change listeners

```typescript
const stopListening = bookings.onChange(({ action, state }) => {
  renderBookingUI(action, state.appointments);
});

const state = bookings.exportState();
await bookings.importState(state);
await bookings.syncAppointments(recordsFromApi, {
  mode: 'replace',
  roundRobinCursor: cursorFromApi,
});

// When the component unmounts:
stopListening();
```

`onChange` is a local event listener; it is unrelated to billing or paid
subscriptions. State snapshots include the round-robin cursor so assignment
order can resume after reload. `syncAppointments()` is serialized with booking
mutations and supports authoritative replacement or incremental merge/removal.

For custom form feedback, `evaluateBooking()` returns `valid` plus structured
issues without changing state. Mutation errors expose the same issue codes.
Create, confirm, approve, reject, reschedule, cancel, evaluate, and hydrate
accept standard `AbortSignal` command options.

## Conflict boundary

The scheduler serializes mutations and performs the final availability check
immediately before each local commit. The optional adapter gives the consuming
application a formal place to perform an atomic server transaction and return a
structured conflict. The package itself remains backend-neutral: separate
browsers or servers are atomic only when the consumer's adapter enforces the
final time/resource/capacity constraint.

## Compatibility

This feature is additive. Standard imports, rendered views, existing event and
resource options, `calculateAvailableSlots()`, and older package versions keep
their existing behavior. Applications opt in only by importing the Premium
subpath and constructing the scheduler.
