import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'start', renderMode: RenderMode.Prerender },
  // Per-user pages are rendered on demand so the link preview carries the event data
  { path: 'participant/:participantId', renderMode: RenderMode.Server },
  { path: 'share/:secretSantaId', renderMode: RenderMode.Server },
  { path: 'create', renderMode: RenderMode.Prerender },
  { path: 'my-secret-santas', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
