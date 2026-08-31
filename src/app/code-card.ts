import { Component, ElementRef, effect, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-code-card',
  host: { class: 'code-card' },
  template: `
    <div class="code-panel">
      <div class="code-card-toolbar">
        <span>{{ label() }}</span>
        <span class="copy-code-feedback" role="status">{{ feedback() }}</span>
        <button
          type="button"
          class="copy-code-button"
          [attr.aria-label]="'Copy ' + label()"
          [title]="copied() ? 'Copied' : 'Copy ' + label()"
          [disabled]="disabled() || !code()"
          (click)="copy()"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            @if (copied()) {
              <path d="m5 12 4 4L19 6" />
            } @else {
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
            }
          </svg>
        </button>
      </div>
      <pre [attr.data-code-kind]="kind()"><code>{{ code() }}</code></pre>
    </div>
  `,
})
export class CodeCard {
  readonly code = input.required<string>();
  readonly label = input.required<string>();
  readonly kind = input<string | null>(null);
  readonly disabled = input(false);
  readonly copied = signal(false);
  readonly feedback = signal('');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  constructor() {
    effect(() => {
      this.code();
      this.label();
      this.copied.set(false);
      this.feedback.set('');
    });
  }
  async copy(): Promise<void> {
    const code = this.code();
    const label = this.label();
    if (this.disabled() || !code) return;
    try {
      const clipboard = this.element.nativeElement.ownerDocument.defaultView?.navigator.clipboard;
      if (!clipboard?.writeText) throw new Error('Clipboard unavailable');
      await clipboard.writeText(code);
      if (this.code() !== code || this.label() !== label) return;
      this.copied.set(true);
      this.feedback.set('Copied');
    } catch {
      if (this.code() !== code || this.label() !== label) return;
      this.copied.set(false);
      this.feedback.set('Clipboard unavailable. Select and copy the code below.');
    }
  }
}
