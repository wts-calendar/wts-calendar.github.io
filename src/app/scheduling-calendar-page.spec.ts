import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { routes } from './app.config';

describe('Scheduling calendar landing page', () => {
  it('renders useful scheduling guidance and connects the primary journeys', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/scheduling-calendar');
    const page = harness.routeNativeElement!;

    expect(page.querySelector('h1')?.textContent).toContain('scheduling calendar');
    expect(page.textContent).toContain('JavaScript, React, Angular');
    expect(page.textContent).toContain('Appointment scheduling');
    expect(page.textContent).toContain('Resource scheduling');
    expect(page.textContent).toContain('Booking workflows');
    expect(page.textContent).toContain('hosted scheduling service');
    expect(page.querySelector('app-code-card')?.textContent).toContain('timeGridModule');

    for (const route of ['/docs', '/examples/time-grid-week', '/features', '/docs/booking'])
      expect(page.querySelector(`a[href="${route}"]`)).toBeTruthy();
  });
});
