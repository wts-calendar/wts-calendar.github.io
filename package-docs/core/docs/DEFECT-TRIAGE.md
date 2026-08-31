# Release-candidate defect triage

Candidate: `@wts-calendar/core@1.1.1`

Triage date: 2026-08-31

## Current patch qualification

An authenticated live query of the configured public repository,
`Suman201/wts-calendar-angular-example`, confirmed Issues is enabled and found
zero open `P0`/`P1` issues on 2026-08-31. The current
`artifacts/defect-triage.json` records `repositoryVisibility: "public"`,
`queryAuthenticated: true`, `openBlockerCount: 0`, and `passed: true`.
All 338 core tests pass for 1.1.1. The patch includes RTL spans, localized
digits, event spacing, resize-target appearance, and toolbar lifecycle/theme fixes.

## Historical 1.0.0 qualification

Baseline commit at the start of review:
`a80bc1932abd68bc2392031f108844486c8d7cad`. The final release SHA is captured
by the CI `defect-triage.json` artifact; any working-tree qualification fixes
must be committed before that artifact is treated as release evidence.

## Severity policy

- **P0**: exploitable security issue, data loss/corruption, release artifact
  compromise, or a calendar that cannot initialize/destroy in a supported
  environment. Blocks RC and stable publication.
- **P1**: incorrect date/time/event/resource behavior, lifecycle leak, broken
  supported-browser flow, inaccessible critical interaction, or packaging/API
  defect with no safe workaround. Blocks stable publication and normally blocks
  the next RC.
- **P2/P3**: bounded defect with a safe workaround or non-critical cosmetic/docs
  issue. It must be recorded, but does not automatically block an RC.

## Query and disposition

The intended release query is:

<https://github.com/Suman201/wts-calendar-angular-example/issues?q=is%3Aissue%20state%3Aopen%20%28label%3AP0%20OR%20label%3AP1%29>

On 2026-08-26, the local gate used the existing Git credential to authenticate
to the configured private repository. It confirmed GitHub Issues is enabled and
queried both `P0` and `P1` labels. The result contained zero open blockers.
`artifacts/defect-triage.json` records `repositoryVisibility: "private"`,
`queryAuthenticated: true`, `openBlockerCount: 0`, and `passed: true`.

The source/test review found and fixed scoped-package migration defects in
premium license audience compatibility, regular-expression literals, and the
bundle resolver. During performance
evidence capture, the 100-cycle heap probe identified a P1 lifecycle defect: the
calendar-level `ResizeObserver` remained attached after `destroy()`, retaining
the core/facade, six DOM nodes, and the original event options per cycle. The
teardown now disconnects that observer, cancels pending sizing work, destroys
its listener scope, and removes the footer scrollbar. The existing 100-instance
lifecycle test now mocks the actual window-level observer, and its focused
69-test file passes.

The 2026-08-26 verified pinned local 100-cycle browser record reports 0 retained
calendars, 0 detached-node/document/listener growth, +956,676 bytes Month heap,
and +891,568 bytes TimeGrid heap. The current complete automated package record is 302
passing tests, and the focused lifecycle/cache browser record is 8 passing tests
in Chromium. The pinned report records the exact local runner fingerprint and
passes without CI.

Disposition: **Passed 2026-08-26 with zero open P0/P1 issues.**
Any new P0/P1 issue opened after a successful record invalidates the disposition
and requires a new triage date. Manual assistive-technology and npm publisher
evidence remain separate release gates; this triage does not waive them.
