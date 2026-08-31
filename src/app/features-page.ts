import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS_BASE, FEATURES, FEATURE_GROUPS, PREMIUM_PREVIEWS } from './site-data';
@Component({
  selector: 'app-features-page',
  imports: [RouterLink],
  template: ` <section class="page-heading container">
      <span class="eyebrow">THE FEATURE DIRECTORY</span>
      <h1>Find your next<br /><em>possibility.</em></h1>
      <p>
        From a simple month calendar to advanced scheduling. Explore the package, see what is
        included, and find your starting point.
      </p>
    </section>
    <section class="container catalogue" aria-label="Feature catalogue">
      <div class="filter-bar">
        <label class="search-field"
          >Search features<input
            type="search"
            placeholder="Try recurrence, React, resources…"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
        /></label>
        <label
          >Category<select [value]="group()" (change)="group.set($any($event.target).value)">
            <option value="">All categories</option>
            @for (item of groups; track item) {
              <option [value]="item">{{ item }}</option>
            }
          </select></label
        >
        <label
          >License<select [value]="tier()" (change)="tier.set($any($event.target).value)">
            <option value="">All features</option>
            <option value="Free">Standard</option>
            <option value="Premium">Premium</option>
          </select></label
        >
      </div>
      <div class="results-line">
        <p role="status">{{ filtered().length }} features</p>
        <button class="text-button" (click)="reset()">Reset filters</button>
      </div>
      @for (section of sections(); track section.name) {
        <section class="feature-section">
          <h2>{{ section.name }}</h2>
          @if (previews[section.name]; as preview) {
            <figure class="premium-preview">
              <img
                [src]="preview.src"
                [alt]="preview.alt"
                loading="lazy"
                width="660"
                height="380"
              />
              <figcaption>
                <span class="badge premium">Premium</span> Illustrative preview · not a live demo or
                product screenshot
              </figcaption>
            </figure>
          }
          <div class="feature-grid">
            @for (feature of section.items; track feature.id) {
              <article class="feature-card" [attr.data-tier]="feature.tier">
                <div class="card-heading">
                  <h3>{{ feature.title }}</h3>
                  @if (feature.tier === 'Premium') {
                    <span class="badge premium">Premium</span>
                  }
                </div>
                <p>{{ feature.description }}</p>
                @if (feature.tier === 'Premium') {
                  <a routerLink="/pricing" class="card-link"
                    >View pricing <span aria-hidden="true">↗</span></a
                  >
                } @else if (feature.demo) {
                  <a [routerLink]="['/examples', feature.demo]" class="card-link"
                    >Try example <span aria-hidden="true">→</span></a
                  >
                } @else {
                  <a [href]="docs + feature.guide" class="card-link"
                    >Read guide <span aria-hidden="true">↗</span></a
                  >
                }
              </article>
            }
          </div>
        </section>
      } @empty {
        <div class="empty-state">
          <h2>No matching features</h2>
          <p>Try a broader search or reset the filters.</p>
        </div>
      }
      <p class="fine-print">
        Premium capabilities are listed for discovery only. This website does not run premium
        examples or collect license tokens.
      </p>
    </section>`,
})
export class FeaturesPage {
  readonly docs = DOCS_BASE;
  readonly groups = FEATURE_GROUPS;
  readonly previews = PREMIUM_PREVIEWS;
  readonly query = signal('');
  readonly group = signal('');
  readonly tier = signal('');
  readonly filtered = computed(() =>
    FEATURES.filter(
      (feature) =>
        (!this.group() || feature.group === this.group()) &&
        (!this.tier() || feature.tier === this.tier()) &&
        (feature.title + ' ' + feature.description + ' ' + feature.group)
          .toLowerCase()
          .includes(this.query().trim().toLowerCase()),
    ),
  );
  readonly sections = computed(() =>
    this.groups
      .map((name) => ({
        name,
        items: this.filtered().filter((feature) => feature.group === name),
      }))
      .filter((section) => section.items.length),
  );
  reset(): void {
    this.query.set('');
    this.group.set('');
    this.tier.set('');
  }
}
