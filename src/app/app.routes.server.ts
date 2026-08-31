import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { DEMOS, PREMIUM_FEATURES } from './site-data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'premium/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return PREMIUM_FEATURES.map(({ id }) => ({ id }));
    },
  },
  {
    path: 'examples/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return DEMOS.map(({ id }) => ({ id }));
    },
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
