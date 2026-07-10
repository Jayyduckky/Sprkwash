/* TripRanked service worker — network-first with offline fallback.
 * Fresh files whenever you're online; the whole app still works offline
 * (GPS + on-device storage need no network at all). */
'use strict';

const VERSION = 'tripranked-v1.1.0';
const SHELL = [
  './',
  './index.html',
  './css/app.css',
  './js/config.js',
  './js/util.js',
  './js/store.js',
  './js/tracker.js',
  './js/simulator.js',
  './js/leaderboard.js',
  './js/sharecard.js',
  './js/map.js',
  './js/app.js',
  './vendor/leaflet/leaflet.js',
  './vendor/leaflet/leaflet.css',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
// Map tiles are cross-origin, so the fetch handler below never touches them —
// the browser's HTTP cache handles tiles, per OSM usage policy.

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => hit || caches.match('./index.html'))
      )
  );
});
