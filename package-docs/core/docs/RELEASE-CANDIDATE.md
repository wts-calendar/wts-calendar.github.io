# Release-candidate qualification

Candidate: `@wts-calendar/core@1.1.1`

Target npm tag: `latest`

Qualification date: 2026-08-31

## Automated gates

Run `npm run release:check` from this directory. It must pass TypeScript, unit,
browser/assistive-rule, visual, performance, legal inventory, two-build
reproducibility, packed-tarball allowlist, ESM/CJS/export consumer smoke, and
release metadata checks. It also builds and verifies the reference third-party
plugin from its packed artifact, including compatibility metadata, ESM/CJS,
strict declarations, behavior, rollback, and lifecycle cleanup. CI additionally runs `npm audit --audit-level=high`
and `npm audit signatures` with current registry metadata.

This patch uses the owner's authorized local npm publication workflow. No CI
job, Git tag, GitHub Release, or website deployment is required or dispatched.
Local publication does not produce an OIDC provenance attestation; the publish
command explicitly disables provenance for this invocation only, without changing
the package's CI provenance default or npm authentication requirements. The
verified packed artifact is published as `latest` only after its local gates pass.

## Qualification evidence

The final 1.1.1 build passes 338 unit tests, TypeScript, both fresh React/Vue
consumer builds, packed ESM/CJS/TypeScript smoke checks, legal inventory, and
byte-for-byte reproducibility across 162 build files. Core is 91.24 KiB gzip
(100 KiB budget); the complete entry is 207.26 KiB gzip (220 KiB budget).

The initial full browser matrix had 573 passes, 92 intentional skips, and
seven failures: stale Arabic-digit expectations in four projects, one print
baseline reflecting the intentional event-gap change, and two toolbar hover
contrast failures. The locale expectation and reviewed print baseline were
updated; the grouped-toolbar transition specificity defect was fixed in source.
The final four-file cross-browser regression/accessibility run passes all 121
applicable cases (39 intentional skips), including every initially failing case.
No accessibility threshold was relaxed, and automated engine tests are not manual
screen-reader sign-offs.

The first exact-pin performance run passed all six comparison/DOM budgets and
both 100-cycle heap gates, but TimeGrid at 1,000 events failed run-to-run timing
stability (about 20% for WTS; the reference also varied). Its complete report is
preserved at `artifacts/performance-report-1.1.1-attempt-1.json`. This failed run
does not approve publication. The repeat retained the same pin, workload, and
limits and passed every enforced gate, including WTS timing stability. Heap
growth was +963,760 bytes for Month and +892,848 bytes for TimeGrid, with zero
retained calendars or DOM/document/listener growth. The reference's diagnostic
stability flag remains false; it is not an enforced gate, and no claim of reference
timing stability is made. Both attempt records are retained.

| Gate | Owner / evidence | Status |
| --- | --- | --- |
| VoiceOver + Safari script | Tester record in `docs/ACCESSIBILITY.md`; post-publication compatibility evidence, not a publication gate | **Pending / no compatibility claim** |
| NVDA + Firefox script | Tester record in `docs/ACCESSIBILITY.md`; post-publication compatibility evidence, not a publication gate | **Pending / no compatibility claim** |
| NVDA + Chrome script | Tester record in `docs/ACCESSIBILITY.md`; post-publication compatibility evidence, not a publication gate | **Pending / no compatibility claim** |
| Consumer application 1 | [`docs/CONSUMER-VALIDATION.md`](CONSUMER-VALIDATION.md): React clean packed scoped install, build, runtime, findings, and approval | **Passed 2026-08-31** |
| Consumer application 2 | [`docs/CONSUMER-VALIDATION.md`](CONSUMER-VALIDATION.md): Vue clean packed scoped install, build, runtime, findings, and approval | **Passed 2026-08-31** |
| P0/P1 defect triage | [`docs/DEFECT-TRIAGE.md`](DEFECT-TRIAGE.md): authenticated live query against the configured public repository, reviewed source, and invalidation rule; zero open P0/P1 issues | **Passed 2026-08-31** |
| Capability ledger | [`docs/CAPABILITY-LEDGER.md`](CAPABILITY-LEDGER.md), 70 numbered/evidenced rows, verifier-enforced score **70/70** | **Passed 2026-08-12** |
| Performance and bundle budgets | Fresh 1.1.1 exact-pin run: all six comparison/DOM limits, WTS timing stability, and both 100-cycle lifecycle checks passed; reference-stability diagnostic remains false as noted above | **Passed 2026-08-31** |
| Package metadata | Repository and issue links identify `Suman201/wts-calendar-angular-example` (public). Homepage is `https://wts-calendar.github.io/premium/resource-grid`, verified HTTP 200 after its canonical trailing-slash redirect | **Passed 2026-08-31** |
| Wrapper build dependency audit | Core and root production audits both report 0 vulnerabilities after upgrading the wrapper/application harness to Angular 21.2.x and Express 4.22.2 | **Passed 2026-08-26** |
| Publication authentication | Owner `suman_mandal` published the verified tarball locally. npm confirms version 1.1.1, `latest`, and the requested homepage. No CI provenance is claimed | **Published 2026-08-31** |

No pending row may be represented as completed without dated evidence. The
manual screen-reader rows do not block publication and must remain described as
untested until observed. Pending publication gates still block `latest`. The
npm-side trusted-publisher proof blocks tokenless publication until npm has
accepted the exact OIDC claims.

Published artifact integrity (verified against the registry):
`sha512-vr6B1OQIuKZJwOxvI2sLAUV4LLTJxsCEoZX50riOooAoHukYYEytXPRT+E9XeCBoMTR7fIO3Q9CFEutJV3iG3A==`.
The public tarball contains 151 files, 739,883 packed bytes, and 3,020,383
unpacked bytes. No GitHub Release or website deployment was performed.

## Rollback

Do not overwrite a published version. Deprecate a defective RC, fix forward to
the next `-rc.N`, and keep `latest` unchanged. For a stable incident, follow the
security policy, publish a patched version, and deprecate the affected version
with a concise install warning.
