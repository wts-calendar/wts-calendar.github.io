import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_REQUEST_ENDPOINT, ContactPage } from './contact-page';

async function setup() {
  await TestBed.configureTestingModule({ imports: [ContactPage] }).compileComponents();
  const fixture = TestBed.createComponent(ContactPage);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Contact page', () => {
  it('appends calendar metadata to the exact contact-request payload', async () => {
    const { component } = await setup();
    component.form.setValue({
      name: ' Suman Mandal ',
      email: ' suman@example.com ',
      phone: ' +91 9876543210 ',
      company: ' Webskitters ',
      subject: ' Need help with Calendar ',
      message: ' I want to know more about premium support. ',
    });
    expect(component.payload()).toEqual({
      packageName: '@wts-calendar/core',
      name: 'Suman Mandal',
      email: 'suman@example.com',
      phone: '+91 9876543210',
      company: 'Webskitters',
      subject: 'Need help with Calendar',
      message: 'I want to know more about premium support.',
      source: 'WTS Calendar website',
      pageUrl: 'https://wts-calendar.github.io/contact',
    });
  });

  it('shows validation and does not contact the API for an invalid form', async () => {
    const { fixture, component } = await setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    await component.submit();
    fixture.detectChanges();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('contact-name');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'highlighted fields',
    );
  });

  it('submits to the production contact endpoint without storing form data', async () => {
    const { fixture, component } = await setup();
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    vi.stubGlobal('fetch', fetchSpy);
    component.form.setValue({
      name: 'Suman Mandal',
      email: 'suman@example.com',
      phone: '+91 9876543210',
      company: 'Webskitters',
      subject: 'Need help with Calendar',
      message: 'I want to know more about premium support.',
    });
    await component.submit();
    fixture.detectChanges();
    expect(fetchSpy).toHaveBeenCalledWith(
      CONTACT_REQUEST_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        body: JSON.stringify(component.payload()),
      }),
    );
    expect(storageSpy).not.toHaveBeenCalled();
    expect(component.submissionState()).toBe('success');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'message was sent',
    );
  });

  it('shows a safe retry message when the contact service fails', async () => {
    const { fixture, component } = await setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    component.form.setValue({
      name: 'Synthetic Tester',
      email: 'tester@example.com',
      phone: '',
      company: '',
      subject: 'Support question',
      message: 'Please help with this integration.',
    });
    await component.submit();
    fixture.detectChanges();
    expect(component.submissionState()).toBe('error');
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'temporarily unavailable',
    );
  });
});
