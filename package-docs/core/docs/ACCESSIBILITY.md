# Accessibility conformance and test plan

The target for `1.0` is WCAG 2.2 Level AA for calendar-owned user interfaces.
Applications remain responsible for accessible surrounding content, custom
HTML, callback output, labels supplied by the application, and color choices
that override calendar defaults.

## Automated gate

`npm run test:accessibility` runs axe-core WCAG A/AA rules in Chromium, Firefox,
and WebKit across all canonical views, virtualized resources, keyboard drag
state, selection state, and modal focus management. The full browser gate also
tests keyboard, touch, RTL, print, timezone, and reduced-motion behavior.
Automated results must contain zero serious or critical violations and currently
enforce zero violations at every tested state.

The calendar-owned accessibility contract also includes:

- one roving grid stop with arrow, Home, and End navigation in every grid view;
- `aria-keyshortcuts` that match the currently available cell, event, drag,
  resize, activation, and cancellation commands;
- range-selection instructions that update when `selectable` or `dateClick`
  changes at runtime, without retaining stale or dangling `aria-describedby`
  references after controller replacement;
- semantic names and disabled state for selectable and unavailable cells;
- focus recovery after rerendering and virtualized resource-window changes;
- polite live feedback for selection, mutation, validation, history, loading,
  and cancellation state; and
- calendar-wide `prefers-reduced-motion` and `forced-colors` behavior using
  system colors for focus and selection boundaries.

The fresh 2026-08-26 release-candidate matrix completed with all 75 checks
passing: 25 each in Chromium, Firefox, and WebKit. It covers every canonical
view, virtualized resources, roving focus and keyboard actions, programmatic
selection, runtime shortcut/instruction metadata, reduced motion, forced
colors, and more-events popover focus/restoration. Automated success
does not replace the manual assistive-technology gate below.

## Manual gate

Automation cannot establish complete WCAG conformance. Before stable release,
run each script below and record tester, operating-system/browser/AT versions,
date, result, and issue links in the RC record.

For a deterministic native run, build and start `node e2e/server.mjs`, then
open the required view in Safari with
`http://127.0.0.1:4181/?voiceover=<view>`. The fixture supplies stable events,
resources, editing, selection, resizing, and overflow content. Supported values
include `month`, `week`, `day`, `list`, `resource`, `resource-timeline`,
`resource-time-grid-day`, `monthly-repeated-task`, and
`weekly-repeated-task`.

Automation readiness was attempted on 2026-08-12 with macOS 15.3, Safari 18.3,
and VoiceOver 10. Safari and VoiceOver launched, but the account did not have
VoiceOver Utility's “Allow VoiceOver to be controlled with AppleScript” setting
enabled and macOS denied synthetic keystrokes. No announcement evidence could
be collected, so this attempt is not a pass and the matrix remains pending.

### VoiceOver + Safari

1. Navigate month, week, day, list, resource, timeline, and repeated-task views
   using only keyboard and VoiceOver commands.
2. Confirm the view title, grid/table structure, dates, times, resources, event
   names, all-day state, selected state, unavailable state, and live updates are
   announced without redundant speech.
3. Open and close the more-events popover; verify initial focus, non-modal
   Tab navigation, outside-click dismissal, Escape, and focus restoration.
4. Create a selection, keyboard-drag an event, resize it, cancel, and commit;
   verify instructions, grabbed state, proposed time, validation failures, and
   completion are announced.
5. Repeat at 200% and 400% browser zoom, forced colors/high contrast where
   available, reduced motion, RTL, and narrow viewport.

### NVDA + Firefox and Chrome

Repeat the VoiceOver script with NVDA browse/focus modes. Verify grid navigation
does not trap the user, labels remain stable, and live-region messages are not
duplicated between browsers.

## Stable-release sign-off

| Matrix | Tester / environment | Date | Result | Issues |
| --- | --- | --- | --- | --- |
| VoiceOver + Safari | Not yet supplied | — | **Pending** | — |
| NVDA + Firefox | Not yet supplied | — | **Pending** | — |
| NVDA + Chrome | Not yet supplied | — | **Pending** | — |

Pending rows prevent WTS Calendar from claiming observed VoiceOver/NVDA
compatibility. They are recommended post-publication qualification and do not
block the npm artifact because the automated cross-engine accessibility gate is
the publication requirement.
