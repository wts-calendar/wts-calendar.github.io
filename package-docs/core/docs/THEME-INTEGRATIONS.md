# MUI, shadcn/ui and Angular Material themes

WTS provides three free, optional theme adapters in `@wts-calendar/core`:

- `@wts-calendar/core/theme-mui`: `createMuiCalendarTheme(theme, options?)`
- `@wts-calendar/core/theme-shadcn`: `createShadcnCalendarTheme(options?)`
- `@wts-calendar/core/theme-angular-material`: `createAngularMaterialCalendarTheme(options?)`

These are WTS-maintained integrations, not endorsements from the design-system vendors.
They map an application's design tokens to the calendar's existing DOM; they
do not replace its controls with MUI, Radix, or Angular Material components. All return calendar
options, work with the existing framework wrappers, and have no runtime imports
of Angular Material, React, MUI, Emotion, Tailwind, or shadcn. Keep the normal calendar CSS
import. The adapters are not automatically enabled by the core or `all` entry.

## Material UI (React)

Use the application's existing `ThemeProvider`, and call the adapter with
`useTheme()` **inside** that provider:

```tsx
import { useMemo } from 'react';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { WtsCalendarReact } from '@wts-calendar/react';
import { createMuiCalendarTheme } from '@wts-calendar/core/theme-mui';
import '@wts-calendar/core/styles/calendar.css';

const appTheme = createTheme({
  cssVariables: true,
  colorSchemes: { light: true, dark: true },
  shape: { borderRadius: 8 },
});

function ThemedCalendar() {
  const theme = useTheme();
  const appearance = useMemo(() => createMuiCalendarTheme(theme), [theme]);
  return (
    <WtsCalendarReact
      initialOptions={{ ...appearance, view: 'month' }}
      options={appearance}
      events={[]}
    />
  );
}

export default function App() {
  return <ThemeProvider theme={appTheme}><ThemedCalendar /></ThemeProvider>;
}
```

The adapter reads palette backgrounds, primary/contrast colors, text, divider,
selection, typography, shape, shadows, and direction. `theme.vars` takes
precedence where available, so MUI's CSS-variable color-scheme switching and
custom variable prefixes work without reading the DOM or rebuilding events.
With a non-CSS-variable theme, pass the updated adapter result through `options`
(or `calendar.setOptions`) when the provider changes. `initialOptions` alone is
mount-only. Numeric MUI corner radii become CSS pixel lengths.

