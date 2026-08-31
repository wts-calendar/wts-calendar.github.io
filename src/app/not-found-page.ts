import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: ` <section class="page-heading container">
    <span class="eyebrow">PAGE NOT FOUND</span>
    <h1>Let’s find<br /><em>your way back.</em></h1>
    <p>
      This page does not exist. Premium features are listed in the feature catalogue, without public
      examples.
    </p>
    <div class="actions">
      <a class="button primary" routerLink="/examples">Examples →</a
      ><a class="button" routerLink="/features">All features</a>
    </div>
  </section>`,
})
export class NotFoundPage {}
