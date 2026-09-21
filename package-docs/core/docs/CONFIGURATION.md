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

## Design-system themes

For applications with a design system, see [MUI, shadcn/ui and Angular Material themes](THEME-INTEGRATIONS.md).
The optional adapters map existing application tokens to `themeTokens` and can
be passed directly to `setOptions` or framework-wrapper configuration.

## Automatic event contrast

`eventContrastColor` accepts a CSS color or `'auto'`. It is unset by default, so
existing themes and event styling do not change until you opt in:

```ts
const calendar = new WtsCalendar({
  container: document.getElementById('calendar')!,
  eventContrastColor: 'auto',
  eventColor: '#143d59',
  events: [{ title: 'Review', start: '2026-09-16T10:00:00Z' }],
});
calendar.setOption('eventContrastColor', '#ffffff'); // fixed color
calendar.setOption('eventContrastColor', undefined); // restore existing styling
```

Auto selects whichever of black/white has the higher WCAG relative-luminance
contrast ratio against the event label's computed solid background. It uses the
actual rendered color (including WTS's per-event color tint), not the raw
`event.color`. Transparent backgrounds are composited with ancestor backgrounds;
an entirely transparent page falls back to white. Month/DayGrid, TimeGrid,
MultiMonth/year, List, and resource views share this behavior. Transparent
list-item labels use the calendar surface, not the event's colored dot.

Precedence is event `textColor`/`contrastColor`, source `textColor`/`contrastColor`,
global `eventTextColor`, then `eventContrastColor`. At each event/source level,
`textColor` wins if both aliases are supplied. An explicit `'auto'` at an event or
source level requests automatic contrast for that event. Theme `eventText` is
the fallback when no text/contrast option is set; it does not disable auto.

Auto updates after rendering and on runtime options, class/style changes on the
calendar or its ancestors, light/dark media changes, resize, and hover/focus.
CSS variables and browser-supported modern colors (including OKLCH) work.
Calculations are batched per frame; listeners are removed on unmount/destroy.
Changing a stylesheet rule directly through CSSOM requires a rerender.

Background/inverse-background events and explicitly styled children returned by
`eventContent` are not recolored. Images/gradients retain existing text styling:
use an explicit text color for those. This is not an accessibility guarantee
for gradients, overlapping layers, opacity, blend modes, or custom content.

## Responsive day columns

`dayNarrowWidth` is the day-column threshold in CSS pixels (default `100`). A
column strictly narrower than the threshold uses compact date text and a 12px
date-label font. Set `0` to disable this behavior. Negative, non-finite, and
non-numeric values are rejected; fractional pixel thresholds are accepted.

```ts
const calendar = new WtsCalendar({
  container: document.getElementById('calendar')!,
  view: 'month',
  dayNarrowWidth: 100,
  dayHeaderClassNames: ({ isNarrow }) => isNarrow ? 'compact-heading' : '',
});
calendar.setOption('dayNarrowWidth', 120);
```

Month, DayGrid, and MultiMonth/year use localized narrow weekday names and
unpadded day numbers. Week TimeGrid stacks the narrow weekday and day number;
the optional Day TimeGrid header uses an abbreviated date. Full accessible
date labels remain unchanged. Each MultiMonth panel measures its own columns,
including when columns change without a browser resize. Hidden columns are
measured when shown. This is a web-renderer feature, not React Native layout.

`ResizeObserver` tracks actual column widths, including parent-only resizing;
no event reload or view/date change is required. In environments without it,
initially measurable widths still apply, but automatic resize updates require
a `ResizeObserver` polyfill. `dayNarrowWidth` does not impose a minimum column
width, add horizontal scrolling, or change the event limit.
Week TimeGrid retains its existing 112px minimum day width. Use a threshold
above that (for example `120`) if you want compact labels at its minimum width,
or adjust the existing `--week-day-min-width` CSS variable separately.

`dayHeader*` and `dayCell*` hooks receive `isNarrow`. Content and class hooks
run again only when the narrow state changes; DOM mount/unmount hooks do not
repeat merely for a resize. Custom content hooks and an explicit
`weekDaysFormat` retain control over header text. Cells expose
`data-calendar-day-narrow="true|false"` and the `calendar-day-narrow` class.
Override the compact font with `--calendar-narrow-day-font-size` on the host.
Resource views, timeline slots, and list rows do not gain compact date formats
from this option.

## Product branding

`branding` accepts `visible` or `hidden` and can be changed at runtime with
`setOption`. The default is `hidden` for both standard and licensed calendars.

The borderless attribution link is rendered below the calendar grid and opens
the WTS Calendar documentation portal only when explicitly requested with
`branding: 'visible'`. Branding is not a license-enforcement mechanism. Backend
license checks remain the authorization boundary for premium capabilities.

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
