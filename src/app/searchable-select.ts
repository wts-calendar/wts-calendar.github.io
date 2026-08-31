import {
  Component,
  ElementRef,
  HostListener,
  Injector,
  ViewChild,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export interface SearchChoice {
  value: string;
  label: string;
  detail?: string;
  keywords?: string;
}

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('en')
    .replace(/[_/\s-]+/g, ' ')
    .trim();
}

@Component({
  selector: 'app-searchable-select',
  host: { class: 'searchable-select', '(focusout)': 'leave($event)' },
  template: `
    <label [for]="controlId()">{{ label() }}</label>
    <div class="searchable-select-field">
      <input
        #searchInput
        [id]="controlId()"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="expanded() ? controlId() + '-list' : null"
        [attr.aria-describedby]="controlId() + '-help'"
        [attr.aria-activedescendant]="
          expanded() && activeChoice() ? controlId() + '-option-' + activeIndex() : null
        "
        [disabled]="disabled()"
        [placeholder]="placeholder()"
        [value]="expanded() ? query() : selectedLabel()"
        (click)="show()"
        (input)="search($any($event.target).value)"
        (keydown)="key($event)"
      />
      <span class="searchable-select-chevron" aria-hidden="true">⌄</span>
      @if (expanded()) {
        <div class="searchable-select-popup">
          <p class="searchable-select-count" role="status" aria-live="polite">
            {{ filtered().length }} {{ filtered().length === 1 ? 'match' : 'matches' }}
          </p>
          <div
            [id]="controlId() + '-list'"
            role="listbox"
            [attr.aria-label]="label()"
            class="searchable-select-list"
          >
            @for (choice of filtered(); track choice.value; let index = $index) {
              <div
                role="option"
                [id]="controlId() + '-option-' + index"
                [attr.aria-selected]="choice.value === value()"
                [class.active]="index === activeIndex()"
                [class.selected]="choice.value === value()"
                (mousedown)="$event.preventDefault()"
                (click)="choose(choice)"
              >
                <bdi>{{ choice.label }}</bdi>
                <small>{{ choice.detail || choice.value }}</small>
              </div>
            }
          </div>
          @if (!filtered().length) {
            <p class="searchable-select-empty">No matches. Try another name or code.</p>
          }
        </div>
      }
    </div>
    <p class="searchable-select-help" [id]="controlId() + '-help'">
      {{ choices().length }} available · Type to search; use ↓ / ↑ and Enter to choose.
    </p>
  `,
})
export class SearchableSelect {
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly choices = input.required<readonly SearchChoice[]>();
  readonly value = input.required<string>();
  readonly disabled = input(false);
  readonly placeholder = input('Search…');
  readonly valueChange = output<string>();
  readonly expanded = signal(false);
  readonly query = signal('');
  readonly activeIndex = signal(0);
  readonly selectedLabel = computed(
    () => this.choices().find((c) => c.value === this.value())?.label ?? this.value(),
  );
  readonly filtered = computed(() => {
    const terms = normalizeSearch(this.query()).split(' ').filter(Boolean);
    return this.choices().filter((choice) => {
      const haystack = normalizeSearch(
        [choice.label, choice.value, choice.keywords].join(' '),
      );
      return terms.every((term) => haystack.includes(term));
    });
  });
  readonly activeChoice = computed(() => this.filtered()[this.activeIndex()]);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  show(): void {
    if (this.disabled() || this.expanded()) return;
    this.query.set('');
    this.expanded.set(true);
    this.activeIndex.set(
      Math.max(
        0,
        this.choices().findIndex((c) => c.value === this.value()),
      ),
    );
    this.scrollActive();
  }
  search(value: string): void {
    if (this.disabled()) return;
    this.query.set(value);
    this.expanded.set(true);
    this.activeIndex.set(0);
  }
  choose(choice: SearchChoice): void {
    if (this.disabled()) return;
    this.expanded.set(false);
    this.query.set('');
    this.valueChange.emit(choice.value);
    this.searchInput?.nativeElement.focus();
  }
  key(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (this.expanded() && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
      this.expanded.set(false);
      return;
    }
    if (event.key === 'Enter' && this.expanded()) {
      event.preventDefault();
      const choice = this.activeChoice();
      if (choice) this.choose(choice);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.expanded()) this.show();
      else
        this.activeIndex.set(
          Math.max(
            0,
            Math.min(
              this.filtered().length - 1,
              this.activeIndex() + (event.key === 'ArrowDown' ? 1 : -1),
            ),
          ),
        );
      this.scrollActive();
    } else if (this.expanded() && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      this.activeIndex.set(event.key === 'Home' ? 0 : Math.max(0, this.filtered().length - 1));
      this.scrollActive();
    }
  }
  leave(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null))
      this.expanded.set(false);
  }
  @HostListener('document:pointerdown', ['$event'])
  outside(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node | null)) this.expanded.set(false);
  }
  private scrollActive(): void {
    afterNextRender(
      () => {
        const active = this.host.nativeElement.querySelector<HTMLElement>('[role="option"].active');
        const list = active?.parentElement;
        if (!active || !list) return;
        if (active.offsetTop < list.scrollTop) list.scrollTop = active.offsetTop;
        else if (active.offsetTop + active.offsetHeight > list.scrollTop + list.clientHeight)
          list.scrollTop = active.offsetTop + active.offsetHeight - list.clientHeight;
      },
      { injector: this.injector },
    );
  }
}
