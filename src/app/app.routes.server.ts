import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { DEMOS } from './site-data';

export const serverRoutes: ServerRoute[] = [
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
