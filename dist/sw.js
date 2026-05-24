// Service worker — network-first; cache is offline fallback only.

const CACHE = 'bkmk-e78584aa'

const APP_SHELL = [
  '/',
  '/js/app-M2YJQO5R.js',
  '/css/app-EJBJLBRO.css',
  '/manifest.json',
  '/icons/icon.svg',
]

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', evt => {
  if (evt.request.method !== 'GET') return
  evt.respondWith(
    fetch(evt.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then(cache => cache.put(evt.request, clone))
        }
        return response
      })
      .catch(() => caches.match(evt.request))
  )
})
