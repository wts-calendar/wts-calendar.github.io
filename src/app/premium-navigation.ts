import { afterNextRender, Component, DestroyRef, inject, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PREMIUM_GROUPS } from './site-data';

@Component({
  selector: 'app-premium-navigation',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="premium-guide-navigation" aria-label="Premium feature guides">
      @for (group of groups; track group.name) {
        <details [open]="wideLayout() && group.name === activeGroup">
          <summary>{{ group.name }}</summary>
          @for (feature of group.features; track feature.id) {
            <a
              [routerLink]="['/premium', feature.id]"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              >{{ feature.title }}</a
            >
          }
        </details>
      }
    </nav>
  `,
})
export class PremiumNavigation {
  @Input() activeGroup = '';
  readonly groups = PREMIUM_GROUPS;
  readonly wideLayout = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    // Keep long guide groups folded above the article on narrow screens.
    afterNextRender(() => {
      if (typeof window.matchMedia !== 'function') return;
      const media = window.matchMedia('(min-width: 961px)');
      this.wideLayout.set(media.matches);
      const update = (event: MediaQueryListEvent) => this.wideLayout.set(event.matches);
      media.addEventListener('change', update);
      this.destroyRef.onDestroy(() => media.removeEventListener('change', update));
    });
  }
}
