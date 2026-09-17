import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LicenseRequestForm } from './license-request-form';
import { PricingPage } from './pricing-page';

function mockDialog(dialog: HTMLDialogElement) {
  const show = vi.fn(() => {
    dialog.open = true;
    dialog.querySelector<HTMLInputElement>('[autofocus]')?.focus();
  });
  Object.defineProperty(dialog, 'showModal', { configurable: true, value: show });
  Object.defineProperty(dialog, 'close', {
    configurable: true,
    value: () => {
      dialog.open = false;
      dialog.dispatchEvent(new Event('close'));
    },
  });
  return show;
}

async function setup() {
  await TestBed.configureTestingModule({ imports: [LicenseRequestForm] }).compileComponents();
  const fixture = TestBed.createComponent(LicenseRequestForm);
  fixture.detectChanges();
  const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
  mockDialog(dialog);
  return { fixture, dialog, component: fixture.componentInstance };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Pricing request form', () => {
  it('starts closed and offers direct submission without mailto or credential fields', async () => {
    const { fixture, dialog, component } = await setup();
    expect(dialog.open).toBe(false);
    component.open();
    fixture.detectChanges();
    expect(dialog.open).toBe(true);
    expect(fixture.nativeElement.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="password"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('#request-package')).toBeNull();
    expect(fixture.nativeElement.querySelector('.request-footer .button.primary').disabled).toBe(
      false,
    );
    expect(fixture.nativeElement.querySelector('#submission-notice')).toBeNull();
    expect(component.form.controls.requestType.value).toBe('PRICE_QUOTE');
  });

  it('sets the request type and resets personal details when closed', async () => {
    const { component, dialog } = await setup();
    component.open('RENEWAL');
    expect(component.form.controls.requestType.value).toBe('RENEWAL');
    component.form.controls.name.setValue('Synthetic Tester');
    component.close();
    expect(dialog.open).toBe(false);
    expect(component.form.controls.name.value).toBe('');
    component.open('NEW_ACCESS');
    expect(component.form.controls.requestType.value).toBe('NEW_ACCESS');
  });

  it('updates the dialog heading for each request type', async () => {
    const { component, fixture } = await setup();
    component.open('PRICE_QUOTE');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#request-heading').textContent).toContain(
      'Request Premium pricing',
    );
    component.form.controls.requestType.setValue('NEW_ACCESS');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#request-heading').textContent).toContain(
      'Request Premium access',
    );
    component.form.controls.requestType.setValue('RENEWAL');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#request-heading').textContent).toContain(
      'Renew Premium access',
    );
  });

  it('does not expose required-field errors when the dialog opens or initial focus moves', async () => {
    const { component, fixture } = await setup();
    component.open();
    fixture.detectChanges();

    expect(document.activeElement?.id).toBe('request-type');
    (document.activeElement as HTMLElement).blur();
    fixture.detectChanges();

    expect(component.checked()).toBe(false);
    expect(fixture.nativeElement.querySelector('#request-name-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('#request-email-error')).toBeNull();
    expect(fixture.nativeElement.querySelector('#request-message-error')?.textContent.trim()).toBe(
      '',
    );
  });

  it('shows accessible errors and focuses the first invalid field', async () => {
    const { component, fixture } = await setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    component.open();
    component.form.patchValue({ name: '   ', email: 'not-an-email', message: '   ' });
    await component.submit();
    fixture.detectChanges();
    expect(component.form.invalid).toBe(true);
    expect(document.activeElement?.id).toBe('request-name');
    expect(fixture.nativeElement.querySelector('#request-name').getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(fixture.nativeElement.querySelector('#request-email-error')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#request-message-error')).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('submits valid details to the production request endpoint without a storage write', async () => {
    const { component, fixture } = await setup();
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal('fetch', fetchSpy);
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    component.open();
    component.form.patchValue({
      name: 'Synthetic Tester',
      email: 'tester@example.com',
      website: 'https://app.example.com\nhttp://localhost:4200',
      message: 'I want premium access for this package.',
    });
    await component.submit();
    fixture.detectChanges();
    expect(component.form.valid).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'request was sent',
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://package-portal.dedicateddevelopers.us/api/public/premium-requests',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify({
          npmName: '@wts-calendar/core',
          name: 'Synthetic Tester',
          email: 'tester@example.com',
          company: '',
          website: 'https://app.example.com, http://localhost:4200',
          message: 'I want premium access for this package.',
          requestType: 'PRICE_QUOTE',
          period: 'ONE_YEAR',
        }),
      }),
    );
    expect(storageSpy).not.toHaveBeenCalled();
    expect(component.submissionState()).toBe('success');
  });

  it('shows a safe retry message when the request service fails', async () => {
    const { component, fixture } = await setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    component.open();
    component.form.patchValue({
      name: 'Synthetic Tester',
      email: 'tester@example.com',
      message: 'I want premium access for this package.',
    });
    await component.submit();
    fixture.detectChanges();
    expect(component.submissionState()).toBe('error');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'temporarily unavailable',
    );
  });

  it('validates origins without requiring a deployment before an inquiry', async () => {
    const { component } = await setup();
    const websites = component.form.controls.website;
    for (const value of [
      '',
      'https://app.example.com/',
      'http://127.0.0.1:3101',
      'https://a.example, https://b.example',
    ]) {
      websites.setValue(value);
      expect(websites.valid, value).toBe(true);
    }
    for (const value of [
      'invalid',
      'javascript:alert(1)',
      'https://user:pass@example.com',
      'https://app.example.com/login',
      'https://app.example.com/?key=secret',
      'http://app.example.com',
      Array.from({ length: 21 }, (_, i) => `https://app${i}.example`).join('\n'),
    ]) {
      websites.setValue(value);
      expect(websites.invalid, value).toBe(true);
    }
  });

  it('creates the exact submission payload and normalizes multiple websites', async () => {
    const { component } = await setup();
    component.form.patchValue({
      requestType: 'NEW_ACCESS',
      name: ' Suman Mandal ',
      email: ' suman.mandal@webskitters.com ',
      company: ' Acme Inc. ',
      website: 'https://wts-calendar.github.io\nhttps://customer-domain.com, https://abc.com',
      message: ' I want premium access for this package. ',
    });
    expect(component.payload()).toEqual({
      npmName: '@wts-calendar/core',
      name: 'Suman Mandal',
      email: 'suman.mandal@webskitters.com',
      company: 'Acme Inc.',
      website: 'https://wts-calendar.github.io, https://customer-domain.com, https://abc.com',
      message: 'I want premium access for this package.',
      requestType: 'NEW_ACCESS',
      period: 'ONE_YEAR',
    });
  });

  it('does not ask for a framework or feature selection', async () => {
    const { fixture, component } = await setup();
    component.open();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#request-framework')).toBeNull();
    expect(fixture.nativeElement.querySelector('.request-features')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Primary framework');
    expect(fixture.nativeElement.textContent).not.toContain('What do you need?');
  });

  it('restores focus and clears personal details on native close (including Escape)', async () => {
    const { component, dialog } = await setup();
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    component.open();
    component.form.controls.email.setValue('tester@example.com');
    dialog.close();
    expect(document.activeElement).toBe(trigger);
    expect(component.form.controls.email.value).toBe('');
    trigger.remove();
  });

  it('opens the same dialog from both pricing and evaluation buttons', async () => {
    await TestBed.configureTestingModule({
      imports: [PricingPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PricingPage);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const show = mockDialog(dialog);
    (fixture.nativeElement.querySelector('.premium-plan button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(show).toHaveBeenCalledTimes(1);
    expect((dialog.querySelector('#request-type') as HTMLSelectElement).value).toBe('PRICE_QUOTE');
    dialog.close();
    (fixture.nativeElement.querySelector('#evaluation > button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(show).toHaveBeenCalledTimes(2);
    expect((dialog.querySelector('#request-type') as HTMLSelectElement).value).toBe('NEW_ACCESS');
  });
});