MUI owns how the mode is selected (system preference or your configured
selector). Setting only WTS `colorScheme: 'dark'` cannot change MUI's variables.
For details see [MUI CSS theme variables](https://mui.com/material-ui/customization/css-theme-variables/usage/).

## shadcn/ui

Keep your existing global theme CSS (`:root`, `.dark`, and semantic variables)
and mount the calendar underneath that theme scope:

```tsx
'use client';

import { WtsCalendarReact } from '@wts-calendar/react';
import { createShadcnCalendarTheme } from '@wts-calendar/core/theme-shadcn';
import '@wts-calendar/core/styles/calendar.css';

const appearance = createShadcnCalendarTheme();

export function Calendar() {
  return (
    <WtsCalendarReact
      initialOptions={{ ...appearance, view: 'month' }}
      events={[]}
    />
  );
}
```

The adapter references `--background`, `--card`, `--foreground`, `--muted`,
`--muted-foreground`, `--border`, `--primary`, `--primary-foreground`, `--accent`,
`--ring`, `--radius`, and `--font-sans`. Changes to those variables, including
toggling `.dark` on an ancestor, update the mounted calendar automatically.
No Tailwind content scanning of WTS code is required. The default format expects
complete CSS colors (OKLCH, hex, RGB, or HSL functions).

Older shadcn themes store bare HSL channels, such as `--primary: 222 47% 11%`.
Use `createShadcnCalendarTheme({ colorFormat: 'hsl' })` for those themes. There
is no DOM-dependent auto-detection, so the same options can be created during SSR.
For details see [shadcn/ui theming](https://ui.shadcn.com/docs/theming).

## Angular Material (Material 3, v19+)

Use the application's existing `mat.theme()` configuration in global Sass. If
you do not have one yet, this is a minimal setup:

```scss
// src/styles.scss
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0,
  ));
}

// Optional application-controlled mode classes:
html.light-mode { color-scheme: light; }
html.dark-mode { color-scheme: dark; }
```

Keep `@wts-calendar/core/styles/calendar.css` in your Angular application's
global `styles` list, alongside `src/styles.scss`. Then use the adapter with
the existing Angular wrapper:

```ts
import { Component } from '@angular/core';
import { WtsCalendarAngularComponent } from '@wts-calendar/angular';
import { createAngularMaterialCalendarTheme } from '@wts-calendar/core/theme-angular-material';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [WtsCalendarAngularComponent],
  template: `<wts-calendar-angular [initialOptions]="initialOptions" />`,
})
export class CalendarComponent {
  readonly initialOptions = {
    ...createAngularMaterialCalendarTheme(),
    view: 'month' as const,
  };
}
```

The adapter maps `--mat-sys-*` surface, text, primary/on-primary, outline, font,
corner, and elevation tokens. It follows inherited CSS `color-scheme`, including
system preference with `light dark`, without recreating the calendar or events.
To replace WTS token overrides after mounting, use the wrapper's `[options]`
input. Changing only WTS's `colorScheme` option does not switch the Material
theme; Angular Material's CSS remains the source of truth.

Set `themeTokens` for WTS-specific adjustments:

```ts
createAngularMaterialCalendarTheme({
  themeTokens: { borderRadius: '8px' },
});
```

This does not apply Angular Material density, component overrides, ripples, or
its control templates to WTS. It does not inspect private `--mdc-*` variables.
Older themes without system tokens need explicit WTS `themeTokens`; automatic
Material 2 conversion is not provided. Default token fallbacks and modern
Material themes use `light-dark()`, so a supporting browser is required.
See [Angular Material theming](https://material.angular.dev/guide/theming) and
[system tokens](https://material.angular.dev/guide/theming-your-components).

## Overrides and other frameworks

All adapters accept `themeTokens` overrides; your overrides win. Only appearance
is changed; existing data, plugins, toolbar configuration, and callbacks remain
application-owned. MUI also supplies its `direction`; the other adapters leave direction
unchanged so the calendar's locale/direction options still apply.

```ts
const appearance = createShadcnCalendarTheme({
  themeTokens: { borderRadius: '6px', fontFamily: 'Inter, sans-serif' },
});
calendar.setOptions(appearance);
```

Spread the same options into Angular/Vue/vanilla calendar configuration. These
web theme adapters do not style the separate React Native renderer. They are
pure functions and safe to import during SSR; creating a web calendar still
requires a DOM. Colors using `color-mix()` require a browser supporting it.

Explicit event/source colors and custom HTML/render hooks remain authoritative.
If your shadcn `card` surface has a different text pair from the page, override
`text` with `var(--card-foreground)`. Custom controls and third-party plugins
must consume the tokens themselves. Applying a theme does not enable premium
features or change license requirements.

### Optional event editor

The built-in editor normally portals to `document.body`. To inherit a scoped
calendar theme (including scoped design-system themes), give it the calendar
host as its container:

```ts
import { createCalendarEventEditor } from '@wts-calendar/core/event-editor';

const editor = createCalendarEventEditor(calendar, {
  container: calendar.getOption('container'),
});
```

The editor uses the same surface/text, primary contrast, focus, font, radius,
and shadow tokens. Do not put this container underneath transformed or clipping
ancestors if the dialog must cover the viewport; alternatively use a dedicated
overlay host within the same theme scope and supply the WTS tokens there. Other
body-portaled/custom overlays are not automatically re-themed.

## Local preview

From `projects/calendar`, run `npm run build`, then `node e2e/server.mjs` and
open `http://127.0.0.1:4181/e2e/theme-integrations-fixture.html`. The fixture
shows all three adapters, light/dark switching, and standard view navigation.
Each preview uses the full available width, a single header toolbar, and
`height: 'auto'` so the complete month remains visible. The fixture's scoped CSS
sets compact rows and responsive, connected button groups; those layout choices
belong to the example, not the token adapters. On narrow screens the view
switcher wraps below navigation; List provides room for full event details.

The Angular Material preview uses representative system tokens. To verify with
the real library's generated styles, compile `e2e/theme-angular-material.scss`
using Sass with `@angular/material` available on the load path, then set
`WTS_ANGULAR_MATERIAL_THEME_CSS` to that CSS file when running
`playwright test e2e/theme-integrations.spec.ts`. This optional compatibility
run does not add Angular Material to the core package's dependencies.
