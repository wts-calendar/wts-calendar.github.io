# WTS Calendar showcase

A feature directory, interactive examples, framework setup guides, and pricing for [WTS Calendar](https://www.npmjs.com/package/@wts-calendar/core). Built with Angular 22 and the published Angular adapter.

## Run locally

Use Node.js 22.22.3+ or a compatible Node 24 release.

```bash
npm ci
npm start
```

Open [the local preview](http://localhost:4200).

## Explore

- Home: `/`
- Feature catalogue: `/features/` — search, category, and Standard/Premium filters. Only Premium features carry a badge.
- Premium guides: `/premium/resource-grid/` and 30 other feature-specific routes — actual-package screenshots, configuration, integration steps, behavior, and limitations.
- Examples: `/examples/month/` — 22 examples, with live runtime controls, copyable current configuration, and callback activity.
- List: `/examples/list/` — Day / Week / Month / Year controls in the package-native header. Older list URLs redirect here with their initial range preserved.
- Interaction: `/examples/interactions/` — Month / Week / Day toolbar controls with editing and selection enabled across views.
- Multi-month and year: day-cell height follows the panel width through `--month-day-cell-min-height`; one event is shown per cell and a compact count opens the remaining events.
- Pricing: `/pricing/` — Standard/MIT and separately entitled Premium capabilities.
- Setup guides: `/docs/` — JavaScript, Angular, React, Vue, Web Component, and React Native.
- API reference: `/docs/api/` — 248 client options, 95 public APIs, 78 event names, 447 exported symbol records across 23 entrypoints, and complete PHP/ASP.NET Core route settings.

The catalogue currently lists 94 capabilities: 63 Standard and 31 Premium. These
are feature listings, not a compatibility guarantee. The package documentation
are linked to a source-generated, searchable API reference.

### Premium presentation

Every Premium capability has its **own package-generated screenshot and documentation page**.
Feature cards and Premium sidebar links open that guide, not the pricing page.
Native UI screenshots show the actual package rendering with sample data. API-only
features show real return values in clearly labeled, application-owned capture
tables—not invented built-in product screens. Provider adapters run against local
test responses; screenshots do not imply a live provider connection.
Each guide documents configuration, integration steps, behavior, limits, module,
and entitlement, with an email-only license request button. Every guide includes a
copyable TypeScript integration example with an install command, host markup where
needed, and application responsibilities. These are inert documentation strings:
there are no live premium examples, license-token fields, or provider credential
forms. Optional premium modules are not imported or executed by the app.

The [integration examples](src/app/premium-integration-data.json) use placeholder
entitlements and runtime credential callbacks. The showcase check type-checks all
31 snippets against the installed package declarations without executing them.
Provider samples preview changes before a caller explicitly approves a write;
workflow samples state which behavior is memory-only and which adapters customers
must implement. Public page titles remain neutral; code retains exact exported API
identifiers so developers can copy valid calls.

Edit [premium-feature-data.json](src/app/premium-feature-data.json) for guide content.
To recapture, build the package repo and run:

```bash
npm run preview:premium -- /path/to/libraries/projects/calendar
```

The [private capture fixture](scripts/premium-previews/fixture.mjs) imports the real
package build. The localhost-only server reads the existing development license from
that repository, or `WTS_CALENDAR_PREVIEW_LICENSE` from the environment. Never place
license tokens in public assets, source files, or screenshot captions.

Open `http://127.0.0.1:4181/?feature=<feature-id>` for each guide. Wait for the visible
“Captured from the package runtime” status, inspect the complete result, and save a
browser region screenshot of `#capture` as `<feature-id>.jpg`. Include only the
calendar/result content, not the separate `#capture-info` verification panel.
Do not draw replacements or put package-version/build metadata into the pixels;
the public caption and manifest carry those details. This capture fixture and
its license endpoint are outside the Angular public directory and are not deployed.

After saving every capture to one directory, run:

```bash
node scripts/premium-previews/finalize.mjs /path/to/captures <captured-dist-sha256> <package-version>
npm run check:showcase
```

The build fingerprint appears at the local server's `/build.json`. The finalizer
copies browser images without drawing or synthesizing replacements. The committed
[screenshot manifest](src/app/premium-screenshot-manifest.json) records file hashes,
dimensions, capture types, fixture fingerprint, and the local package build used.
Checks reject missing, duplicated, modified, or obsolete preview assets. The current
captures use an unpublished local build; this work does not publish an npm package.

The licensing contact is **email-only**. Set the owner's confirmed public email
in `PREMIUM_CONTACT_EMAIL` in [site-data.ts](src/app/site-data.ts). A blank value
intentionally shows a pre-publication notice rather than a fake address or a
GitHub issue link. The release check fails until that address is configured.
The contact button opens a mail client; this static site does not send email.

A WTS license key is a signed feature entitlement, **not** a Google API key or
provider OAuth token. No price, support SLA, renewal policy, or automatic license
issuance is promised here. These terms are confirmed by email.

### Demo behavior

Events are deterministic September 2026 samples, held in memory. Changes reset on
reload or when switching examples. Event-source loading uses a local async
function; no remote provider is contacted. ICS import uses a bundled sample.
Only each example's relevant optional modules are loaded.

Each standard example includes **Configure live options**: searchable public API
settings grouped by the active view. Controls call `setOptions()` on the existing
calendar, validate changes, and restore the previous input value if an update is
rejected. Interaction controls are offered only when their module is loaded.
The focused group keeps the preview nearby; **All options** shows every offered
setting for that view. Construction-only settings, credentials, and premium
runtime features are not editable here.

**Current configuration & code** updates with the active view, date, and option
changes. It offers copy actions for a complete setup and a minimal runtime patch.
JavaScript, Angular, React, and Vue targets use the same current configuration,
with their actual wrapper lifecycle and ref/controller APIs. The React Native
target maps supported options to the native renderer; it explicitly marks
unsupported browser layouts/features and mount-only settings instead of copying
DOM APIs. Native examples use core/native 1.1.1 and the published React Native
1.1.0 wrapper; the browser portal uses the same core release.
Setup snippets contain the original sample events, not in-session event edits.
**Reset options** restores the example defaults without replacing its calendar,
changing the visible date/view, or discarding event edits. Clipboard failures
leave the code available for manual selection and copying.

The published core's explicit `dayView.hourSegment` and `weekView.hourSegment`
take precedence over `slotDuration`; the control updates all three public options
together. List time formatting uses `listView.eventTimeFormat`. Native toolbar
navigation and view switching use core 1.1.1 directly, including after runtime
option changes. The old toolbar-click/order workaround has been removed.
The dependency is installed from npm; no local build or package patch is used.
Customized toolbar titles and buttons use the package's theme tokens, including
dark and OS-driven color schemes, rather than fixed portal colors.

The localization demo searches the installed package's `calendarLocales` and the
[Unicode CLDR 48 locale catalog](https://github.com/unicode-org/cldr-json/blob/48.0.0/cldr-json/cldr-core/availableLocales.json),
filtered through `Intl.DateTimeFormat.supportedLocalesOf`. Search English or native
language names and locale codes. Options distinguish package translations from
date-format-only locales, whose package UI labels fall back to English. Event
titles remain application data. Direction uses the locale's script metadata,
including Hebrew, Persian, and Urdu; it is not limited to Arabic.

The time-zone demo searches `Intl.supportedValuesOf('timeZone')`, plus UTC and
browser local time. Older engines use the bundled, runtime-validated fallback.
The full 24-hour grid keeps shifted events reachable without modifying their
stored instants. Zone changes preserve the current displayed date rather than
moving to a neighboring week. Both selectors support arrows, Home/End, Enter, Escape, and Tab;
filtering alone never changes calendar options. Catalog data loads only in these
two examples. [Unicode data attribution](public/licenses/unicode-locale-data.txt)
ships with the public assets.

The fixed-height month preview uses natural rows rather than `expandRows` to
keep its header compact. This is an example configuration, not a library patch.

React Native is documented as a separate integration. The browser showcase
does not validate Android or iOS rendering.

## Verification

```bash
npm run check:showcase
npm test -- --watch=false
npm run build
npm run check:release
npm run build:pages
npm run build:pages:org
```

Tests mount all 22 examples against the installed published packages, exercise
source refresh, ICS import/export, themes, locale direction, and the event editor,
and verify navigation and premium-only presentation. These checks do not replace
manual screen-reader, touch, cross-browser, or native-device validation.

The standalone checks validate documentation links against this repository,
preview asset safety, premium-import restrictions, and deployment asset paths.
The production build retains the existing Angular bundle budgets.

## Clean URLs and SEO

Angular uses its default path routing, without a hash prefix. Build-time prerendering
creates HTML for all 62 public pages, including 31 Premium guides, so direct links and refreshes work on static
hosting and crawlers receive real page content. Interactive calendars initialize
only in the browser; no Node.js server or application backend is deployed.

Each page has a distinct title and description, one branded canonical URL,
Open Graph and Twitter cards, and factual JSON-LD website/page/breadcrumb data.
The build produces a sitemap, robots.txt, a 1200×630 social preview, a real 404 page
with noindex, and redirects for the five legacy example paths. Query-string variants
share the canonical page. Old `#/docs` and other hash bookmarks redirect safely to
their clean paths before Angular hydration. Ordinary section anchors are preserved.

Metadata lives in [seo-data.ts](src/app/seo-data.ts) and updates during in-app
navigation through [seo.service.ts](src/app/seo.service.ts). The social preview
source is [social-preview.svg](public/social-preview.svg); the committed PNG is used
by sharing services. No fabricated prices, reviews, ratings, or keyword stuffing
are included. Search engines control indexing and rankings; these changes do not
guarantee either. The sitemap can be submitted manually in Google Search Console.

## GitHub Pages and automatic deployment

`npm run build:pages:org` produces the branded organization-site build in:

```text
dist/wts-calendar-angular-example/browser/
```

The branded site's base URL is `/`. The build checks prerendered content, metadata,
canonical paths, internal links, assets, redirects, and sitemap coverage. License
notices are copied into the browser output automatically.

The source branch is **wts/source** in
[wts-calendar/wts-calendar.github.io](https://github.com/wts-calendar/wts-calendar.github.io).
Pushes to that branch run [deploy-pages.yml](.github/workflows/deploy-pages.yml):
locked dependency installation, showcase contract checks, all tests, prerendering,
SEO verification, artifact upload, and GitHub Pages deployment. Pull requests run
the checks but cannot deploy. Push-based deployment is active; GitHub only shows
the manual-run control when the workflow also exists on the default branch.

Pages uses **GitHub Actions** as its publishing source. Deployment uses the built-in
GitHub token and OIDC permissions; no personal access token, npm token, or provider
credentials are stored in the workflow. Actions are pinned to full commit hashes,
Node.js is pinned to 22.22.3, and package-lock.json controls dependencies. No npm
package or GitHub Release is published. The older `wts/gh-pages` branch is retained
as a snapshot, not as the active publishing source.

In this local checkout, the `portal` remote and `wts/source` upstream target the
branded repository. Commit source changes and run `git push` to trigger deployment.
The `origin` remote still points to the original Suman201 example repository.
Mirrored guide links target `portal`'s `wts/source` branch so documentation and
the deployed examples stay in sync; they do not use the original repository's `main`.

The branded URL is [the WTS Calendar demo](https://wts-calendar.github.io/).

The [original project site](https://suman201.github.io/wts-calendar-angular-example/)
remains available. To update it separately, use `npm run build:pages`, which uses
the `/wts-calendar-angular-example/` base path, and publish to `wts/gh-pages` in
`Suman201/wts-calendar-angular-example`. Do not deploy the organization-root build
to the project site, or vice versa. Only the branded repository is deployed by the
new workflow; the original repository is not modified by CI.

## Maintain the showcase

- [Feature catalogue, demo registry, and contact](src/app/site-data.ts)
- [Demo configurations](src/app/demo-setup.ts)
- [Calendar integration](src/app/calendar-demo.ts)
- [Pricing content](src/app/pricing-page.ts)
- [Static premium previews](public/previews)
- [Complete package documentation](package-docs/README.md)

Framework/package documentation stays in `package-docs/`; it is not a build
output directory. Do not overwrite it when preparing hosting artifacts.

## Packages and licensing

This app pins the published `@wts-calendar/core@1.1.1`
and `@wts-calendar/angular@1.0.1` releases. Standard capabilities are MIT; Premium features
have separate entitlement requirements. This site showcases WTS Calendar.
