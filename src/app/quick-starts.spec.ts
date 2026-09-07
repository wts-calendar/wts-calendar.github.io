import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DocsPage } from './docs-page';
import { QUICK_STARTS } from './quick-starts';

describe('First calendar onboarding', () => {
  it('shows complete component and CSS cards when changing framework, before optional backend setup', async () => {
    await TestBed.configureTestingModule({
      imports: [DocsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DocsPage);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    for (const starter of QUICK_STARTS) {
      const button = [
        ...root.querySelectorAll<HTMLButtonElement>('.segmented[aria-label="Framework"] button'),
      ].find((item) => item.textContent?.trim() === starter.name)!;
      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-pressed')).toBe('true');
      for (const file of starter.files) expect(root.textContent).toContain(file.code);
      expect(root.textContent).toContain('September 2026');
    }
    expect(root.textContent!.indexOf('Build your first calendar')).toBeLessThan(
      root.textContent!.indexOf('4. Add a backend'),
    );
    expect(root.querySelector('a[href="/examples/event-editor"]')).toBeTruthy();
  });
});
