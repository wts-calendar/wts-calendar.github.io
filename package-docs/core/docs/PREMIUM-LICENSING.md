# Backend premium licensing

Core 1.1.3 uses live backend authorization instead of the former signed-token system.
There are no pinned signing keys, token verification, signing scripts, or
offline token fallback. Consumers upgrading from the older token API must migrate.
Nothing in this document changes commercial purchase terms.

Request pricing or Premium access through the
[WTS Calendar request form](https://wts-calendar.github.io/pricing/). The package defaults to
`https://package-portal.dedicateddevelopers.us/api/public/licenses/verify`.
A browser-visible key is
a public deployment credential, never a privileged server secret or Google,
Microsoft, or CalDAV credential. Do not publish customer keys in examples.

## Calendar integration

```ts
import { WtsCalendar } from '@wts-calendar/core';
import { resourceSchedulingModule } from '@wts-calendar/core/resource-scheduling';

const calendar = await WtsCalendar.create({
  container: document.getElementById('calendar')!,
  plugins: [resourceSchedulingModule],
  view: 'resource',
  resources: [{ id: 'room', title: 'Meeting room' }],
}, {
  licenseKey: deploymentConfig.licenseKey,
  onStatusChange(status) {
    // Show renewal/retry UI. Do not clear user data.
    console.log(status.state);
  },
});

// Aborts verification and clears session timers before calendar cleanup.
calendar.destroy();
```

The factory derives the domain from the calendar's document. Initial failure
rejects before the premium calendar renders. Standard calendars still use
`new WtsCalendar(options)` without any network request.

Premium access is package-wide: a verified Premium or Enterprise license enables
all Premium capabilities defined by the installed Calendar package. The backend
authorizes the key, package version, origin and license policy; it does not need
to maintain a per-feature list for Calendar.

## Product branding

Branding is independent of license state and hidden by default. Applications
may opt in to a borderless **Powered by WTS Calendar** documentation link with
`branding: 'visible'`. Verification, refresh, expiry, or revocation never adds
public-facing attribution; those states only control premium authorization.

## Framework wrappers and premium modules

```ts
import { connectCalendarLicense } from '@wts-calendar/core';

const license = await connectCalendarLicense({
  licenseKey: deploymentConfig.licenseKey,
});
const options = { ...calendarOptions, license };
// Pass options to the Angular/React/Vue wrapper, or license to a premium module.
// After destroying every consumer that shares the session:
license.destroy();
```

The session is bound to one exact origin (scheme, host, port). A caller cannot
substitute another domain in a browser. Without a document, an explicit domain
is required; applications must authenticate native deployments separately.
Native deployments need an explicitly defined application binding and backend
verification mode. Do not treat a caller-supplied web domain as proof of native
application identity or claim this browser protocol verifies native deployments.

## Endpoint contract

The default endpoint is
`POST https://package-portal.dedicateddevelopers.us/api/public/licenses/verify`.
There is one request schema. There is no
contractVersion selector or legacy fallback. The backend must migrate stored
entitlements and route all requests through the package-specific evaluator.
See [the backend migration handoff](BACKEND-LICENSING-HANDOFF.md).

```json
{
  "secretKey": "wts_example_not_a_real_key",
  "npmName": "@wts-calendar/core",
  "packageVersion": "1.1.3",
  "domain": "https://customer.example"
}
```

The package sends its actual installed version; this example does not establish
that a particular customer owns that release. The server checks the key,
package grant, exact origin, administrative state, and trusted release catalog.
It selects the commercial model from stored grant data, never request input.

Success: HTTP 200, application/json, Cache-Control: no-store:

```json
{
  "valid": true,
  "status": "UPDATES_EXPIRED",
  "licenseModel": "PERPETUAL_VERSION",
  "versionAllowed": true,
  "domain": "https://customer.example",
  "tier": "premium",
  "updatesUntil": "2026-09-01T00:00:00.000Z",
  "supportUntil": null,
  "subscriptionEndsAt": null,
  "leaseExpiresAt": null,
  "verifiedAt": "2026-09-15T10:00:00.000Z",
  "refreshAfter": "2026-09-15T11:00:00.000Z",
  "package": {
    "npmName": "@wts-calendar/core",
    "version": "1.1.3",
    "premiumEnabled": true
  }
}
```

Calendar requires PERPETUAL_VERSION. Covered versions remain usable after
updatesUntil; the date is an update-coverage deadline, NOT runtime expiry.
Use ACTIVE before that deadline and UPDATES_EXPIRED afterwards, consistently
with verifiedAt. Both are allowed. All timestamps are UTC ISO-8601 ending in Z.
The returned package/version and normalized domain must match the request.
Perpetual subscriptionEndsAt and leaseExpiresAt must be explicitly null.

The response must authorize Premium access through tier (premium or enterprise),
package.premiumEnabled:true, valid:true, versionAllowed:true and the checks above.
The optional backend features field is ignored, whether it contains labels, IDs,
an empty list or is absent. It cannot grant access by itself or narrow the bundle.
No feature-label migration or per-key feature selection is required for Calendar.

license.status.features is still available, but is derived from the installed
package: resource-scheduling, repeated-task-views, advanced-resource-planning,
premium-interoperability and enterprise-workflow (including Time Machine).
It is empty without verified Premium access. Explicit Standard-tier downgrade,
revocation or Premium denial removes the bundle. Unknown features cannot be
introduced through a backend response. Optional licenseId/subject must be
non-secret bounded identifiers.

An uncovered release returns HTTP 403:

```json
{ "valid": false, "status": "VERSION_NOT_COVERED" }
```

REVOKED or SUSPENDED explicitly revoke access. Invalid credentials use HTTP
401/403 with valid:false. Maintenance non-renewal is not revocation. No response
may contain the submitted key or signing credentials.

Other packages on the same endpoint may use SUBSCRIPTION. Those clients must
enforce subscriptionEndsAt and bounded verification leases. Calendar rejects
subscription grants instead of treating them as perpetual. The backend handoff
defines both policies; Calendar's outage behavior must not be copied into a
subscription client.

## Revalidation and failure behavior

- Initial activation requires successful online verification. Old response
  shapes, tokens, wrong package/version/domain/model, invalid tier, and
  malformed timestamps cannot activate premium features.
- Default refresh interval is one hour with jitter, capped by the backend's
  refreshAfter recommendation. requestTimeoutMs defaults to ten seconds.
- A previously verified perpetual session retains only its existing features
  during a timeout, network error, HTTP 429/5xx, or malformed refresh response.
  No maintenance deadline or refresh timer removes covered runtime rights.
  Retry uses bounded backoff; page resume/reconnect revalidates stale sessions.
- An explicit denial clears authorization. Existing data is not deleted.
  A late response cannot restore a destroyed session.
- Offline revocation cannot be immediate while retaining perpetual access during
  outages. Initial activation after a page restart still needs the backend:
  no persistent unsigned cache or offline signed-token fallback exists.
- license.refresh() makes an explicit single-flight retry. license.status exposes
  state, effective features, installed package version, PERPETUAL_VERSION model,
  maintenance/support dates, and last server verification time.
- license.destroy() aborts pending work, clears its key and timers, and removes
  page listeners. Destroy manually connected/shared sessions yourself.
- requestTimeoutMs, refreshIntervalMs, signal, onStatusChange, and a trusted
  fetch override are available. Duration inputs are integral milliseconds,
  minimum 1000; maximum timeout is 60000 and refresh interval is 86400000.
- verificationUrl is optional. Omit it to use production; set it explicitly for
  a trusted staging service or customer proxy implementing this exact contract.
  Your deployment key is sent to that URL, so never take it from untrusted user
  input. Invalid overrides fail instead of falling back to production, and
  redirects are rejected. The SDK never calls the premium/contact request APIs.
- Production readiness still requires testing the deployed backend contract with a
  designated integration key for the intended origin and published package version.

## Development and production boundaries

The production HTTPS endpoint works from HTTPS applications and local HTTP
development pages without enabling an insecure exception. The backend must
allow each consuming origin through CORS, including OPTIONS preflight for JSON
POSTs, and return the expected JSON contract even for denials and outages.
Localhost authorization remains backend policy; the package never bypasses
verification or grants local premium access automatically.

For a private HTTP development service, explicitly set verificationUrl and
allowInsecureDevelopmentEndpoint=true on an HTTP localhost/private-network
page. A hosted HTTPS portal cannot enable this exception. file:// does not
supply a valid web origin; serve demos over localhost.

Supplying a production URL does not prove rollout readiness. Before releasing,
verify CORS, the response contract, and audited release/grant records using a
designated integration-test license. Package tests mock the transport and do
not submit customer keys or requests to production.

Backend hardening (key storage, entropy, rotation, rate limits, audit logs,
customer identity, domain ownership) is a separate responsibility, not proven
by a successful verify response. Client-side checks can be patched; sensitive
server operations must independently authorize every request.

## Migration

Remove verifyCalendarLicense(token), createLicensed(options, token), and
CalendarLicenseGrant/CalendarLicenseClaims references. Connect to the backend
instead; the `license` option now accepts only a live CalendarLicenseSession.
Old token strings and fabricated `{valid:true}` objects are rejected. Local
signing scripts are removed; existing private key files are not used or packed.
Plan this as a major release and migrate consumer applications before upgrading.
