import { CalendarDateAdapter, type CalendarEventCreateInput, type CalendarEventInput } from '@wts-calendar/core';
import type {
  CalendarEventEditorOptions,
  CalendarEventEditorValues,
} from '@wts-calendar/core/event-editor';

// Core 1.1.4 has recurrence support in its event model, but not in its editor UI.
// This bridge keeps the local example usable until the native editor controls ship.
type Frequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'annually';
type RecurrenceDraft = {
  frequency: Frequency;
  interval: number;
  daysOfWeek: number[];
  endDate: string;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FIELD = 'recurrenceBridge';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function dayOfWeek(values: Readonly<CalendarEventEditorValues>): number {
  try {
    const adapter = new CalendarDateAdapter(values.timeZone);
    return adapter.dayOfWeek(adapter.parse(values.start));
  } catch {
    return 0;
  }
}

function initialDraft(
  values: Readonly<CalendarEventEditorValues>,
  event?: Readonly<CalendarEventInput>,
): RecurrenceDraft {
  const existing = values.custom[FIELD] as RecurrenceDraft | undefined;
  if (existing && typeof existing === 'object') return existing;
  const recurring = event?.recurring;
  if (!recurring) {
    return { frequency: 'none', interval: 1, daysOfWeek: [dayOfWeek(values)], endDate: '' };
  }
  const endDate = recurring.endDate
    ? (() => {
        const parts = new CalendarDateAdapter(values.timeZone).parts(recurring.endDate!);
        return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
      })()
    : '';
  return {
    frequency: recurring.frequency,
    interval: recurring.interval ?? 1,
    daysOfWeek: (recurring.daysOfWeek ?? [dayOfWeek(values)]).map(Number),
    endDate,
  };
}

function parseDraft(raw: string | boolean): RecurrenceDraft {
  const value = JSON.parse(String(raw)) as RecurrenceDraft;
  return {
    frequency: value.frequency,
    interval: Number(value.interval),
    daysOfWeek: Array.isArray(value.daysOfWeek) ? value.daysOfWeek.map(Number) : [],
    endDate: value.endDate ?? '',
  };
}

export function recurrenceEditorBridge(): Pick<
  CalendarEventEditorOptions,
  'customFields' | 'mapToEvent'
> {
  return {
    customFields: [{
      name: FIELD,
      label: 'Recurrence',
      render(value, context) {
        const document = context.document;
        const wrapper = document.createElement('fieldset');
        wrapper.className = 'example-recurrence-editor';
        const legend = document.createElement('legend');
        legend.textContent = 'Recurrence';
        wrapper.append(legend);

        if (context.event?.rrule) {
          const note = document.createElement('p');
          note.textContent = 'This event uses a custom RRULE. Edit its rule in your event source.';
          wrapper.append(note);
          return wrapper;
        }

        const draft = value && typeof value === 'object'
          ? value as RecurrenceDraft
          : initialDraft(context.values, context.event);
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = `custom.${FIELD}`;
        const repeatLabel = document.createElement('label');
        repeatLabel.textContent = 'Repeat';
        const frequency = document.createElement('select');
        frequency.setAttribute('aria-label', 'Repeat');
        for (const [id, title] of [
          ['none', 'Does not repeat'],
          ['daily', 'Daily'],
          ['weekly', 'Weekly'],
          ['monthly', 'Monthly'],
          ['annually', 'Yearly'],
        ] as const) {
          const option = document.createElement('option');
          option.value = id;
          option.textContent = title;
          frequency.append(option);
        }
        frequency.value = draft.frequency;
        repeatLabel.append(frequency);

        const intervalLabel = document.createElement('label');
        intervalLabel.textContent = 'Repeat every';
        const interval = document.createElement('input');
        interval.type = 'number';
        interval.min = '1';
        interval.step = '1';
        interval.value = String(draft.interval);
        intervalLabel.append(interval);

        const endLabel = document.createElement('label');
        endLabel.textContent = 'Ends on (optional)';
        const end = document.createElement('input');
        end.type = 'date';
        end.value = draft.endDate;
        endLabel.append(end);

        const weekdays = document.createElement('div');
        weekdays.className = 'example-recurrence-weekdays';
        weekdays.setAttribute('role', 'group');
        weekdays.setAttribute('aria-label', 'Repeat on');
        const dayInputs: HTMLInputElement[] = [];
        DAYS.forEach((day, index) => {
          const label = document.createElement('label');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = String(index);
          checkbox.checked = draft.daysOfWeek.includes(index);
          dayInputs.push(checkbox);
          label.append(checkbox, document.createTextNode(day));
          weekdays.append(label);
        });
        const sync = () => {
          const current: RecurrenceDraft = {
            frequency: frequency.value as Frequency,
            interval: Number(interval.value),
            daysOfWeek: dayInputs.filter((input) => input.checked).map((input) => Number(input.value)),
            endDate: end.value,
          };
          hidden.value = JSON.stringify(current);
          const repeats = current.frequency !== 'none';
          intervalLabel.hidden = !repeats;
          endLabel.hidden = !repeats;
          weekdays.hidden = current.frequency !== 'weekly';
          if (repeats && current.frequency === 'weekly' && !current.daysOfWeek.length) {
            const defaultDay = dayOfWeek(context.values);
            dayInputs[defaultDay]!.checked = true;
            current.daysOfWeek = [defaultDay];
            hidden.value = JSON.stringify(current);
          }
        };
        frequency.addEventListener('change', sync);
        interval.addEventListener('input', sync);
        end.addEventListener('change', sync);
        dayInputs.forEach((input) => input.addEventListener('change', sync));
        wrapper.append(hidden, repeatLabel, intervalLabel, endLabel, weekdays);
        sync();
        return wrapper;
      },
      parse: parseDraft,
      validate(value, context) {
        const draft = value as RecurrenceDraft | undefined;
        if (!draft || draft.frequency === 'none') return true;
        if (!Number.isInteger(draft.interval) || draft.interval < 1) {
          return 'Repeat every must be a positive whole number.';
        }
        if (draft.frequency === 'weekly' && !draft.daysOfWeek.length) {
          return 'Select at least one weekday for a weekly event.';
        }
        if (draft.endDate && draft.endDate < context.values.start.slice(0, 10)) {
          return 'The recurrence end date cannot be before the event start date.';
        }
        return true;
      },
    }],
    mapToEvent(values, context): CalendarEventCreateInput {
      const input: CalendarEventCreateInput = { ...context.eventInput } as CalendarEventCreateInput;
      const draft = values.custom[FIELD] as RecurrenceDraft | undefined;
      if (input.meta) {
        input.meta = { ...input.meta };
        delete input.meta[FIELD];
      }
      if (input.extendedProps) {
        input.extendedProps = { ...input.extendedProps };
        delete input.extendedProps[FIELD];
      }
      if (!draft || context.originalEvent?.rrule) return input;
      if (
        context.action === 'edit' &&
        context.originalEvent?.recurring &&
        values.scope !== 'series'
      ) return input;
      if (draft.frequency === 'none') {
        if (context.action === 'duplicate') {
          delete input.recurring;
          delete input.rrule;
          delete input.recurrenceTimeZone;
        } else if (context.originalEvent?.recurring) input.recurring = false;
        return input;
      }
      const adapter = new CalendarDateAdapter(values.timeZone);
      const start = adapter.parts(input.start!);
      const end = input.end ? adapter.parts(input.end) : undefined;
      const startDate = `${start.year}-${pad(start.month)}-${pad(start.day)}`;
      const recurring: Exclude<CalendarEventInput['recurring'], false | undefined> = {
        frequency: draft.frequency,
        interval: draft.interval,
        startTime: values.allDay ? '00:00' : `${pad(start.hour)}:${pad(start.minute)}`,
        endTime: values.allDay || !end ? undefined : `${pad(end.hour)}:${pad(end.minute)}`,
        startDate,
        endDate: draft.endDate || undefined,
        isAllDay: values.allDay,
      };
      if (draft.frequency === 'weekly') recurring.daysOfWeek = [...draft.daysOfWeek];
      if (draft.frequency === 'monthly') recurring.daysOfMonth = [start.day];
      if (draft.frequency === 'annually') recurring.date = startDate;
      input.recurring = recurring;
      input.recurrenceTimeZone = values.timeZone;
      delete input.rrule;
      return input;
    },
  };
}
