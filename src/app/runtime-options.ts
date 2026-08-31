import { Component, computed, input, output, signal } from '@angular/core';
import type { CalendarOptionChanges } from '@wts-calendar/core';
import {
  controlId,
  controlValue,
  controlsForView,
  runtimeChange,
  type RuntimeControl,
  type RuntimeSnapshot,
} from './runtime-option-schema';

@Component({
  selector: 'app-runtime-options',
  template: `
    <details class="runtime-options" [open]="demoId() === 'themes'">
      <summary>
        Configure live options <span>{{ controls().length }} options for this view</span>
      </summary>
      <div class="runtime-options-content">
        <p>
          Changes apply immediately through <code>calendar.setOptions()</code>. Switch views to
          explore their relevant options.
        </p>
        <div class="runtime-options-actions">
          <label class="runtime-search"
            >Find an option
            <input
              type="search"
              placeholder="Try slotDuration, weekends, theme…"
              [value]="query()"
              (input)="query.set($any($event.target).value)"
            />
          </label>
          <label class="runtime-group"
            >Option group
            <select
              aria-label="Option group"
              [value]="groupValue()"
              [disabled]="!!query().trim()"
              (change)="selectedGroup.set($any($event.target).value)"
            >
              <option value="recommended">Example options</option>
              <option value="all">All options</option>
              @for (group of groupNames(); track group) {
                <option [value]="group">{{ group }}</option>
              }
            </select>
          </label>
          <button type="button" (click)="reset.emit()" [disabled]="!options() || !changed()">
            Reset options
          </button>
        </div>
        <p class="runtime-reset-note">
          Reset keeps the current view, date, and event edits. Language and time-zone controls stay
          in their dedicated examples. Search checks every group for this view.
        </p>
        @for (group of groups(); track group.name) {
          <fieldset [disabled]="!options()">
            <legend>{{ group.name }}</legend>
            <div class="runtime-options-grid">
              @for (control of group.controls; track id(control)) {
                <div class="runtime-option" [attr.data-runtime-option]="id(control)">
                  <label [for]="'runtime-' + id(control)">{{ control.label }}</label>
                  @if (control.choices; as choices) {
                    <select
                      [id]="'runtime-' + id(control)"
                      [value]="value(control)"
                      [attr.aria-describedby]="'runtime-help-' + id(control)"
                      (change)="change(control, $event)"
                    >
                      @if (!knownValue(control)) {
                        <option [value]="value(control)" selected disabled>
                          Current: {{ value(control) }}
                        </option>
                      }
                      @for (choice of choices; track encoded(choice.value)) {
                        <option
                          [value]="encoded(choice.value)"
                          [selected]="encoded(choice.value) === value(control)"
                        >
                          {{ choice.label }}
                        </option>
                      }
                    </select>
                  } @else {
                    <input
                      type="checkbox"
                      [id]="'runtime-' + id(control)"
                      [checked]="checked(control)"
                      [attr.aria-describedby]="'runtime-help-' + id(control)"
                      (change)="change(control, $event)"
                    />
                  }
                  <p [id]="'runtime-help-' + id(control)">
                    <code>{{ id(control) }}</code> · {{ control.help }}
                  </p>
                </div>
              }
            </div>
          </fieldset>
        } @empty {
          <p class="runtime-empty" role="status">
            No matching options for this view. Try another view or
            <button type="button" (click)="query.set('')">clear the search</button>.
          </p>
        }
      </div>
    </details>
  `,
})
export class RuntimeOptions {
  readonly demoId = input.required<string>();
  readonly view = input.required<string>();
  readonly options = input<RuntimeSnapshot | null>(null);
  readonly changed = input(false);
  readonly apply = output<CalendarOptionChanges>();
  readonly reset = output<void>();
  readonly query = signal('');
  readonly selectedGroup = signal('recommended');
  readonly controls = computed(() => controlsForView(this.demoId(), this.view()));
  readonly groupNames = computed(() => [
    ...new Set(this.controls().map((control) => control.group)),
  ]);
  readonly groupValue = computed(() =>
    ['recommended', 'all', ...this.groupNames()].includes(this.selectedGroup())
      ? this.selectedGroup()
      : 'recommended',
  );
  readonly recommendedGroup = computed(() => {
    if (this.demoId() === 'themes') return 'Appearance';
    if (this.demoId() === 'render-hooks') return 'Events';
    return (
      [
        'Interaction',
        'Data source',
        'Multi-month',
        'Time grid',
        'List',
        'Month grid',
        'Layout',
      ].find((group) => this.groupNames().includes(group)) ?? 'Layout'
    );
  });
  readonly groups = computed(() => {
    const query = this.query().trim().toLowerCase();
    const group = this.groupValue() === 'recommended' ? this.recommendedGroup() : this.groupValue();
    const groups = new Map<string, RuntimeControl[]>();
    for (const control of this.controls()) {
      if (!query && group !== 'all' && control.group !== group) continue;
      if (
        query &&
        ![controlId(control), control.label, control.help, control.group]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
        continue;
      const list = groups.get(control.group) ?? [];
      list.push(control);
      groups.set(control.group, list);
    }
    return [...groups].map(([name, controls]) => ({ name, controls }));
  });
  readonly id = controlId;
  encoded(value: unknown): string {
    return JSON.stringify(value) ?? '';
  }
  value(control: RuntimeControl): string {
    return this.encoded(controlValue(this.options(), control, this.view()));
  }
  checked(control: RuntimeControl): boolean {
    return controlValue(this.options(), control) === true;
  }
  knownValue(control: RuntimeControl): boolean {
    return Boolean(
      control.choices?.some((choice) => this.encoded(choice.value) === this.value(control)),
    );
  }
  change(control: RuntimeControl, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = control.choices
      ? control.choices.find((choice) => this.encoded(choice.value) === target.value)?.value
      : (target as HTMLInputElement).checked;
    if (!this.options()) return;
    this.apply.emit(runtimeChange(control, value));
    // Rejected API updates must not leave the input displaying an unapplied
    // value. Successful changes are rebound from the next API snapshot.
    if (control.choices) target.value = this.value(control);
    else (target as HTMLInputElement).checked = this.checked(control);
  }
}
