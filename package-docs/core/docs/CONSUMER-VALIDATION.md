# Consumer application validation

Candidate: `@wts-calendar/core@1.1.1`

Validation date: 2026-08-31

Command: `npm run consumer:verify`

The gate packs the calendar and official adapter packages, creates two clean
standalone applications in temporary directories, installs only the packed
artifacts and declared framework dependencies, builds production browser
bundles, launches Chromium, and verifies the mounted view and event data. The
temporary applications are removed after the run.

## React standalone consumer

- Application/framework: React 19.2.8
- Adapter: `@wts-calendar/react@1.0.1`
- Calendar installation: packed `@wts-calendar/core@1.1.1` artifact
- Install: passed from freshly packed scoped artifacts (`9` packages installed)
- Build: passed
- Required runtime assertion: Week TimeGrid mounts through the optional
  `time-grid` entry; one event is exposed by the calendar API and rendered in
  Chromium
- Runtime: passed; Week TimeGrid mounted, one event was exposed through the
  calendar API, and the event rendered in Chromium without console/page errors
- Findings: none
- Approval: **Approved**

## Vue standalone consumer

- Application/framework: Vue 3.5.41
- Adapter: `@wts-calendar/vue@1.0.1`
- Calendar installation: packed `@wts-calendar/core@1.1.1` artifact
- Install: passed from freshly packed scoped artifacts (`29` packages installed)
- Build: passed
- Required runtime assertion: `list-week` mounts through the optional `list`
  entry; one event is exposed by the calendar API and rendered in Chromium
- Runtime: passed; List Week mounted, one event was exposed through the calendar
  API, and the event rendered in Chromium without console/page errors
- Findings: none
- Approval: **Approved**

Every successful run writes the local evidence file
`artifacts/consumer-validation.json`. The validation is fail-closed:
installation, packing, bundling, browser console
errors, page errors, view identity, event count, or visible event rendering
failures produce a non-zero exit status.

Earlier 2026-08-19 and 2026-08-26 evidence is historical; this approval uses
freshly built and packed 1.1.1 core artifacts, not a local link in the example portal.
