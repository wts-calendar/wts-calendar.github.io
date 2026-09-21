# Enterprise workflow

`@wts-calendar/core/enterprise-workflow` is an explicit premium runtime for
governed calendar mutations. It provides configurable state machines,
multi-stage approvals, field-level policies, optimistic/offline queues,
hash-chained audit history, and a backend-neutral adapter contract.

The entry requires verified package-wide Premium access (`enterprise-workflow` capability).
It is not loaded by the standard entry or by `/all`, and it does not contact a
WTS service. Applications supply actors, rules, events, and any persistence or
transport adapter.

To obtain the entitlement, follow [Premium licensing](PREMIUM-LICENSING.md).

```ts
import {
  EnterpriseCalendarWorkflow,
  type EnterpriseWorkflowBackendAdapter,
} from '@wts-calendar/core/enterprise-workflow';

const backend: EnterpriseWorkflowBackendAdapter = {
  async sendMutation({ mutation, actor, record }, signal) {
    const response = await fetch('/api/calendar/workflow', {
      method: 'POST',
      signal,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mutation, actor, record }),
    });
    if (response.status === 409) {
      return { status: 'conflict', message: 'The event changed remotely.' };
    }
    if (!response.ok) return { status: 'retry', message: response.statusText };
    return { status: 'committed', record: await response.json() };
  },
  async persistQueue(queue) {
    await savePendingMutations(queue);
  },
  async persistAudit(entry) {
    await appendAuditEntry(entry);
  },
};

const workflow = new EnterpriseCalendarWorkflow({
  license,
  actor: { id: currentUser.id, roles: currentUser.roles },
  events,
  online: navigator.onLine,
  backend,
  defaultStateMachineId: 'booking',
  stateMachines: [{
    id: 'booking',
    initialState: 'draft',
    states: ['draft', 'review', 'approved', 'cancelled'],
    transitions: [
      {
        name: 'submit',
        from: 'draft',
        to: 'review',
        approvalFlowId: 'booking-approval',
      },
      { name: 'approve', from: 'review', to: 'approved' },
      { name: 'cancel', from: ['draft', 'review'], to: 'cancelled' },
    ],
  }],
  approvalFlows: [{
    id: 'booking-approval',
    stages: [
      {
        id: 'operations',
        mode: 'all',
        approverRoles: ['manager', 'capacity-owner'],
        onEnter: ({ mutation }) => notifyReviewers(mutation),
      },
      {
        id: 'director',
        approverRoles: ['director'],
      },
    ],
  }],
  permissionPolicies: [
    {
      id: 'editors-can-propose',
      effect: 'allow',
      actions: ['create', 'update', 'transition', 'cancel', 'flush'],
      roles: ['editor'],
    },
    {
      id: 'resource-is-managed',
      effect: 'deny',
      actions: ['update'],
      roles: ['editor'],
      fields: ['resourceId'],
    },
    {
      id: 'reviewers-can-decide',
      effect: 'allow',
      actions: ['approve', 'reject'],
      roles: ['manager', 'capacity-owner', 'director'],
    },
  ],
  defaultPermission: 'deny',
});
```

## State machines and approvals

Every event can use the configured default machine or select one through
`extendedProps.workflow.machineId`. The current state and version are exposed
in `EnterpriseWorkflowEventRecord`; optimistic records also mirror those values
under `extendedProps.workflow`.

Transition guards run before a mutation is accepted. A transition can reference
an approval flow, and callers can also assign a flow directly to create,
update, or delete requests. Stages support:

- `mode: 'any'`: one matching actor completes the stage.
- `mode: 'all'`: every configured actor and role selector needs a matching
  approval. One approval may satisfy every selector it matches.
- `approverIds` and `approverRoles` for exact and role-based routing.
- `onEnter`, `onApprove`, `onReject`, and `onLeave` stage hooks.
- `onComplete` and `onReject` flow hooks.

Use the per-call actor argument when different people act on the same workflow:

