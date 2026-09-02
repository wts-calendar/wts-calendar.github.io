import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, type Routes } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./overview-page').then((m) => m.OverviewPage),
  },
  { path: 'features', loadComponent: () => import('./features-page').then((m) => m.FeaturesPage) },
  {
    path: 'premium/:id',
    loadComponent: () => import('./premium-feature-page').then((m) => m.PremiumFeaturePage),
  },
  { path: 'pricing', loadComponent: () => import('./pricing-page').then((m) => m.PricingPage) },
  {
    path: 'docs/api',
    data: { kind: 'options' },
    loadComponent: () => import('./api-reference-page').then((m) => m.ApiReferencePage),
  },
  ...(['methods', 'events', 'exports', 'server'] as const).map((section) => ({
    path: 'docs/api/' + section,
    data: { kind: section === 'exports' ? 'symbols' : section },
    loadComponent: () => import('./api-reference-page').then((m) => m.ApiReferencePage),
  })),
  { path: 'docs', loadComponent: () => import('./docs-page').then((m) => m.DocsPage) },
  { path: 'examples', pathMatch: 'full', redirectTo: 'examples/month' },
  ...['day', 'week', 'month', 'year'].map((period) => ({
    path: 'examples/list-' + period,
    pathMatch: 'full' as const,
    redirectTo: '/examples/list?period=' + period,
  })),
  {
    path: 'examples/:id',
    loadComponent: () => import('./examples-page').then((m) => m.ExamplesPage),
  },
  { path: '**', loadComponent: () => import('./not-found-page').then((m) => m.NotFoundPage) },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
  ],
};
