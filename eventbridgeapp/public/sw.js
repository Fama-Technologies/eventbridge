// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  // Skip waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  // Take control immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let browser handle all fetches
  return;
});
