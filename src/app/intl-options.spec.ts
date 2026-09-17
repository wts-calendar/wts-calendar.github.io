import { afterEach, describe, expect, it, vi } from 'vitest';
import { calendarLocales } from '@wts-calendar/core';
import { createLocaleChoices, createTimeZoneChoices, localeDirection } from './intl-options';
import { normalizeSearch } from './searchable-select';
import catalog from './intl-catalog-data.json';

afterEach(() => vi.restoreAllMocks());

describe('Locale catalog', () => {
  const choices = createLocaleChoices(calendarLocales, ['en-US', 'invalid_locale']);
  it('offers each browser-supported language once and includes every package language', () => {
    const values = choices.map((choice) => choice.value);
    expect(values.length).toBeGreaterThan(100);
    expect(new Set(values).size).toBe(values.length);
    for (const pack of calendarLocales) expect(values).toContain(pack.code);
    const canonical = catalog.locales.flatMap((code) => {
      try {
        return Intl.getCanonicalLocales(code);
      } catch {
        return [];
      }
    });
    for (const code of Intl.DateTimeFormat.supportedLocalesOf(canonical, {
      localeMatcher: 'lookup',
    })) expect(values).toContain(new Intl.Locale(code).language);
    expect(values).toContain('en');
    expect(values).not.toContain('invalid_locale');
  });
  it('shows only the language while retaining native names and locale aliases for search', () => {
    const french = choices.find((choice) => choice.value === 'fr')!;
    expect(normalizeSearch(french.label)).toContain('french');
    expect(normalizeSearch(french.keywords ?? '')).toContain('francais');
    expect(normalizeSearch(french.keywords ?? '')).toContain('fr ca');
    expect(choices.find((choice) => choice.value === 'bn')?.label).toBe('Bangla');
    expect(choices.every((choice) => choice.detail === undefined)).toBe(true);
  });
  it('tracks package translations without displaying that metadata in the option', () => {
    expect(choices.find((choice) => choice.value === 'fr')?.packageTranslations).toBe(true);
    expect(choices.find((choice) => choice.value === 'bn')?.packageTranslations).toBe(false);
  });
  it('handles Arabic, Hebrew, Persian, Urdu and script-dependent directions', () => {
    for (const code of ['ar', 'he', 'fa', 'ur', 'pa-Arab'])
      expect(localeDirection(code)).toBe('rtl');
    for (const code of ['en-US', 'fr', 'hi', 'pa-Guru', 'az-Latn'])
      expect(localeDirection(code)).toBe('ltr');
  });
});

describe('Time-zone catalog', () => {
  it('offers every enumerated runtime zone, plus UTC and local, without canonical duplicates', () => {
    const choices = createTimeZoneChoices();
    expect(choices[0].value).toBe('local');
    expect(choices[1].value).toBe('UTC');
    const canonical = choices
      .filter((c) => c.value !== 'local')
      .map((c) => new Intl.DateTimeFormat('en', { timeZone: c.value }).resolvedOptions().timeZone);
    expect(new Set(canonical).size).toBe(canonical.length);
    expect(choices.every((choice) => choice.detail === undefined)).toBe(true);
    for (const zone of Intl.supportedValuesOf('timeZone'))
      expect(canonical).toContain(
        new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions().timeZone,
      );
    expect(choices.find((c) => c.value === 'Asia/Kolkata')?.keywords).toContain('Calcutta');
  });
  it('falls back to a full validated catalog when enumeration is unavailable', () => {
    vi.spyOn(Intl, 'supportedValuesOf').mockImplementation(() => {
      throw new Error('Unavailable');
    });
    const choices = createTimeZoneChoices();
    expect(choices.length).toBeGreaterThan(300);
    for (const choice of choices.filter((c) => c.value !== 'local'))
      expect(() => new Intl.DateTimeFormat('en', { timeZone: choice.value })).not.toThrow();
  });
});
