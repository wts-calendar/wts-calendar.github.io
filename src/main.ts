import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { legacyHashTarget } from './app/legacy-hash';

const legacyTarget = legacyHashTarget(
  window.location.hash,
  new URL(document.baseURI).pathname,
  window.location.search,
);
if (legacyTarget) {
  // Load the matching prerendered document before hydration, not the old home HTML.
  window.location.replace(legacyTarget);
} else {
  bootstrapApplication(App, appConfig).catch((err) => console.error(err));
}
