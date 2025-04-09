// Service Worker for Yoop PWA

const CACHE_NAME = 'yoop-v2';
const APP_SHELL_CACHE = 'app-shell-v1';
const CONTENT_CACHE = 'content-v1';
const API_CACHE = 'api-v1';
const IMAGE_CACHE = 'images-v1';

// App shell assets that need to be available offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// CSS, JS, and critical third-party resources
const APP_RESOURCES = [
  '/assets/index.css',
  '/assets/index.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network with better offline support
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (requestUrl.origin !== location.origin) {
    return;
  }
  
  // Handle different types of requests differently
  if (event.request.mode === 'navigate') {
    // For navigation requests (HTML pages)
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network is unavailable, serve the offline page
          return caches.match('/offline.html') || caches.match('/');
        })
    );
    return;
  }
  
  // Handle API requests with network-first strategy and limited offline cache
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache frequently used API responses
          const shouldCacheApiResponse = 
            (requestUrl.pathname.includes('/api/posts') && !requestUrl.pathname.includes('/create')) ||
            requestUrl.pathname.includes('/api/reels') ||
            requestUrl.pathname.includes('/api/stories');
            
          if (shouldCacheApiResponse && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then(cache => {
              try {
                // Set a 30-minute expiration by storing timestamp with response
                const responseWithTimestamp = {
                  timestamp: Date.now(),
                  response: responseToCache
                };
                cache.put(event.request, responseToCache);
              } catch (error) {
                console.log('Failed to cache API response:', error);
              }
            });
          }
          return response;
        })
        .catch(() => {
          // Try to serve from cache if available
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Image handling with cache-first strategy
  if (
    requestUrl.pathname.endsWith('.jpg') || 
    requestUrl.pathname.endsWith('.jpeg') || 
    requestUrl.pathname.endsWith('.png') || 
    requestUrl.pathname.endsWith('.gif') ||
    requestUrl.pathname.endsWith('.svg') ||
    requestUrl.pathname.includes('/uploads/')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Don't cache chrome-extension URLs
              if (event.request.url.startsWith('chrome-extension://')) {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(IMAGE_CACHE)
                .then(cache => {
                  try {
                    cache.put(event.request, responseToCache);
                  } catch (error) {
                    console.log('Failed to cache image:', error);
                  }
                });
                
              return response;
            })
            .catch(() => {
              // If both cache and network fail for an image, return a placeholder
              return new Response(
                '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">' +
                '<rect width="400" height="300" fill="#eee"/>' +
                '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24px" fill="#999">Image Unavailable</text>' +
                '</svg>',
                { 
                  headers: {'Content-Type': 'image/svg+xml'} 
                }
              );
            });
        })
    );
    return;
  }
  
  // For all other assets, use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Don't cache chrome-extension URLs
            if (event.request.url.startsWith('chrome-extension://')) {
              return response;
            }
            
            const responseToCache = response.clone();
            
            if (
              requestUrl.pathname.endsWith('.js') || 
              requestUrl.pathname.endsWith('.css') ||
              requestUrl.pathname.includes('/assets/')
            ) {
              // Cache app resources in their own cache
              caches.open(APP_SHELL_CACHE)
                .then(cache => {
                  try {
                    cache.put(event.request, responseToCache);
                  } catch (error) {
                    console.log('Failed to cache resource:', error);
                  }
                });
            } else {
              // Cache other content
              caches.open(CONTENT_CACHE)
                .then(cache => {
                  try {
                    cache.put(event.request, responseToCache);
                  } catch (error) {
                    console.log('Failed to cache content:', error);
                  }
                });
            }
            
            return response;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // If both cache and network fail, fallback based on file type
            if (
              requestUrl.pathname.endsWith('.js') || 
              requestUrl.pathname.endsWith('.css')
            ) {
              // For critical resources, go to offline page
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});