# API keys, OAuth, and browser credentials

This guide covers third-party provider credentials. A WTS Calendar premium
license is a backend-verified deployment entitlement, separate from provider API keys. To obtain and
use one, see [Premium licensing](PREMIUM-LICENSING.md).

WTS Calendar ships no API key, OAuth token, client secret, or provider account.
Provider access is configured by the consuming application at runtime. The
calendar does not operate a credential backend and does not persist credentials.

## Choose the correct credential

| Use case | Credential | Safe browser use |
| --- | --- | --- |
| Read a public Google Calendar | Google API key | Yes, only when restricted to the Calendar API, exact production origins, and an appropriate quota |
| Read or write a user's private Google Calendar | Short-lived OAuth access token | Yes, after an explicit user authorization flow; keep the token in memory |
| Read or write Microsoft 365/Outlook | Short-lived OAuth access token | Yes, after an explicit user authorization flow with the narrowest delegated scopes |
| Access CalDAV | Origin-compatible runtime authorization | Only when the provider supports browser CORS and a browser-safe token flow |
| Service account, OAuth client secret, or refresh token | Confidential credential | No; keep it on a customer-controlled backend |

## Google Calendar setup

1. Create or select a Google Cloud project owned by the application publisher.
2. Enable the Google Calendar API for that project.
3. For public-calendar reads, create an API key and restrict it to the Google
   Calendar API and the application's exact HTTPS referrer origins. Set quota
   alerts and rotate the key if it is exposed outside those restrictions.
4. For private or two-way access, configure an OAuth consent screen and a web
   OAuth client for the exact authorized JavaScript origins. Request only the
   scopes required by the feature.
5. Pass the resulting API key or short-lived access token at runtime. Never put
   an OAuth client secret or refresh token in frontend code.

An API key identifies the application; it does not authorize access to a
private calendar. A browser OAuth client ID is public configuration and is not
a bearer credential, but it must still be restricted to intended origins.

## Runtime examples

Public, read-only Google source. WTS transmits the key in Google's
`X-Goog-Api-Key` request header rather than putting it in the request URL:

```ts
import { WtsCalendar } from '@wts-calendar/core';
import { googleCalendarPlugin } from '@wts-calendar/core/google-calendar';

const calendar = new WtsCalendar({
  container,
  plugins: [googleCalendarPlugin],
  googleCalendarApiKey: runtimeConfig.googleCalendarApiKey,
  eventSources: [{
    id: 'public-calendar',
    googleCalendarId: 'public-calendar-id@group.calendar.google.com',
  }],
});
```

Private, two-way premium adapter:

```ts
import { PremiumCalendarInteroperability } from
  '@wts-calendar/core/premium-interoperability';

const interoperability = new PremiumCalendarInteroperability({ license });
const google = interoperability.createGoogleCalendarAdapter({
  calendarId: 'primary',
  accessToken: () => googleSession.currentAccessToken(),
  timeZone: 'Asia/Kolkata',
});
```

The callback should return a current short-lived token. On expiry, stop the
operation and require a safe refresh or user reconnection flow owned by the
application. Do not copy tokens into event metadata.

## Storage and logging rules

- Prefer memory-only access tokens in browser-only applications.
- Do not store access tokens in URLs, query strings, DOM attributes, calendar
  options that may be serialized, analytics, exception messages, or logs.
- Do not store refresh tokens, service-account keys, or client secrets in
  browser storage, source code, environment files committed to Git, npm
  packages, or static hosting configuration.
- Build-time frontend environment variables are usually embedded in the public
  JavaScript bundle; treat them as public even when their names contain
  `SECRET`.
- Redact authorization headers and provider payloads from diagnostics.
- Revoke and rotate a credential after suspected disclosure.

## When a backend is required

A customer-controlled backend is required for confidential OAuth clients,
refresh tokens, service accounts, durable unattended synchronization, webhook
verification, centralized audit retention, or authoritative authorization.
Browser-only runtime integration can support a signed-in session while the page
is active, but it cannot safely promise offline or unattended synchronization.

## Provider references

- [Google Cloud API-key best practices](https://docs.cloud.google.com/docs/authentication/api-keys-best-practices)
- [Google API-key restrictions](https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys)
- [Google Identity Services web authorization](https://developers.google.com/identity/oauth2/web/guides/overview)
- [Google Calendar OAuth scopes](https://developers.google.com/workspace/calendar/api/auth)
