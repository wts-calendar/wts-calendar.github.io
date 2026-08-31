# Configuration guide

Start with the installation and options sections in [README.md](../README.md).
Use ISO-8601 values with explicit offsets for instants, set `timeZone`
deliberately, assign stable unique IDs, and enable only the feature entry points
your application uses.

Display date/time digits follow the selected locale's numbering system, not just
its month and weekday names. For example, `locale: 'bn-BD'` uses Bengali digits;
`locale: 'ar-EG'` uses Arabic-Indic digits. Explicit Unicode numbering-system
extensions are supported: `bn-BD-u-nu-latn` keeps Bengali names with Latin digits,
while `th-TH-u-nu-thai` requests Thai digits. Languages whose locale defaults to
Latin digits continue to use them. This applies to built-in numeric date tokens,
date labels, time labels, and calculated week numbers. Custom formatting plugins
and custom week-number callbacks retain control of their output. Event titles,
IDs, ISO strings, and stored dates are not translated. Available locales depend
on the host's Intl/ICU data; unsupported locales use the host's normal fallback.

Month, DayGrid, and multi-month event rows have a 4 px vertical gap by default.
Adjust it on the calendar host with `--month-event-gap`; multi-day continuation
lanes and overflow links use the same spacing, including runtime CSS changes.

```css
#calendar {
  --month-event-gap: 4px;
}
```

Vertical resource views support `resource-day-grid-day`,
`resource-day-grid-week`, `resource-time-grid-day`, and
`resource-time-grid-week`. Set `datesAboveResources: true` for date-major
columns/headings; the default `false` uses resource-major columns/headings.

Resource scheduling views use a date-navigation-only header by default:
Previous, the active date range, and Next. Standard and repeated-task view
switches are not rendered in that default header. Other views keep their
existing defaults. To intentionally offer cross-view navigation, configure
`headerToolbar` explicitly; legacy `customHTML.headerElement.ordering` is
also respected. `headerToolbar: false` continues to hide the header.

Header and footer date titles use `--wts-calendar-text` in all color schemes.
Custom toolbar CSS should use the same token instead of a fixed light-theme
text color. Set `--calendar-toolbar-title-color` on the calendar host when an
intentional title-specific color is needed; keep its background contrast in mind.

The v7-compatible structural class hooks are `tableClass`,
`tableHeaderClass`, `tableBodyClass`, `dayHeaderRowClass`,
`dayHeaderDividerClass`, `dayRowClass`, `slotHeaderClass`,
`slotHeaderRowClass`, and `slotHeaderDividerClass`.

Treat remote loaders, adapters, fetch functions, and HTML hooks as privileged
application code. Remote source URLs may be relative or HTTP(S), may not embed
credentials, and have fixed retry/result ceilings. Validate mutations on the
server even when client-side constraints reject them.
