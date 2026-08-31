import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FEATURES, FEATURE_GROUPS, LICENSE_REQUEST } from './site-data';
@Component({
  selector: 'app-pricing-page',
  imports: [RouterLink],
  template: ` <section class="page-heading container centered">
      <span class="eyebrow">PRICING & LICENSING</span>
      <h1>Start building.<br /><em>Plan for more.</em></h1>
      <p>
        A complete standard calendar, with separately licensed capabilities for more demanding
        scheduling needs.
      </p>
    </section>
    <section class="pricing-grid narrow-container" aria-label="Plans">
      <article class="plan">
        <h2>Standard</h2>
        <p>Build your everyday calendar.</p>
        <div class="price">$0 <span>MIT license</span></div>
        <a class="button primary" routerLink="/docs">Get started →</a>
        <ul class="check-list">
          <li>Month, week, day, multi-month & list views</li>
          <li>Events, recurrence & time zones</li>
          <li>Drag, resize, selection & event editor</li>
          <li>Themes, localization & render hooks</li>
          <li>Framework wrappers & plugin SDK</li>
          <li>Standard accessibility & print capabilities</li>
        </ul>
        <a routerLink="/examples" class="text-link">Explore examples →</a>
      </article>
      <article class="plan premium-plan">
        <span class="badge premium">PREMIUM</span>
        <h2>Premium</h2>
        <p>For advanced scheduling and workflows.</p>
        <div class="price contact-price">Contact for pricing</div>
        @if (licenseRequest) {
          <a class="button primary" [href]="licenseRequest">Email for a license key →</a>
        } @else {
          <p class="notice">
            The licensing contact email will be added before this site is published.
          </p>
        }
        <ul class="check-list">
          <li>Resource grids, TimeGrid & timelines</li>
          <li>Capacity, shifts & advanced resource planning</li>
          <li>Repeated-task scheduling views</li>
          <li>Two-way sync & premium interoperability</li>
          <li>Approvals, policies & enterprise workflows</li>
          <li>Feature-specific signed license entitlement</li>
        </ul>
        <p class="fine-print">
          Scope, pricing, terms, and support are confirmed privately. No automatic purchase or trial
          is offered here.
        </p>
      </article>
    </section>
    <section class="narrow-container section-space">
      <div class="section-heading">
        <div>
          <span class="eyebrow">AT A GLANCE</span>
          <h2>The right capabilities<br />for your application.</h2>
        </div>
        <a routerLink="/features" class="text-link">Full feature directory →</a>
      </div>
      <div class="table-scroll" tabindex="0" role="region" aria-label="Plan comparison">
        <table>
          <caption>
            WTS Calendar feature availability
          </caption>
          <thead>
            <tr>
              <th scope="col">Capability</th>
              <th scope="col">Standard</th>
              <th scope="col">Premium</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.name) {
              <tr>
                <th scope="row">{{ row.name }}</th>
                <td>{{ row.premium ? 'Not included' : 'Included' }}</td>
                <td>{{ row.premium ? 'Separate entitlement' : 'Included in Standard' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
    <section class="narrow-container section-space faq">
      <span class="eyebrow">A FEW GOOD QUESTIONS</span>
      <h2>Before you build.</h2>
      <details>
        <summary>Can I use Standard commercially?</summary>
        <p>
          Standard features use the MIT license, including commercial use subject to its terms.
          Premium capabilities have separate licensing requirements.
        </p>
      </details>
      <details>
        <summary>How do I get a premium license key?</summary>
        <p>
          Use the “Email for a license key” button above to contact the maintainer. Describe the
          features and deployment scope you need. Pricing and license terms are confirmed privately
          before a signed license token is provided. Do not send provider passwords or production
          credentials.
        </p>
      </details>
      <details>
        <summary>Is a premium license the same as a Google API key?</summary>
        <p>
          No. A WTS license enables the licensed client-side features. Google, Microsoft, and CalDAV
          credentials remain separate and are managed by your application.
        </p>
      </details>
      <details>
        <summary>Does Premium include a hosted backend?</summary>
        <p>
          No. The package provides client-side capabilities and adapter interfaces. Durable storage,
          unattended synchronization, confidential credentials, and authoritative permissions
          require infrastructure you control.
        </p>
      </details>
      <details>
        <summary>Where are the premium examples?</summary>
        <p>
          Every Premium feature has a dedicated guide with an illustrative preview, configuration
          reference, integration steps, and limitations. Public interactive examples cover Standard
          features only.
        </p>
        <a routerLink="/premium/resource-grid">Explore Premium guides →</a>
      </details>
      <details>
        <summary>Are renewals, support response times, or developer seats fixed?</summary>
        <p>
          No such terms are published here. Confirm deployment scope, support, renewal, and
          redistribution terms directly with the maintainer.
        </p>
      </details>
    </section>`,
})
export class PricingPage {
  readonly licenseRequest = LICENSE_REQUEST;
  readonly rows = FEATURE_GROUPS.map((name) => ({
    name,
    premium: FEATURES.filter((f) => f.group === name).every((f) => f.tier === 'Premium'),
  }));
}
