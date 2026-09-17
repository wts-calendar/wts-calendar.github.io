import { Component, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type ValidatorFn } from '@angular/forms';
import { SITE_ORIGIN } from './seo-data';

export const CONTACT_REQUEST_ENDPOINT =
  'https://package-portal.dedicateddevelopers.us/api/public/contact-requests';

export interface ContactRequestPayload {
  packageName: '@wts-calendar/core';
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  source: 'WTS Calendar website';
  pageUrl: string;
}

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

const trimmedRequired: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };
const phoneNumber: ValidatorFn = (control) => {
  const value = String(control.value ?? '').trim();
  return !value || /^\+?[0-9 ()-]{7,30}$/.test(value) ? null : { phone: true };
};

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule],
  styles: `
    :host {
      display: block;
    }
    .contact-layout {
      display: grid;
      grid-template-columns: minmax(0, 0.72fr) minmax(420px, 1.28fr);
      gap: clamp(40px, 7vw, 96px);
      align-items: start;
      padding-block: 48px 88px;
    }
    .contact-intro {
      position: sticky;
      top: 96px;
    }
    .contact-intro h1 {
      margin: 12px 0 18px;
    }
    .contact-intro p {
      max-width: 48ch;
      color: var(--muted);
    }
    .contact-points {
      display: grid;
      gap: 12px;
      padding: 0;
      margin: 28px 0 0;
      list-style: none;
    }
    .contact-points li {
      padding-top: 12px;
      border-top: 1px solid var(--line);
      font-size: 13px;
    }
    .contact-form {
      padding: clamp(24px, 4vw, 40px);
      border: 1px solid var(--line);
      border-radius: 14px;
      background: var(--paper);
    }
    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-bottom: 18px;
    }
    .field-grid .field {
      margin-bottom: 0;
    }
    label {
      font-size: 13px;
      font-weight: 650;
    }
    .optional {
      margin-left: 6px;
      color: var(--muted);
      font-size: 11px;
      font-weight: 400;
    }
    input,
    textarea {
      width: 100%;
      min-height: 44px;
      padding: 10px 12px;
      border: 1px solid #b8c9c0;
      border-radius: 7px;
      background: white;
      color: var(--ink);
      font: inherit;
      font-size: 14px;
    }
    textarea {
      min-height: 140px;
      resize: vertical;
    }
    [aria-invalid='true'] {
      border-color: #af4937;
    }
    .field-error,
    .field-help {
      min-height: 17px;
      margin: 0;
      font-size: 11px;
      line-height: 1.5;
    }
    .field-error {
      color: #a03b2b;
    }
    .field-help {
      color: var(--muted);
    }
    .contact-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-top: 24px;
    }
    .contact-feedback {
      margin: 0;
      color: var(--muted);
      font-size: 12px;
    }
    .contact-feedback.success {
      color: #075b4d;
    }
    .contact-feedback.error {
      color: #8b2f20;
    }
    @media (max-width: 760px) {
      .contact-layout {
        grid-template-columns: 1fr;
        padding-block: 32px 64px;
      }
      .contact-intro {
        position: static;
      }
    }
    @media (max-width: 520px) {
      .field-grid {
        grid-template-columns: 1fr;
      }
      .contact-actions {
        align-items: stretch;
        flex-direction: column;
      }
      .contact-actions .button {
        width: 100%;
      }
    }
  `,
  template: `
    <section class="container contact-layout">
      <div class="contact-intro">
        <span class="eyebrow">CONTACT / PRODUCT SUPPORT</span>
        <h1>How can we help?</h1>
        <p>
          Ask about WTS Calendar integration, product capabilities, documentation, or commercial
          support. For Premium pricing or access, use the dedicated request form on the pricing
          page.
        </p>
        <ul class="contact-points">
          <li>Do not include license keys, passwords, or provider credentials.</li>
          <li>Include the package version and a concise reproduction when reporting a problem.</li>
          <li>This form sends an inquiry; it does not create an account or purchase.</li>
        </ul>
      </div>

      <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field-grid">
          <div class="field">
            <label for="contact-name">Full name <span aria-hidden="true">*</span></label>
            <input
              id="contact-name"
              data-contact-field="name"
              formControlName="name"
              autocomplete="name"
              maxlength="100"
              required
              [attr.aria-invalid]="invalid('name')"
              [attr.aria-describedby]="invalid('name') ? 'contact-name-error' : null"
            />
            <p class="field-error" id="contact-name-error">
              @if (invalid('name')) { Enter your name. }
            </p>
          </div>
          <div class="field">
            <label for="contact-email">Email <span aria-hidden="true">*</span></label>
            <input
              id="contact-email"
              data-contact-field="email"
              formControlName="email"
              type="email"
              autocomplete="email"
              maxlength="254"
              required
              [attr.aria-invalid]="invalid('email')"
              [attr.aria-describedby]="invalid('email') ? 'contact-email-error' : null"
            />
            <p class="field-error" id="contact-email-error">
              @if (invalid('email')) { Enter a valid email address. }
            </p>
          </div>
          <div class="field">
            <label for="contact-phone">Phone <span class="optional">optional</span></label>
            <input
              id="contact-phone"
              data-contact-field="phone"
              formControlName="phone"
              type="tel"
              autocomplete="tel"
              maxlength="30"
              [attr.aria-invalid]="invalid('phone')"
              [attr.aria-describedby]="invalid('phone') ? 'contact-phone-error' : null"
            />
            <p class="field-error" id="contact-phone-error">
              @if (invalid('phone')) { Enter a valid phone number. }
            </p>
          </div>
          <div class="field">
            <label for="contact-company">Company <span class="optional">optional</span></label>
            <input
              id="contact-company"
              data-contact-field="company"
              formControlName="company"
              autocomplete="organization"
              maxlength="120"
              [attr.aria-invalid]="invalid('company')"
            />
            <p class="field-error">
              @if (invalid('company')) { Keep the company name under 120 characters. }
            </p>
          </div>
        </div>

        <div class="field">
          <label for="contact-subject">Subject <span aria-hidden="true">*</span></label>
          <input
            id="contact-subject"
            data-contact-field="subject"
            formControlName="subject"
            maxlength="160"
            required
            placeholder="What do you need help with?"
            [attr.aria-invalid]="invalid('subject')"
            [attr.aria-describedby]="invalid('subject') ? 'contact-subject-error' : null"
          />
          <p class="field-error" id="contact-subject-error">
            @if (invalid('subject')) { Enter a subject. }
          </p>
        </div>

        <div class="field">
          <label for="contact-message">Message <span aria-hidden="true">*</span></label>
          <textarea
            id="contact-message"
            data-contact-field="message"
            formControlName="message"
            maxlength="3000"
            required
            placeholder="Describe your question or issue."
            [attr.aria-invalid]="invalid('message')"
            aria-describedby="contact-message-help contact-message-error"
          ></textarea>
          <p class="field-help" id="contact-message-help">
            Do not include secrets, license keys, or confidential customer data.
          </p>
          <p class="field-error" id="contact-message-error">
            @if (invalid('message')) { Enter a message of up to 3,000 characters. }
          </p>
        </div>

        <div class="contact-actions">
          <p
            class="contact-feedback"
            [class.success]="submissionState() === 'success'"
            [class.error]="submissionState() === 'error'"
            role="status"
            aria-live="polite"
          >
            {{ submissionMessage() }}
          </p>
          <button
            type="submit"
            class="button primary"
            [disabled]="submissionState() === 'submitting' || submissionState() === 'success'"
          >
            @if (submissionState() === 'submitting') {
              Sending…
            } @else if (submissionState() === 'success') {
              Message sent
            } @else {
              Send message →
            }
          </button>
        </div>
      </form>
    </section>
  `,
})
export class ContactPage implements OnDestroy {
  private readonly fb = new FormBuilder().nonNullable;
  private submissionController: AbortController | null = null;
  readonly attempted = signal(false);
  readonly submissionState = signal<SubmissionState>('idle');
  readonly submissionMessage = signal('');
  readonly form = this.fb.group({
    name: ['', [trimmedRequired, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.maxLength(30), phoneNumber]],
    company: ['', Validators.maxLength(120)],
    subject: ['', [trimmedRequired, Validators.maxLength(160)]],
    message: ['', [trimmedRequired, Validators.maxLength(3000)]],
  });

