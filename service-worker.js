const CACHE_NAME = 'elemental-run-browser-v13-shell-23-vehicle-streaming';
const SHELL = [
  './',
  './index.html',
  './browser-config.js',
  './browser-platform.js',
  './browser-platform.css',
  './manifest.webmanifest',
  './vendor/three.min.js',
  './vendor/loaders/GLTFLoader.js',
  './vendor/postprocessing/EffectComposer.js',
  './vendor/postprocessing/MaskPass.js',
  './vendor/postprocessing/ShaderPass.js',
  './vendor/postprocessing/RenderPass.js',
  './vendor/postprocessing/UnrealBloomPass.js',
  './vendor/shaders/CopyShader.js',
  './vendor/shaders/LuminosityHighPassShader.js',
  './vendor/shaders/FXAAShader.js'
];

self.addEventListener('install', (event) => {
  // One temporarily unavailable optional file must not reject the whole
  // service-worker install and leave an older shell controlling first launch.
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.all(
    SHELL.map((url) => cache.add(url).catch((error) => {
      console.warn('[SW] Optional shell cache failed:', url, error);
      return null;
    }))
  )));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const networkWithDeadline = Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('navigation timeout')), 6500))
    ]);
    event.respondWith(networkWithDeadline.then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
      return response;
    }).catch(() => caches.match('./index.html').then((cached) => cached || fetch(request))));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
  })));
});
