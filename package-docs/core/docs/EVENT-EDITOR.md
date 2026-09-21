# Accessible event editor

`@wts-calendar/core/event-editor` is a free, optional editor for creating, editing,
duplicating, and deleting events. It is excluded from both the standard and
`/all` bundles, so applications pay for it only when they import it.

```ts
import { WtsCalendar } from '@wts-calendar/core';
import { createCalendarEventEditor } from '@wts-calendar/core/event-editor';
import '@wts-calendar/core/styles/event-editor.css'; // optional when injectStyles is true

const calendar = new WtsCalendar({ container, events });
const editor = createCalendarEventEditor(calendar, {
  presentation: 'dialog', // or 'drawer'
  timeZones: ['UTC', 'America/New_York', 'Asia/Kolkata'],
});

calendar.on('event-edit-request', ({ event }) => editor.openEdit(event));
editor.openCreate({ start: new Date(), opener: addButton });
editor.openDelete(event, { opener: deleteButton });
```

The create and duplicate forms include built-in recurrence controls for daily,
weekly, monthly, and yearly events. Developers can set the interval, choose one
or more weekdays for weekly events, and add an optional inclusive end date. The
editor writes the package-native `recurring` event model, so this common flow
does not require the optional RRULE plugin. Existing custom RRULE events remain
read-only at the rule level and continue to use their original rule.

Set `allowRecurrence: false` to hide these controls. The public editor snapshot
and `mapToEvent` values expose `recurrenceFrequency`, `recurrenceInterval`,
`recurrenceDaysOfWeek`, and `recurrenceEndDate` for custom persistence mapping.

The editor uses the calendar's transactional mutation APIs. Successful changes
participate in undo/redo, calendar constraints, async mutation validation, and
mutation lifecycle events. Recurring events expose occurrence, future, and
series scopes. Resource choices come from `calendar.getResources()`, while
wall-clock values are converted with `CalendarDateAdapter` in the selected time
zone.

## Custom typed fields

Custom fields are stored in `meta` and `extendedProps` by default. `parse`,
`format`, and sync or async `validate` functions retain application-specific
types. `mapToEvent` can replace the default mapping.

```ts
type BookingFields = { attendees: number; roomSetup: string };

const editor = createCalendarEventEditor<BookingFields>(calendar, {
  customFields: [
    {
      name: 'attendees',
      label: 'Attendees',
      type: 'number',
      required: true,
      parse: (value) => Number(value),
      validate: (value) => value > 0 || 'Attendees must be positive.',
    },
    {
      name: 'roomSetup',
      label: 'Room setup',
      type: 'select',
      options: [
        { value: 'boardroom', label: 'Boardroom' },
        { value: 'theatre', label: 'Theatre' },
      ],
    },
  ],
});
```

A custom `render` function may return application-owned controls. Give those
controls the name `custom.<field-name>` so the editor can serialize them, and
provide a visible label or an accessible name.

## Persistence, permissions, and conflicts

The editor is backend-neutral. Without a persistence adapter, it updates only
the calendar's runtime state. `authorize` can bridge any permission or workflow
system. `persistence.save` can call REST, GraphQL, local storage, an offline
queue, or the premium enterprise workflow adapter.

```ts
const editor = createCalendarEventEditor(calendar, {
  authorize: async (context) => canEdit(context) || 'Editing is not allowed.',
  persistence: {
    async save(context) {
      const response = await bookingApi.save(context, context.signal);
      if (response.status === 409) {
        return { status: 'conflict', message: 'This booking changed elsewhere.' };
      }
      return response.ok ? 'committed' : 'rejected';
    },
  },
});
```

Persistence is optimistic by default: calendar constraints run locally first,
then a conflict or rejection calls the transaction's `revert()` and keeps the
editor open with an announced error. Set `optimisticPersistence: false` when a
remote preflight must succeed before the local calendar is changed.

## Accessibility contract

The built-in UI provides a labelled modal dialog, visible labels, linked hints,
an assertive error summary, field-level `aria-invalid`, a polite status region,
focus containment, Escape handling, opener focus restoration, 44-pixel minimum
controls, forced-colors support, reduced-motion behavior, and responsive dialog
or drawer layouts. Destructive actions use an explicit confirmation state.

Applications should still run their normal screen-reader/browser acceptance
matrix after changing labels, custom renderers, theme tokens, or host focus
behavior.

## Framework state helpers

The official adapters expose small subscription bridges without bundling the
editor into the adapter:

- React: `useWtsCalendarEventEditorSnapshot(editor)`
- Vue: `useWtsCalendarEventEditorSnapshot(editorRef)`
- Angular: `WtsCalendarAngularEventEditorController`

Call `editor.destroy()` when an application owns the editor directly. Framework
helpers unsubscribe from state; they do not destroy an editor they did not
create.