  ngOnDestroy(): void {
    this.submissionController?.abort();
  }

  invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.attempted());
  }

  payload(): ContactRequestPayload {
    const value = this.form.getRawValue();
    return {
      packageName: '@wts-calendar/core',
      name: value.name.trim(),
      email: value.email.trim(),
      phone: value.phone.trim(),
      company: value.company.trim(),
      subject: value.subject.trim(),
      message: value.message.trim(),
      source: 'WTS Calendar website',
      pageUrl: SITE_ORIGIN + '/contact',
    };
  }

  async submit(): Promise<void> {
    if (this.submissionState() === 'submitting' || this.submissionState() === 'success') return;
    this.attempted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.submissionState.set('idle');
      this.submissionMessage.set('Please check the highlighted fields. Nothing has been sent.');
      const field = Object.entries(this.form.controls).find(([, control]) => control.invalid)?.[0];
      document.querySelector<HTMLElement>(`[data-contact-field="${field}"]`)?.focus();
      return;
    }

    const controller = new AbortController();
    this.submissionController = controller;
    this.submissionState.set('submitting');
    this.submissionMessage.set('Sending your message…');
    try {
      const response = await fetch(CONTACT_REQUEST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(this.payload()),
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(String(response.status));
      this.submissionState.set('success');
      this.submissionMessage.set('Your message was sent. We will reply by email.');
    } catch (error) {
      if (controller.signal.aborted) return;
      const status = error instanceof Error ? Number(error.message) : 0;
      this.submissionState.set('error');
      this.submissionMessage.set(
        status === 429
          ? 'Too many messages were sent. Please wait and try again.'
          : status >= 500
            ? 'The contact service is temporarily unavailable. Please try again shortly.'
            : 'Your message could not be sent. Check your connection and try again.',
      );
    } finally {
      if (this.submissionController === controller) this.submissionController = null;
    }
  }
}
