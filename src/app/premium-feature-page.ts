import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DOCS_BASE, PREMIUM_FEATURES } from './site-data';
import { LicenseRequestForm } from './license-request-form';
import { PremiumNavigation } from './premium-navigation';
import { NotFoundPage } from './not-found-page';
import content from './premium-feature-data.json';
import { CodeCard } from './code-card';
import integrations from './premium-integration-data.json';
import { PremiumLiveDemo } from './premium-live-demo';

function compactIntegrationCode(source: string): string {
  const usesCalendar = source.includes('new WtsCalendar({');
  let code = source
    .replace(
      "import { WtsCalendar, connectCalendarLicense } from '@wts-calendar/core';",
      "import { WtsCalendar } from '@wts-calendar/core';",
    )
    .replace("import { connectCalendarLicense } from '@wts-calendar/core';\n", '')
    .replace(
      /const license = await connectCalendarLicense\(\{ licenseKey: 'YOUR_WTS_LICENSE_KEY' \}\);\n?/,
      '',
    )
    .replace("const container = document.querySelector<HTMLElement>('#calendar');\n", '')
    .replace(/if \(!container\) throw new Error\('Calendar container not found'\);\n?/, '')
    .replace(/\n?await calendar\.whenIdle\(\);\n?/, '\n')
    .replace(
      /\n\/\/ Call from your component's unmount\/destroy hook\.\nexport function dispose\(\) \{\n  calendar\.destroy\(\);\n  license\.destroy\(\);\n\}\s*$/,
      '',
    )
    .replace(
      /\nexport function dispose\(\) \{\n  calendar\.destroy\(\);\n  license\.destroy\(\);\n\}\s*$/,
      '',
    );

  if (usesCalendar) {
    code = code
      .replace('const calendar = new WtsCalendar({\n', 'const calendar = new WtsCalendar({\n  ...premiumCalendarOptions,\n')
      .replace(/^  container,\n/gm, '')
      .replace(/^  license,\n/gm, '')
      .replace(/^  viewDate: .*\n/gm, '')
      .replace(/^  timeZone: .*\n/gm, '')
      .replace(/^  startOfWeek: .*\n/gm, '')
      .replace(/^  height: .*\n/gm, '')
      .replace(/^  headerToolbar: \{ start: .*\n/gm, '');
  } else {
    code = code
      .replace(/^  license,\n/gm, '  license: premiumLicense,\n')
      .replace(/\{ license \}/g, '{ license: premiumLicense }');
  }

  return code.replace(/\n{3,}/g, '\n\n').trim();
}

const guides = new Map(content.map((guide) => [guide.id, guide]));
const examples = new Map(
  integrations.map((example) => [
    example.id,
    { ...example, code: compactIntegrationCode(example.code) },
  ]),
);

@Component({
  selector: 'app-premium-feature-page',
  imports: [
    RouterLink,
    PremiumNavigation,
    NotFoundPage,
    CodeCard,
    LicenseRequestForm,
    PremiumLiveDemo,
  ],
  template: `
    @if (selected(); as page) {
      <div class="premium-document-layout container">
        <aside class="premium-document-sidebar">
          <a routerLink="/features" class="text-link">← All features</a>
          <h2>Premium guides</h2>
          <app-premium-navigation [activeGroup]="page.feature.group" />
        </aside>
        <article class="premium-document" [attr.data-premium-feature]="page.feature.id">
          <div class="breadcrumb">
            <a routerLink="/features">Features</a><span aria-hidden="true">/</span>
            <span>{{ page.feature.group }}</span>
          </div>
          <span class="badge premium">Premium</span>
          <h1>{{ page.feature.title }}</h1>
          <p class="premium-document-intro">{{ page.guide.overview }}</p>
          <app-premium-live-demo
            [featureId]="page.feature.id"
            [title]="page.feature.title"
          />
          <nav class="premium-section-links" aria-label="On this page">
            <a [routerLink]="[]" fragment="configuration">Configuration</a>
            <a [routerLink]="[]" fragment="integration">Integration</a>
            <a [routerLink]="[]" fragment="behavior">Behavior</a>
            <a [routerLink]="[]" fragment="boundaries">Limitations</a>
            <a [routerLink]="[]" fragment="licensing">License</a>
          </nav>
          <section
            id="configuration"
            class="premium-doc-section"
            aria-labelledby="configuration-heading"
          >
            <h2 id="configuration-heading">What you configure</h2>
            <dl class="premium-reference">
              @for (setting of page.guide.configuration; track setting[0]) {
                <div>
                  <dt>{{ setting[0] }}</dt>
                  <dd>{{ setting[1] }}</dd>
                </div>
              }
            </dl>
          </section>
          <section
            id="integration"
            class="premium-doc-section"
            aria-labelledby="integration-heading"
          >
            <h2 id="integration-heading">Essential integration</h2>
            <p class="premium-integration-note">
              This assumes the shared <a routerLink="/docs">Quick start</a> already provides
              <code>premiumLicense</code> and, for UI views,
              <code>premiumCalendarOptions</code>. Only the feature-specific setup is shown.
            </p>
            <app-code-card
              label="Feature-specific TypeScript"
              kind="premium-integration"
              [code]="page.integration.code"
            />
          </section>
          <section id="behavior" class="premium-doc-section" aria-labelledby="behavior-heading">
            <h2 id="behavior-heading">Behavior and lifecycle</h2>
            <ul>
              @for (item of page.guide.behavior; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </section>
          <section
            id="boundaries"
            class="premium-doc-section premium-boundaries"
            aria-labelledby="boundaries-heading"
          >
            <h2 id="boundaries-heading">Limits and responsibilities</h2>
            <ul>
              @for (item of page.guide.limits; track item) {
                <li>{{ item }}</li>
              }
            </ul>
          </section>
          <section
            id="licensing"
            class="premium-doc-section premium-license-callout"
            aria-labelledby="licensing-heading"
          >
            <div>
              <span class="badge premium">Premium</span>
              <h2 id="licensing-heading">Enable this capability</h2>
              <dl class="premium-module-details">
                <div>
                  <dt>Optional module</dt>
                  <dd>{{ '@wts-calendar/core/' + page.guide.module }}</dd>
                </div>
                <div>
                  <dt>Local capability ID</dt>
                  <dd>{{ page.guide.entitlement }} · enabled by package-wide Premium</dd>
                </div>
              </dl>
              <p>
                Use the request form to describe your project and deployment origins. Pricing and
                terms are confirmed privately. A WTS license is separate from provider credentials;
                do not send passwords or production access tokens.
              </p>
              <button
                type="button"
                class="button primary"
                aria-haspopup="dialog"
                (click)="requestForm.open('NEW_ACCESS')"
              >
                Request a license →
              </button>
            </div>
          </section>
          <div class="premium-document-footer">
            <a
              [href]="docs + page.guide.guide"
              class="text-link"
              target="_blank"
              rel="noopener noreferrer"
              >Package reference ↗</a
            >
            <a routerLink="/features" class="text-link">Browse all features →</a>
          </div>
          <p class="fine-print">
            The live example uses a browser-visible deployment key restricted to this package and
            approved origins. It does not collect license keys or visitor credentials.
          </p>
        </article>
      </div>
    } @else {
      <app-not-found-page />
    }
    <app-license-request-form #requestForm />
  `,
})
export class PremiumFeaturePage {
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  readonly docs = DOCS_BASE;
  readonly selected = computed(() => {
    const feature = PREMIUM_FEATURES.find((item) => item.id === this.params()?.get('id'));
    const guide = feature && guides.get(feature.id);
    const integration = feature && examples.get(feature.id);
    return feature && guide && integration
      ? { feature, guide, integration }
      : null;
  });
}
