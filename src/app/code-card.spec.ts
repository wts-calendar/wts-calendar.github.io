import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CodeCard } from './code-card';

describe('Code card copy control', () => {
  it('copies the exact displayed text, confirms success, and resets when code changes', async () => {
    await TestBed.configureTestingModule({ imports: [CodeCard] }).compileComponents();
    const fixture = TestBed.createComponent(CodeCard);
    fixture.componentRef.setInput('label', 'Install command');
    fixture.componentRef.setInput('code', 'npm install @wts-calendar/react');
    fixture.detectChanges();
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    try {
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('Copy Install command');
      button.click();
      await vi.waitFor(() => expect(fixture.componentInstance.copied()).toBe(true));
      fixture.detectChanges();
      expect(writeText).toHaveBeenLastCalledWith('npm install @wts-calendar/react');
      expect(button.title).toBe('Copied');
      expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toBe('Copied');
      fixture.componentRef.setInput('code', 'npm install @wts-calendar/vue');
      fixture.detectChanges();
      expect(fixture.componentInstance.copied()).toBe(false);
      expect(fixture.componentInstance.feedback()).toBe('');
      await fixture.componentInstance.copy();
      expect(writeText).toHaveBeenLastCalledWith('npm install @wts-calendar/vue');
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
      else Reflect.deleteProperty(navigator, 'clipboard');
      fixture.destroy();
    }
  });
  it('keeps code as inert text and supports unavailable clipboard environments', async () => {
    await TestBed.configureTestingModule({ imports: [CodeCard] }).compileComponents();
    const fixture = TestBed.createComponent(CodeCard);
    fixture.componentRef.setInput('label', 'Example');
    fixture.componentRef.setInput('code', '<script>alert("text only")</script>');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('script')).toBeNull();
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    try {
      await fixture.componentInstance.copy();
      expect(fixture.componentInstance.feedback()).toContain('Clipboard unavailable');
      expect(fixture.nativeElement.querySelector('code').textContent).toContain('<script>');
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
      else Reflect.deleteProperty(navigator, 'clipboard');
      fixture.destroy();
    }
  });
});
