import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, type ValidatorFn } from '@angular/forms';

export type LicenseRequestType = 'PRICE_QUOTE' | 'NEW_ACCESS' | 'RENEWAL';
export type LicenseRequestPeriod = 'ONE_YEAR';

export interface LicenseRequestPayload {
  npmName: '@wts-calendar/core';
  name: string;
  email: string;
  company: string;
  website: string;
  message: string;
  requestType: LicenseRequestType;
  period: LicenseRequestPeriod;
}

export const PREMIUM_REQUEST_ENDPOINT =
  'https://package-portal.dedicateddevelopers.us/api/public/premium-requests';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

const trimmedRequired: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };
const validWebsites: ValidatorFn = (control) => {
  const entries = String(control.value ?? '')
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (entries.length > 20) return { origins: true };
  try {
    for (const entry of entries) {
      const url = new URL(entry);
      const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
      if (
        (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        url.search ||
        url.hash
      ) {
        return { origins: true };
      }
    }
    return null;
  } catch {
    return { origins: true };
  }
};

@Component({
  selector: 'app-license-request-form',
  imports: [ReactiveFormsModule],
  templateUrl: './license-request-form.html',
  styleUrl: './license-request-form.scss',
})
export class LicenseRequestForm implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly fb = inject(FormBuilder).nonNullable;
  private returnFocus: HTMLElement | null = null;
  @ViewChild('requestDialog') private dialog!: ElementRef<HTMLDialogElement>;
  readonly checked = signal(false);
  readonly submissionState = signal<SubmissionState>('idle');
  readonly submissionMessage = signal('');
  private submissionController: AbortController | null = null;
  readonly form = this.fb.group({
    requestType: this.fb.control<LicenseRequestType>('PRICE_QUOTE'),
    period: this.fb.control<LicenseRequestPeriod>('ONE_YEAR'),
    name: ['', [trimmedRequired, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    company: ['', Validators.maxLength(120)],
    website: ['', [Validators.maxLength(2000), validWebsites]],
    message: ['', [trimmedRequired, Validators.maxLength(2000)]],
  });

  open(requestType: LicenseRequestType = 'PRICE_QUOTE'): void {
    if (this.dialog.nativeElement.open) return;
    this.returnFocus = this.document.activeElement as HTMLElement | null;
    this.form.reset();
    this.form.patchValue({ requestType });
    this.checked.set(false);
    this.submissionState.set('idle');
    this.submissionMessage.set('');
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

  onClosed(): void {
    this.submissionController?.abort();
    this.submissionController = null;
    this.form.reset();
    this.checked.set(false);
    this.submissionState.set('idle');
    this.submissionMessage.set('');
    if (this.returnFocus?.isConnected) this.returnFocus.focus({ preventScroll: true });
    this.returnFocus = null;
  }

  ngOnDestroy(): void {
    this.submissionController?.abort();
  }

  invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.checked());
  }

  requestHeading(): string {
    switch (this.form.controls.requestType.value) {
      case 'NEW_ACCESS':
        return 'Request Premium access';
      case 'RENEWAL':
        return 'Renew Premium access';
      default:
        return 'Request Premium pricing';
    }
  }

  payload(): LicenseRequestPayload {
    const value = this.form.getRawValue();
    return {
      npmName: '@wts-calendar/core',
      name: value.name.trim(),
      email: value.email.trim(),
      company: value.company.trim(),
      website: value.website
        .split(/[\n,]+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
        .join(', '),
      message: value.message.trim(),
      requestType: value.requestType,
      period: value.period,
    };
  }

  async submit(): Promise<void> {
    if (this.submissionState() === 'submitting') return;
    this.checked.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.submissionState.set('idle');
      this.submissionMessage.set('Please check the highlighted fields. Nothing has been sent.');
      const field = Object.entries(this.form.controls).find(([, control]) => control.invalid)?.[0];
      this.dialog.nativeElement
        .querySelector<HTMLElement>(`[data-request-field="${field}"]`)
        ?.focus();
      return;
    }

    const controller = new AbortController();
    this.submissionController = controller;
    this.submissionState.set('submitting');
    this.submissionMessage.set('Sending your request…');
    try {
      const response = await fetch(PREMIUM_REQUEST_ENDPOINT, {
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
      this.submissionMessage.set(
        'Your request was sent. We will reply using the email address you provided.',
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      const status = error instanceof Error ? Number(error.message) : 0;
      this.submissionState.set('error');
      this.submissionMessage.set(
        status === 429
          ? 'Too many requests were sent. Please wait and try again.'
          : status >= 500
            ? 'The request service is temporarily unavailable. Please try again shortly.'
            : 'Your request could not be sent. Check your connection and try again.',
      );
    } finally {
      if (this.submissionController === controller) this.submissionController = null;
    }
  }
}
