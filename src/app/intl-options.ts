import type { CalendarLocale } from '@wts-calendar/core';
import type { SearchChoice } from './searchable-select';
import catalog from './intl-catalog-data.json';

export interface LocaleChoice extends SearchChoice {
  direction: 'ltr' | 'rtl';
  packageTranslations: boolean;
}
type LocaleMetadata = Intl.Locale & {
  getTextInfo?: () => { direction: string };
  textInfo?: { direction: string };
};
// Fallback for browsers without either generation of Intl.Locale text metadata.
const RTL_SCRIPTS = new Set(['Adlm', 'Arab', 'Hebr', 'Nkoo', 'Rohg', 'Syrc', 'Thaa']);
export function localeDirection(code: string): 'ltr' | 'rtl' {
  const locale = new Intl.Locale(code) as LocaleMetadata;
  const direction = locale.getTextInfo?.().direction ?? locale.textInfo?.direction;
  if (direction === 'rtl' || direction === 'ltr') return direction;
  return RTL_SCRIPTS.has(locale.maximize().script ?? '') ? 'rtl' : 'ltr';
}
export function createLocaleChoices(
  packs: readonly CalendarLocale[],
  preferred: readonly string[] = [],
): LocaleChoice[] {
  const candidates = new Set<string>();
  for (const code of [
    ...catalog.locales,
    ...packs.map((pack) => pack.code),
    'en-US',
    ...preferred,
  ]) {
    try {
      candidates.add(Intl.getCanonicalLocales(code)[0]);
    } catch {
      /* Ignore invalid browser hints. */
    }
  }
  const englishNames = new Intl.DisplayNames(['en'], { type: 'language' });
  const packsByLanguage = new Set(packs.map((pack) => new Intl.Locale(pack.code).language));
  const localesByLanguage = new Map<string, string[]>();
  for (const code of Intl.DateTimeFormat.supportedLocalesOf([...candidates], {
    localeMatcher: 'lookup',
  })) {
    const language = new Intl.Locale(code).language;
    const aliases = localesByLanguage.get(language) ?? [];
    aliases.push(code);
    localesByLanguage.set(language, aliases);
  }
  return [...localesByLanguage.entries()]
    .map(([language, aliases]) => {
      const native =
        new Intl.DisplayNames([language], { type: 'language' }).of(language) ?? language;
      const packageTranslations = packsByLanguage.has(language);
      const direction = localeDirection(language);
      return {
        value: language,
        label: englishNames.of(language) ?? language,
        keywords: [native, ...aliases].join(' '),
        direction,
        packageTranslations,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'en'));
}
export function createTimeZoneChoices(): SearchChoice[] {
  // Prefer this browser's live IANA catalog. The bundled list is only for older engines.
  const supportedValuesOf = (
    Intl as typeof Intl & { supportedValuesOf?: (key: 'timeZone') => string[] }
  ).supportedValuesOf;
  let zones: readonly string[] = catalog.timeZones;
  try {
    if (supportedValuesOf) zones = supportedValuesOf('timeZone');
  } catch {
    /* Use validated fallback. */
  }
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const choices: SearchChoice[] = [
    {
      value: 'local',
      label: 'Browser local time',
      keywords: localZone + ' system device automatic',
    },
    {
      value: 'UTC',
      label: 'UTC',
      keywords: 'GMT Coordinated Universal Time universal zero',
    },
  ];
  // Preserve the existing Kolkata choice across engines that still enumerate Calcutta.
  const seen = new Set<string>(['UTC']);
  for (const zone of [...new Set([...zones, localZone, 'Asia/Kolkata'])].sort()) {
    try {
      const canonical = new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions()
        .timeZone;
      if (seen.has(canonical)) continue;
      seen.add(canonical);
      const value = /Asia\/(Calcutta|Kolkata)/.test(canonical) ? 'Asia/Kolkata' : zone;
      choices.push({
        value,
        label: value.replaceAll('_', ' '),
        keywords: canonical + (value === 'Asia/Kolkata' ? ' Calcutta India' : ''),
      });
    } catch {
      /* Never offer a zone this runtime rejects. */
    }
  }
  return choices;
}
