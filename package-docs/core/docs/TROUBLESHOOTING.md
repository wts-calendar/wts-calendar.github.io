# Troubleshooting

- Blank or unlicensed premium view: verify the backend response's package,
  installed version, origin, PERPETUAL_VERSION model, and explicit features.
  Check HTTPS/CORS and the single-schema contract in PREMIUM-LICENSING.md.
- Event appears on the wrong date: distinguish floating local date/time from an
  instant with offset and set the calendar timezone explicitly.
- Remote source fails: listen for the matching `*-source-failure` event and
  inspect HTTP status/CORS; credentials belong in headers, not URLs.
- Package import fails: use a documented export path and a supported Node
  version; do not deep-import `dist` internals.
- Keyboard action does not start: focus the event or resize handle first and
  check `editable`, `startEditable`, and `durationEditable`.
- Visual clipping: verify the host has a measurable width/height and that global
  CSS has not overridden calendar box sizing or overflow.

When filing a reproducible defect, include package/browser/OS versions, view,
timezone, minimal options/data, expected/actual behavior, and an isolated case.
