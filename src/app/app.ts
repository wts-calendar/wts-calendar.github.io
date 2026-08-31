import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { REPOSITORY } from './site-data';
import { SeoService } from './seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly repository = REPOSITORY;
  readonly menuOpen = signal(false);
  constructor() {
    const seo = inject(SeoService);
    const router = inject(Router);
    seo.update(router.url);
    router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.menuOpen.set(false);
        seo.update(event.urlAfterRedirects);
      }
    });
  }
}
