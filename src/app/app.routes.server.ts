import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'openings', renderMode: RenderMode.Prerender },
  {
    path: 'openings/:name',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      { name: 'ruy-lopez' },
      { name: 'sicilian-defense' },
      { name: 'kings-indian' },
    ],
  },
];