```ts
const mutation = await workflow.submit({
  type: 'transition',
  eventId: 'booking-42',
  transition: 'submit',
}, editorActor);

await workflow.approve(mutation.id, managerActor);
await workflow.approve(mutation.id, capacityOwnerActor);
await workflow.approve(mutation.id, directorActor);
```

A hook may return `false` or throw to deny progression. Entry-hook failure and
post-approval hook failure roll back the optimistic record, settle the mutation
as failed, and append failure and rollback audit actions. Hook side effects are
customer-owned; make them idempotent because an application or transport can
retry around failures.

## Permission and field policies

Policies match actions, actor IDs, roles, event states, top-level fields, and an
optional `when` predicate. Deny rules take precedence. `defaultPermission`
defaults to `deny`.

```ts
const decision = workflow.permissionDecision(
  'update',
  workflow.getEvent('booking-42')?.event,
  ['title', 'resourceId'],
  editorActor,
);
```

The engine enforces these rules before accepting its own mutations. They are a
client-side capability and user-experience boundary, not a substitute for
authorization: a customer backend must authenticate the actor, re-evaluate
permissions and transitions, validate versions, and reject forged requests.

## Optimistic and offline queue

Accepted mutations update the runtime event snapshot immediately. Mutations
without approval are queued; mutations with a flow stay `pending-approval`
until the last stage completes. Only one unsettled mutation per event is
allowed, preventing ambiguous rollback ordering.

```ts
workflow.setOnline(false);
await workflow.submit({
  type: 'update',
  eventId: 'booking-42',
  changes: { title: 'Revised booking' },
});

workflow.setOnline(true);
await workflow.flush({ signal: abortController.signal }, currentActor);
```

`autoFlush` defaults to `true`. Set it to `false` when the application wants to
control synchronization explicitly. Network exceptions and adapter `retry`
results return the mutation to `queued` until `maxAttempts` is reached. Backend
`conflict` or `rejected` results, cancellation, exhausted attempts, and approval
rejection roll back to the captured pre-mutation record.

The optional `persistQueue` callback receives frozen snapshots after queue
changes. Store them in IndexedDB, an encrypted application store, or a customer
service as appropriate. The engine intentionally does not choose a database,
authentication scheme, or queue transport.

## Backend adapters

`EnterpriseWorkflowBackendAdapter` is deliberately transport-neutral:

- `sendMutation(context, signal)` bridges REST, GraphQL, RPC, message queues,
  local-first storage, or another customer system.
- `persistQueue(queue)` can durably retain pending work.
- `persistAudit(entry)` can append audit evidence to a customer-owned ledger.

The result contract supports `committed`, `conflict`, `rejected`, and `retry`.
A committed result may return the backend's canonical event record, allowing
the server to assign a new version or normalize event data.

## Audit integrity

Each audit entry is an immutable snapshot containing sequence, actor, roles,
action, mutation/event IDs, details, the previous hash, and its own SHA-256
hash. Appends are serialized, and `verifyAuditHistory()` detects reordered,
removed, or modified entries in the supplied chain.

```ts
const history = workflow.getAuditHistory();
const intact = await workflow.verifyAuditHistory(history);
```

Hash chaining detects tampering; it does not make browser memory durable or
protect a chain if an attacker can replace the entire history. For regulated
use, send entries to an append-only, access-controlled customer store and
anchor or sign checkpoints outside the browser.

## Calendar integration

The workflow engine is UI-independent. Render its optimistic snapshots through
the existing calendar API and refresh from `subscribe`:

```ts
const applyWorkflowEvents = () => {
  calendar.setEvents(workflow.getEvents().map(({ event }) => event));
};

applyWorkflowEvents();
const unsubscribe = workflow.subscribe(applyWorkflowEvents);
```

Unsubscribe during application teardown. The engine never mutates a
`WtsCalendar` instance implicitly, so applications can choose notifications,
pending indicators, conflict UI, and reconciliation behavior.
