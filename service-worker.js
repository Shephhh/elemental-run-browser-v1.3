const CACHE_NAME = 'elemental-run-browser-v13-shell-3';
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
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
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
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
      return response;
    }).catch(() => caches.match('./index.html')));
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
