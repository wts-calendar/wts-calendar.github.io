import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { describe, expect, it } from 'vitest';
import { routes } from './app.config';
import { RuntimeOptions } from './runtime-options';
import { CLIENT_OPTIONS, CLIENT_PACKAGE, CLIENT_SYMBOLS } from './api-reference-data.generated';
import {
  controlsForView,
  controlAvailable,
  RUNTIME_CONTROLS,
  RUNTIME_OPTION_KEYS,
  runtimeChange,
} from './runtime-option-schema';
import { seoForUrl } from './seo-data';

describe('Released appearance documentation', () => {
  it('documents appearance options and adapters from the pinned release', () => {
    for (const name of ['dayNarrowWidth', 'eventContrastColor'])
      expect(CLIENT_OPTIONS.some((item) => item.name === name)).toBe(true);
    for (const name of [
      'createMuiCalendarTheme',
      'createShadcnCalendarTheme',
      'createAngularMaterialCalendarTheme',
    ])
      expect(CLIENT_SYMBOLS.some((item) => item.name === name)).toBe(true);
    expect(seoForUrl('/docs/appearance').title).not.toContain('Unreleased');
    expect(seoForUrl('/docs/appearance').noindex).not.toBe(true);
  });

  it('renders setup, defaults, precedence and limits in the guide', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/docs/appearance');
    const page = harness.routeNativeElement!;
    expect(page.querySelector('h1')?.textContent).toContain('Themes & responsive appearance');
    expect(page.textContent).toContain('Available in core ' + CLIENT_PACKAGE.version);
    expect(page.textContent).toContain(CLIENT_PACKAGE.version);
    expect(page.textContent).toContain('eventTextColor');
    expect(page.textContent).toContain('112px');
    expect(page.querySelectorAll('app-code-card').length).toBe(6);
    for (const id of ['contrast', 'narrow', 'mui', 'shadcn', 'angular-material'])
      expect(page.querySelector('#' + id)).toBeTruthy();
  });

  it('shows released options and exports in the searchable API without release warnings', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    for (const name of [
      'eventContrastColor',
      'dayNarrowWidth',
      'createMuiCalendarTheme',
      'createShadcnCalendarTheme',
      'createAngularMaterialCalendarTheme',
    ]) {
      const route = name.startsWith('create') ? '/docs/api/exports' : '/docs/api';
      await harness.navigateByUrl(route + '?entry=' + name);
      const detail = harness.routeNativeElement?.querySelector('.reference-detail');
      expect(detail?.querySelector('h2')?.textContent).toContain(name);
      expect(detail?.textContent).not.toContain('Unreleased.');
    }
  });

  it('enables the released appearance controls and emits supported runtime changes', async () => {
    TestBed.configureTestingModule({ imports: [RuntimeOptions] });
    const fixture = TestBed.createComponent(RuntimeOptions);
    fixture.componentRef.setInput('demoId', 'themes');
    fixture.componentRef.setInput('view', 'month');
    fixture.componentRef.setInput('options', { theme: 'forma' });
    fixture.detectChanges();
    let emitted = 0;
    fixture.componentInstance.apply.subscribe(() => emitted++);
    for (const [key, value] of [
      ['dayNarrowWidth', 120],
      ['eventContrastColor', 'auto'],
    ] as const) {
      const control = RUNTIME_CONTROLS.find((item) => item.key === key)!;
      const field = fixture.nativeElement.querySelector('#runtime-' + key) as HTMLSelectElement;
      expect(field.disabled).toBe(false);
      expect(controlAvailable(control)).toBe(true);
      expect(RUNTIME_OPTION_KEYS).toContain(key);
      expect(runtimeChange(control, value)).toEqual({ [key]: value });
      field.value = JSON.stringify(value);
      field.dispatchEvent(new Event('change'));
    }
    expect(emitted).toBe(2);
    expect(
      controlsForView('themes', 'list-week').some((item) => item.key === 'dayNarrowWidth'),
    ).toBe(false);
    expect(controlsForView('themes', 'week').some((item) => item.key === 'dayNarrowWidth')).toBe(
      true,
    );
    expect(fixture.nativeElement.textContent).not.toContain('Unavailable in core');
  });
});
