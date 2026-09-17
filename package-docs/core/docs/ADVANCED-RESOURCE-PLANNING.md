# Advanced resource planning

`@wts-calendar/core/advanced-resource-planning` is an optional premium runtime
engine. It requires verified package-wide Premium access (`advanced-resource-planning` capability),
is excluded from the standard entry, and never sends or stores the resources,
events, profiles, or demand records supplied to it.

To obtain the entitlement, follow [Premium licensing](PREMIUM-LICENSING.md).

```ts
import { connectCalendarLicense } from '@wts-calendar/core';
import { AdvancedResourcePlanner } from
  '@wts-calendar/core/advanced-resource-planning';

const license = await connectCalendarLicense({
  licenseKey: deploymentConfig.licenseKey,
});
const planner = new AdvancedResourcePlanner({
  license,
  timeZone: 'Asia/Kolkata',
  resources: [
    {
      id: 'laser-1',
      title: 'Laser 1',
      capacity: 2,
      assignmentPolicy: { skills: ['precision-cutting'] },
    },
    { id: 'laser-2', title: 'Laser 2', capacity: 2 },
    { id: 'operator', title: 'Operator', capacity: 1 },
  ],
  events: calendar.getEvents(),
  profiles: [{
    resourceId: 'laser-1',
    shifts: [
      { id: 'morning', daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '12:00' },
      { id: 'evening', daysOfWeek: [1, 2, 3, 4, 5], startTime: '13:00', endTime: '17:00' },
    ],
    dependencies: [{ resourceId: 'operator', units: 1 }],
    substituteIds: ['laser-2'],
    overbooking: {
      mode: 'warn',
      maxUtilizationPercent: 100,
      reserveUnits: 0.25,
    },
  }],
});
```

Outside a browser, pass the licensed `origin` explicitly. In a browser the
current `location.origin` is used by default.

## Capacity and utilization heatmaps

```ts
const heatmap = planner.createCapacityHeatmap({
  start: '2026-08-24T08:00:00',
  end: '2026-08-24T18:00:00',
  bucketMinutes: 30,
});
```

Every resource/bucket cell reports configured and policy-adjusted capacity,
peak booked units, remaining units, utilization, active shift IDs, and one of
`unconfigured`, `closed`, `idle`, `balanced`, `high`, or `over`.

## Split shifts and rotations

Multiple shift definitions create a split day. An overnight shift has an end
time earlier than its start time. `24:00` is also supported. Rotations repeat
from a zone-aware anchor date:

```ts
const rotatingShift = {
  id: 'two-on-two-off',
  startTime: '20:00',
  endTime: '04:00',
  rotation: {
    anchor: '2026-08-24',
    cycleDays: 4,
    activeDays: [0, 1],
  },
};

const occurrences = planner.getShiftOccurrences(
  'laser-1',
  '2026-08-24',
  '2026-09-01',
);
```

Effective start/end boundaries and named-zone DST transitions use the same date
policy as calendar views.

## Dependencies, substitutes, and overbooking

```ts
const decision = planner.evaluateBooking({
  resourceId: 'laser-1',
  start: '2026-08-24T10:00:00',
  end: '2026-08-24T11:30:00',
  units: 1,
  requirements: { skills: ['precision-cutting'] },
});

const alternatives = planner.findSubstitutes({
  resourceId: 'laser-1',
  start: '2026-08-24T10:00:00',
  end: '2026-08-24T11:30:00',
  units: 1,
});
```

Working hours, blackouts, shifts, event type, skills, roles, dependencies, and
capacity are evaluated together. Overbooking mode is `block`, `warn`, or
`allow`; every result retains a typed issue and severity so applications can
explain the decision. Allowed substitutes are ranked by projected utilization
and then stable resource ID.

## Demand forecasting

```ts
const forecast = planner.forecastDemand({
  start: '2026-08-24T08:00:00',
  end: '2026-08-31T18:00:00',
  bucketMinutes: 60,
  demand: projectedOrders.map((order) => ({
    start: order.windowStart,
    end: order.windowEnd,
    units: order.requiredUnits,
    resourceId: order.resourceId,
  })),
});
```

Buckets report peak demand, already scheduled load, net available units,
shortfall, coverage, and `covered`, `at-risk`, or `shortfall` state. This is a
deterministic capacity forecast, not an opaque statistical prediction.

## Timeline dependencies and critical paths

```ts
const analysis = planner.analyzeCriticalPath([
  { id: 'design', durationMinutes: 90 },
  { id: 'cut', durationMinutes: 180, dependencyIds: ['design'], resourceIds: ['laser-1'] },
  { id: 'inspect', durationMinutes: 45, dependencyIds: ['cut'] },
]);
```

The result contains project duration, one deterministic critical path, and
earliest/latest times, total float, resource IDs, and a critical indicator for
every task. Unknown dependencies, duplicate IDs, invalid durations, and cycles
fail before an analysis is returned.

## Runtime refresh

Use `setData({ resources, events, profiles })` after application state changes.
Inputs are copied, results are immutable, and no backend is required. The host
application remains responsible for persistence, authorization, multi-user
coordination, and final server-side enforcement when it has a server.
