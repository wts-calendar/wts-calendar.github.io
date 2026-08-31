import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DOCS_BASE, LICENSE_REQUEST, PREMIUM_FEATURES } from './site-data';
import { PremiumNavigation } from './premium-navigation';
import { NotFoundPage } from './not-found-page';
import content from './premium-feature-data.json';

const guides = new Map(content.map((guide) => [guide.id, guide]));

@Component({
  selector: 'app-premium-feature-page',
  imports: [RouterLink, PremiumNavigation, NotFoundPage],
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
          <figure class="premium-feature-figure">
            <img
              [src]="'previews/premium/' + page.feature.id + '.svg'"
              [alt]="page.guide.visual.title + '. ' + page.guide.visual.subtitle"
              width="1120"
              height="640"
              fetchpriority="high"
            />
            <figcaption>
              Static illustration with sample data, not a live demo or product screenshot.
            </figcaption>
          </figure>
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
            <h2 id="integration-heading">Integration steps</h2>
            <ol>
              @for (step of page.guide.steps; track step) {
                <li>{{ step }}</li>
              }
            </ol>
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
                  <dt>Signed entitlement</dt>
                  <dd>{{ page.guide.entitlement }}</dd>
                </div>
              </dl>
              <p>
                Request the required features and deployment origins by email. Pricing and terms are
                confirmed privately. A WTS license is separate from provider credentials; do not
                send passwords or production access tokens.
              </p>
              @if (licenseRequest) {
                <a class="button primary" [href]="licenseRequest">Email for a license key →</a>
              }
            </div>
          </section>
          <div class="premium-document-footer">
            <a [href]="docs + page.guide.guide" class="text-link">Package reference ↗</a>
            <a routerLink="/features" class="text-link">Browse all features →</a>
          </div>
          <p class="fine-print">
            This public guide does not execute Premium modules or collect license tokens.
          </p>
        </article>
      </div>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class PremiumFeaturePage {
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);
  readonly docs = DOCS_BASE;
  readonly licenseRequest = LICENSE_REQUEST;
  readonly selected = computed(() => {
    const feature = PREMIUM_FEATURES.find((item) => item.id === this.params()?.get('id'));
    const guide = feature && guides.get(feature.id);
    return feature && guide ? { feature, guide } : null;
  });
}
