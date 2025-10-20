/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & { skipWaiting: () => Promise<void> };

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

self.skipWaiting().catch((e) => console.warn(e));
clientsClaim();

// Use with precache injection
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

cleanupOutdatedCaches();

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  const fallbackUrl = process.env.PWA_FALLBACK_HTML || 'index.html';

  // Check if the fallback URL is in the precache
  const precacheUrls = manifest.map((entry) =>
    typeof entry === 'string' ? entry : entry.url,
  );

  // Try to find the URL in various formats
  const urlVariants = [fallbackUrl, '/' + fallbackUrl, './' + fallbackUrl];

  const matchedUrl = urlVariants.find((variant) => precacheUrls.includes(variant));

  if (matchedUrl) {
    registerRoute(
      new NavigationRoute(createHandlerBoundToURL(matchedUrl), {
        denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
      }),
    );
  } else {
    console.warn(
      `PWA: Fallback URL "${fallbackUrl}" not found in precache manifest. Available URLs:`,
      precacheUrls,
    );
  }
}
