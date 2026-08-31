import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchableSelect } from './searchable-select';

describe('Searchable select', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [SearchableSelect] }));
  function setup() {
    const fixture = TestBed.createComponent(SearchableSelect);
    fixture.componentRef.setInput('controlId', 'language');
    fixture.componentRef.setInput('label', 'Language / locale');
    fixture.componentRef.setInput('value', 'en');
    fixture.componentRef.setInput('choices', [
      { value: 'en', label: 'English', detail: 'en · Package translations' },
      {
        value: 'fr-CA',
        label: 'French · Français (Canada)',
        detail: 'fr-CA · Package translations',
      },
      { value: 'ar', label: 'Arabic · العربية', detail: 'ar · RTL' },
    ]);
    const change = vi.fn();
    fixture.componentInstance.valueChange.subscribe(change);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const key = (value: string) => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true }));
      fixture.detectChanges();
    };
    const search = (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, input, key, search, change };
  }
  it('has a labeled combobox, preserves selection while filtering, and commits only a chosen match', () => {
    const { fixture, input, search, change, key } = setup();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe(input.id);
    expect(input.value).toBe('English');
    search('francais');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('[role="option"]').length).toBe(1);
    expect(change).not.toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector(
        '[id="' + input.getAttribute('aria-activedescendant') + '"]',
      ),
    ).toBeTruthy();
    key('Enter');
    expect(change).toHaveBeenCalledExactlyOnceWith('fr-CA');
    fixture.componentRef.setInput('value', 'fr-CA');
    fixture.detectChanges();
    expect(input.value).toContain('French');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });
  it('handles keyboard navigation, escape cancellation, and empty results without selecting anything', () => {
    const { fixture, input, key, search, change } = setup();
    key('ArrowDown');
    key('End');
    expect(fixture.componentInstance.activeChoice()?.value).toBe('ar');
    key('Home');
    key('ArrowDown');
    expect(fixture.componentInstance.activeChoice()?.value).toBe('fr-CA');
    key('Escape');
    expect(input.value).toBe('English');
    search('no such locale');
    expect(fixture.nativeElement.textContent).toContain('No matches');
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);
    key('Enter');
    key('Tab');
    expect(change).not.toHaveBeenCalled();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });
  it('supports native-script search, pointer selection, and dismissal outside the control', () => {
    const { fixture, input, search, change } = setup();
    search('العربية');
    (fixture.nativeElement.querySelector('[role="option"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(change).toHaveBeenCalledExactlyOnceWith('ar');
    input.click();
    fixture.detectChanges();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });
  it('cannot change a disabled control', () => {
    const { fixture, input, key, change } = setup();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    key('ArrowDown');
    expect(input.disabled).toBe(true);
    expect(fixture.componentInstance.expanded()).toBe(false);
    expect(change).not.toHaveBeenCalled();
  });
  it('does not match language names inside fallback translation notices', () => {
    const { fixture, search } = setup();
    fixture.componentRef.setInput('choices', [
      { value: 'en', label: 'English', detail: 'Package translations' },
      { value: 'bn', label: 'Bengali', detail: 'Date formatting; English UI labels' },
    ]);
    search('English');
    expect(fixture.componentInstance.filtered().map(choice => choice.value)).toEqual(['en']);
  });
});
