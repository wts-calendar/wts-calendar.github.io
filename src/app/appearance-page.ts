import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeCard } from './code-card';
import { APPEARANCE_EXAMPLES } from './appearance-examples';
import { CLIENT_PACKAGE } from './api-reference-data.generated';

@Component({
  selector: 'app-appearance-page',
  imports: [RouterLink, CodeCard],
  styles: `
    :host {
      display: block;
    }
    .appearance-guide {
      max-width: 900px;
      padding-block: 32px 64px;
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 24px;
      margin: 24px 0;
    }
    section {
      margin-block: 36px;
      scroll-margin-top: 90px;
    }
    li {
      margin-block: 8px;
    }
  `,
  template: `
    <article class="container appearance-guide">
      <a routerLink="/docs">← Documentation</a>
      <h1>Themes & responsive appearance</h1>
      <p class="notice" role="note">
        <strong>Available in core {{ version }}.</strong>
        The theme adapters, responsive day labels, and automatic event contrast documented here
        are part of the published package. The live examples use this same pinned release.
      </p>
      <nav aria-label="Appearance guide">
        <a routerLink="/docs/appearance" fragment="contrast">Automatic contrast</a>
        <a routerLink="/docs/appearance" fragment="narrow">Responsive days</a>
        <a routerLink="/docs/appearance" fragment="mui">MUI</a>
        <a routerLink="/docs/appearance" fragment="shadcn">shadcn/ui</a>
        <a routerLink="/docs/appearance" fragment="angular-material">Angular Material</a>
      </nav>
      <section id="contrast">
        <h2>Automatic event text contrast</h2>
        <p>
          <code>eventContrastColor: 'auto'</code> selects black or white text using the relative
          luminance of the rendered event background, including the existing per-event tint. It is
          opt-in: unset preserves the theme. A CSS color sets a fixed foreground instead.
        </p>
        <app-code-card label="Automatic contrast" [code]="examples.contrast" />
        <p>
          Precedence: event textColor/contrastColor → source textColor/contrastColor → global
          eventTextColor → eventContrastColor. At each event/source level, textColor wins if both
          aliases are present. An event or source can also explicitly request 'auto'.
        </p>
        <p>
          Works across Month/DayGrid, TimeGrid, MultiMonth/year, List, and resource event views.
          Transparent labels use their ancestor surface, not the event's colored dot. An entirely
          transparent page falls back to white. Theme variables, modern CSS colors, runtime options,
          and ancestor class/style changes are recalculated after rendering.
        </p>
        <p>
          Background events and explicitly styled custom-content children are not recolored. Images
          and gradients keep existing text styling; choose an explicit color for them. Opacity,
          overlapping layers, blend modes, and custom content still need visual testing. Direct
          CSSOM stylesheet edits require a rerender.
        </p>
        <a routerLink="/docs/api" [queryParams]="{ entry: 'eventContrastColor' }"
          >Option reference →</a
        >
      </section>
      <section id="narrow">
        <h2>Responsive day labels</h2>
        <p>
          <code>dayNarrowWidth</code> defaults to 100 CSS pixels. A column strictly narrower than
          the threshold gets compact localized labels; 0 disables the behavior. Invalid, negative,
          or non-finite values are rejected.
        </p>
        <app-code-card label="Responsive day columns" [code]="examples.narrow" />
        <p>
          Month/DayGrid and MultiMonth/year use narrow weekdays and unpadded dates. Week TimeGrid
          uses stacked weekday/date labels; the optional Day header uses an abbreviated date. Each
          month panel is measured independently. Full accessible dates, event data, and focus remain
          intact. Explicit weekDaysFormat and custom content still take precedence; date hooks
          receive isNarrow.
        </p>
        <p>
          This does not shrink columns or remove TimeGrid's 112px minimum day width; try a 120px
          threshold there. List/resource layouts are not given automatic compact date formats. Live
          resizing uses ResizeObserver; without it only initial sizing is detected.
        </p>
        <a routerLink="/docs/api" [queryParams]="{ entry: 'dayNarrowWidth' }">Option reference →</a>
      </section>
      <section>
        <h2>First-party design-system adapters</h2>
        <p>
          These optional, Standard integrations map your app's theme tokens onto WTS controls. They
          do not replace them with native MUI, shadcn/Radix, or Angular Material components. Keep
          the global calendar CSS import. Adapters are separate entry points, not separate framework
          wrappers or automatically enabled plugins. Your themeTokens overrides win.
        </p>
      </section>
      <section id="mui">
        <h2>MUI</h2>
        <p>
          Call createMuiCalendarTheme inside your app's ThemeProvider. It maps palette, fonts,
          shape, shadows, and direction. theme.vars takes precedence when available. For plain
          themes, pass the new adapter result through options when the provider changes;
          initialOptions alone is mount-only.
        </p>
        <app-code-card label="MUI / React" [code]="examples.mui" />
        <a routerLink="/docs/api/exports" [queryParams]="{ entry: 'createMuiCalendarTheme' }"
          >Adapter signature →</a
        >
      </section>
      <section id="shadcn">
        <h2>shadcn/ui</h2>
        <p>
          Mount under your existing semantic-variable theme scope. Complete CSS colors are the
          default (including OKLCH); older bare HSL channels need colorFormat: 'hsl'. Changing an
          ancestor's .dark class updates inherited colors without rebuilding events.
        </p>
        <app-code-card label="shadcn/ui / React" [code]="examples.shadcn" />
        <a routerLink="/docs/api/exports" [queryParams]="{ entry: 'createShadcnCalendarTheme' }"
          >Adapter signature →</a
        >
      </section>
      <section id="angular-material">
        <h2>Angular Material</h2>
        <p>
          The Material 3 adapter uses Angular Material 19+ --mat-sys-* system tokens generated by
          mat.theme(). Keep the theme in global Sass and the calendar underneath its scope.
        </p>
        <app-code-card label="Global Material theme" [code]="examples.materialStyles" />
        <app-code-card label="Angular wrapper" [code]="examples.material" />
        <p>
          The app's CSS color-scheme controls light/dark mode. Changing only WTS colorScheme does
          not switch Material's palette. Density, ripples, component templates, and Material 2
          conversion are not provided. Older themes need explicit WTS themeTokens; light-dark()
          requires browser support.
        </p>
        <a
          routerLink="/docs/api/exports"
          [queryParams]="{ entry: 'createAngularMaterialCalendarTheme' }"
          >Adapter signature →</a
        >
      </section>
      <a routerLink="/examples/themes">Open the existing appearance example →</a>
    </article>
  `,
})
export class AppearancePage {
  readonly version = CLIENT_PACKAGE.version;
  readonly examples = APPEARANCE_EXAMPLES;
}
