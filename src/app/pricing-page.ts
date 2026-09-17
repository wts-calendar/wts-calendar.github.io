import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FEATURES, FEATURE_GROUPS } from './site-data';
import { LicenseRequestForm } from './license-request-form';
@Component({
  selector: 'app-pricing-page',
  imports: [RouterLink, LicenseRequestForm],
  template: ` <section class="page-heading container">
      <span class="eyebrow">LICENSING / CAPABILITY TIERS</span>
      <h1>Choose the capabilities you need</h1>
      <p>
        Use the MIT-licensed core for standard calendar workflows. Add commercial modules only for
        resource planning, interoperability, and controlled enterprise workflows.
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
        <button
          type="button"
          class="button primary"
          aria-haspopup="dialog"
          (click)="requestForm.open('PRICE_QUOTE')"
        >
          Request pricing →
        </button>
        <ul class="check-list">
          <li>Scheduler views, resource management & virtualized scrolling</li>
          <li>Capacity, shifts & advanced resource planning</li>
          <li>Repeated-task scheduling views</li>
          <li>Two-way sync & premium interoperability</li>
          <li>Approvals, policies & enterprise workflows</li>
          <li>Package-wide Premium authorization</li>
        </ul>
        <p class="fine-print">
          Pricing is quoted for your use case and deployment scope. Before purchasing,
          contact us to discuss evaluation availability and confirm the license terms.
        </p>
      </article>
    </section>
    <section class="narrow-container section-space" id="evaluation">
      <span class="eyebrow">EVALUATION PROCESS</span>
      <h2>Verify the module against your use case.</h2>
      <ol class="evaluation-steps">
        <li>
          <strong>Try Standard.</strong> Test the event editor, views, and your framework
          integration without a license key.
          <a routerLink="/examples/event-editor">Open the editable calendar →</a>
        </li>
        <li>
          <strong>Review the Premium guide.</strong> Each feature includes a package screenshot,
          integration code, supported behavior, and limitations.
          <a routerLink="/premium/resource-grid">Start with resource planning →</a>
        </li>
        <li>
          <strong>Send your request.</strong> Include your company, deployment websites, and a short
          message. Ask about evaluation availability, price, updates, support, and redistribution
          terms.
        </li>
      </ol>
      <button
        type="button"
        class="button primary"
        aria-haspopup="dialog"
        (click)="requestForm.open('NEW_ACCESS')"
      >
        Ask about pricing & evaluation →
      </button>
      <p class="fine-print">
        Evaluation access and commercial terms are confirmed by email before a key is issued. This
        inquiry does not create a purchase or guarantee a trial. No provider passwords are needed.
      </p>
    </section>
    <section class="narrow-container section-space">
      <div class="section-heading comparison-heading">
        <div>
          <span class="eyebrow">PLAN COMPARISON</span>
          <h2>Compare feature access</h2>
          <p>Standard covers the complete calendar foundation. Premium adds specialized modules.</p>
        </div>
        <a routerLink="/features" class="text-link">Full feature directory →</a>
      </div>
      <div
        class="table-scroll capability-comparison"
        tabindex="0"
        role="region"
        aria-label="Plan comparison"
      >
        <table class="plan-comparison">
          <caption>
            WTS Calendar feature availability
          </caption>
          <thead>
            <tr>
              <th scope="col">Capability</th>
              <th scope="col">
                <span class="plan-column-title">Standard</span>
                <span class="plan-column-note">MIT licensed</span>
              </th>
              <th scope="col" class="premium-column">
                <span class="plan-column-title">Premium</span>
                <span class="plan-column-note">Commercial modules</span>
              </th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.name) {
              <tr>
                <th scope="row">
                  <span class="capability-title">{{ row.label }}</span>
                  <span class="capability-description">{{ row.description }}</span>
                </th>
                <td>
                  @if (row.premium) {
                    <span class="coverage-status unavailable">
                      <span class="status-mark" aria-hidden="true">—</span>
                      Not included
                    </span>
                  } @else {
                    <span class="coverage-status included">
                      <span class="status-mark" aria-hidden="true">✓</span>
                      Included
                    </span>
                  }
                </td>
                <td class="premium-column">
                  <span
                    class="coverage-status"
                    [class.premium-access]="row.premium"
                    [class.included]="!row.premium"
                  >
                    <span class="status-mark" aria-hidden="true">{{
                      row.premium ? '+' : '✓'
                    }}</span>
                    {{ row.premium ? 'Premium module' : 'Included' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
    <section class="narrow-container section-space faq">
      <span class="eyebrow">LICENSING FAQ</span>
      <h2>Common questions</h2>
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
          Use the “Request pricing” button above to open the request form. Describe your use case and
          deployment scope. The request is sent to the WTS Premium-request service; pricing and
          license terms are confirmed privately before a license is provided. Do not include provider
          passwords or production credentials.
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
          Every Premium feature has a dedicated guide with actual package screenshots, configuration
          reference, integration steps, and limitations. API-result captures are labeled separately
          from native UI. Public interactive examples cover Standard features only.
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
    </section>
    <app-license-request-form #requestForm />`,
})
export class PricingPage {
  private readonly capabilityDescriptions: Record<string, string> = {
    'Views & layouts': 'Month, week, day, multi-month and list views',
    'Events & data': 'Event sources, recurrence rules and time zones',
    Interaction: 'Drag, resize, selection and event editing',
    Customization: 'Themes, localization and render hooks',
    'Resources & planning':
      'Resource DayGrid, TimeGrid, timelines and two-axis virtualized scrolling',
    'Premium interoperability': 'Calendar sync and provider integrations',
    'Enterprise workflow': 'Approvals, policies and controlled mutations',
    'Developer experience': 'Framework wrappers, API reference and plugin SDK',
    'Accessibility & delivery': 'Keyboard, print and responsive capabilities',
  };

  readonly rows = FEATURE_GROUPS.map((name) => ({
    name,
    label: name === 'Resources & planning' ? 'Scheduler views & resources' : name,
    description: this.capabilityDescriptions[name] ?? 'Calendar package capabilities',
    premium: FEATURES.filter((f) => f.group === name).every((f) => f.tier === 'Premium'),
  }));
}
