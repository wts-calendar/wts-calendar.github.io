# Security review

Reviewed for `1.0.0` on 2026-08-12. This review covers package-owned code;
trusted application callbacks and infrastructure require separate review.

| Surface | Control and evidence | Residual responsibility |
| --- | --- | --- |
| HTML rendering | Titles, descriptions, resource labels, and default icons use text nodes/attributes. `customHTML` and task icon HTML are explicitly trusted hooks. | Sanitize untrusted markup before passing trusted HTML options; enforce CSP in the application. |
| Event navigation | Event links accept only `http:`, `https:`, `mailto:`, and `tel:` before navigation. | Applications decide whether external navigation and `mailto:`/`tel:` fit policy. |
| Remote event/resource/task sources | URL validation permits HTTP(S), rejects embedded credentials, allows relative same-origin paths, supports abort signals, and caps retries at 10, delay at five minutes, and each result at 50,000 records. | Use HTTPS, authenticate in headers, restrict CORS, and validate server authorization. Custom fetch/loaders are trusted code. |
| Google Calendar | API responses are paginated with a 100-page ceiling and per-page maximum of 2,500. Public sources send restricted API keys in `X-Goog-Api-Key`, not the URL. Private browser-only sources use an explicit Google Identity Services connection, keep short-lived tokens in memory, require user-driven reconnection, and enforce the Bearer header. API keys are omitted in OAuth mode. | Configure exact authorized JavaScript origins and the narrowest scope. Never place client secrets or refresh tokens in browser code. Browser-only mode cannot provide offline sync. |
| iCalendar | Input is capped at 5,000,000 characters and 10,000 events before normalization. | Fetch untrusted feeds through a controlled origin with response-size and timeout limits. |
| Recurrence | Expansion is bounded by visible range, a 100-year future split ceiling, and 1,000 occurrences per event/day. | Avoid unbounded custom recurrence plugins. |
| Licensing (unreleased replacement) | Backend sessions validate package/version, origin, perpetual commercial model, explicit Premium authorization and bounded JSON responses. Premium capabilities are defined by the installed package; backend feature metadata is ignored. HTTPS, request cancellation, and safe session teardown are required; no signed-token fallback remains. | Entitlements are not data authorization. Browser keys are public deployment credentials. Server security and data migration require independent validation. Perpetual current-session use during outages cannot guarantee immediate offline revocation. |
| Drag/drop and clipboard | Internal/external drags use registered objects and DOM state; no serialized `DataTransfer` payload is evaluated as code or HTML. | Validate all changes again on the server before persisting. |
| Supply chain | Lockfile installs, dependency review, audit/signature checks, license inventory, clean packed-artifact smoke, reproducible-build comparison, OIDC trusted publishing, and npm provenance are release gates. Core's isolated lockfile audited with 0 vulnerabilities on 2026-08-26. The wrapper release also audits the root production tree and currently fails on 17 advisories; none of those peer/build packages are bundled into the wrapper tarballs. | Remediate the root Angular/SSR and Express advisories, configure the exact public repository and npm trusted publishers, then rerun both audits before release. |

No embedded credentials, dynamic code evaluation, or unsafe event URL bypass was
found in the reviewed package source. The trusted HTML hooks are intentional and
remain the primary integration risk.
