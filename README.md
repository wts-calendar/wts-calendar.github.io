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
- Examples: `/examples/month/` — 22 examples, with initial core configuration and callback activity.
- List: `/examples/list/` — Day / Week / Month / Year controls in the package-native header. Older list URLs redirect here with their initial range preserved.
- Interaction: `/examples/interactions/` — Month / Week / Day toolbar controls with editing and selection enabled across views.
- Multi-month and year: day-cell height follows the panel width through `--month-day-cell-min-height`; one event is shown per cell and a compact count opens the remaining events.
- Pricing: `/pricing/` — Standard/MIT and separately entitled Premium capabilities.
- Setup guides: `/docs/` — JavaScript, Angular, React, Vue, Web Component, and React Native.

The catalogue currently lists 94 capabilities: 63 Standard and 31 Premium. These
are feature listings, not a compatibility guarantee. The package documentation
is the API reference.

### Premium presentation

Premium capabilities are **listing-only**: a Premium badge, a description, a
pricing link, and static illustrations. The illustrations are labeled as
illustrative previews, not product screenshots. There are no premium runtime
examples, premium code snippets, license-token fields, or provider credential
forms in this application. Optional premium modules are not imported by the app.

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

The fixed-height month preview uses natural rows rather than `expandRows`.
The installed core 1.0.0 stylesheet expands the month header with that flag;
the preview configuration avoids the resulting empty viewport. This is not a
change to the library itself.

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
creates HTML for all 26 public pages, so direct links and refreshes work on static
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

This app currently validates the lockfile versions of `@wts-calendar/core@1.0.0`
and `@wts-calendar/angular@1.0.0`. Standard capabilities are MIT; Premium features
have separate entitlement requirements. This site showcases WTS Calendar.
