import { Component, computed, input, output, signal } from '@angular/core';
import type { CalendarOptionChanges } from '@wts-calendar/core';
import {
  controlId,
  controlValue,
  controlsForView,
  runtimeChange,
  controlAvailable,
  RUNTIME_PACKAGE_VERSION,
  type RuntimeControl,
  type RuntimeSnapshot,
} from './runtime-option-schema';

@Component({
  selector: 'app-runtime-options',
  template: `
    <section class="runtime-options">
      <header class="runtime-options-header">
        <div>
          <span class="eyebrow">CONFIGURATION</span>
          <h2>Configurable options</h2>
        </div>
        <span>{{ controls().length }} for this view</span>
      </header>
      <div class="runtime-options-content">
        <p>Changes apply immediately through <code>calendar.setOptions()</code>.</p>
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
          Reset keeps the current view, date, and event edits. Localization and time zone stay in
          the Customization sidebar. Search checks every group for this view.
        </p>
        @for (group of groups(); track group.name) {
          <fieldset [disabled]="!options()">
            <legend>{{ group.name }}</legend>
            <div class="runtime-options-grid">
              @for (control of group.controls; track id(control)) {
                <div class="runtime-option" [attr.data-runtime-option]="id(control)">
                  @if (control.preset === 'business-hours-days') {
                    <span class="runtime-option-label">{{ control.label }}</span>
                  } @else {
                    <label [for]="'runtime-' + id(control)">{{ control.label }}</label>
                  }
                  @if (control.preset === 'business-hours-days') {
                    <div
                      class="runtime-weekdays"
                      [id]="'runtime-' + id(control)"
                      role="group"
                      aria-label="Business days"
                      [attr.aria-describedby]="'runtime-help-' + id(control)"
                    >
                      @for (day of weekdays; track day.value) {
                        <label [attr.title]="day.label">
                          <input
                            type="checkbox"
                            [checked]="weekdayChecked(day.value)"
                            [disabled]="!businessHoursEnabled()"
                            (change)="changeWeekday(control, day.value, $event)"
                          />
                          <span>{{ day.short }}</span>
                        </label>
                      }
                    </div>
                  } @else if (
                    control.preset === 'business-hours-start' ||
                    control.preset === 'business-hours-end'
                  ) {
                    <input
                      class="runtime-time"
                      type="text"
                      inputmode="numeric"
                      maxlength="5"
                      placeholder="HH:mm"
                      [id]="'runtime-' + id(control)"
                      [value]="rawValue(control)"
                      [disabled]="!businessHoursEnabled()"
                      [attr.aria-describedby]="'runtime-help-' + id(control)"
                      (change)="change(control, $event)"
                    />
                  } @else if (control.choices; as choices) {
                    <select
                      [id]="'runtime-' + id(control)"
                      [value]="value(control)"
                      [disabled]="!available(control)"
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
                  @if (!available(control)) {
                    <p>
                      Unavailable in core {{ packageVersion }}.
                      <a href="docs/appearance">Appearance guide →</a>
                    </p>
                  }
                  @if (validationTarget() === id(control)) {
                    <p class="runtime-validation" role="alert">{{ validationError() }}</p>
                  }
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
    </section>
  `,
})
export class RuntimeOptions {
  readonly available = controlAvailable;
  readonly packageVersion = RUNTIME_PACKAGE_VERSION;
  readonly demoId = input.required<string>();
  readonly view = input.required<string>();
  readonly options = input<RuntimeSnapshot | null>(null);
  readonly changed = input(false);
  readonly apply = output<CalendarOptionChanges>();
  readonly reset = output<void>();
  readonly query = signal('');
  readonly selectedGroup = signal('all');
  readonly validationError = signal('');
  readonly validationTarget = signal('');
  readonly weekdays = [
    { value: 1, short: 'M', label: 'Monday' },
    { value: 2, short: 'T', label: 'Tuesday' },
    { value: 3, short: 'W', label: 'Wednesday' },
    { value: 4, short: 'T', label: 'Thursday' },
    { value: 5, short: 'F', label: 'Friday' },
    { value: 6, short: 'S', label: 'Saturday' },
    { value: 0, short: 'S', label: 'Sunday' },
  ] as const;
  readonly controls = computed(() => controlsForView(this.demoId(), this.view()));
  readonly groupNames = computed(() => [
    ...new Set(this.controls().map((control) => control.group)),
  ]);
  readonly groupValue = computed(() =>
    ['recommended', 'all', ...this.groupNames()].includes(this.selectedGroup())
      ? this.selectedGroup()
      : 'all',
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
  rawValue(control: RuntimeControl): string {
    return String(controlValue(this.options(), control, this.view()) ?? '');
  }
  checked(control: RuntimeControl): boolean {
    return controlValue(this.options(), control) === true;
  }
  businessHoursEnabled(): boolean {
    const control = this.controls().find((item) => item.preset === 'business-hours-policy');
    return control ? this.checked(control) : false;
  }
  weekdayChecked(day: number): boolean {
    const control = this.controls().find((item) => item.preset === 'business-hours-days');
    const value = control ? controlValue(this.options(), control) : [];
    return Array.isArray(value) && value.includes(day);
  }
  knownValue(control: RuntimeControl): boolean {
    return Boolean(
      control.choices?.some((choice) => this.encoded(choice.value) === this.value(control)),
    );
  }
  change(control: RuntimeControl, event: Event): void {
    if (!controlAvailable(control)) return;
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value =
      control.preset === 'business-hours-start' || control.preset === 'business-hours-end'
        ? target.value
        : control.choices
          ? control.choices.find((choice) => this.encoded(choice.value) === target.value)?.value
          : (target as HTMLInputElement).checked;
    if (!this.options()) return;
    this.applyControl(control, value);
    // Rejected API updates must not leave the input displaying an unapplied
    // value. Successful changes are rebound from the next API snapshot.
    if (control.preset === 'business-hours-start' || control.preset === 'business-hours-end')
      target.value = this.rawValue(control);
    else if (control.choices) target.value = this.value(control);
    else (target as HTMLInputElement).checked = this.checked(control);
  }
  changeWeekday(control: RuntimeControl, day: number, event: Event): void {
    if (!this.options()) return;
    const target = event.target as HTMLInputElement;
    const current = Array.isArray(controlValue(this.options(), control))
      ? (controlValue(this.options(), control) as number[])
      : [];
    const days = new Set(current);
    if (target.checked) days.add(day);
    else days.delete(day);
    this.applyControl(control, [...days]);
    target.checked = this.weekdayChecked(day);
  }
  private applyControl(control: RuntimeControl, value: unknown): void {
    try {
      this.apply.emit(runtimeChange(control, value, this.options()));
      this.validationError.set('');
      this.validationTarget.set('');
    } catch (error) {
      this.validationError.set(error instanceof Error ? error.message : String(error));
      this.validationTarget.set(this.id(control));
    }
  }
}
