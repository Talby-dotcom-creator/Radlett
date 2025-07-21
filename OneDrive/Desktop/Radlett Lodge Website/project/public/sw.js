const CACHE_NAME = 'radlett-lodge-v1';
const API_CACHE_NAME = 'radlett-lodge-api-v1';
const STATIC_CACHE_NAME = 'radlett-lodge-static-v1';

const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&family=Playfair+Display:wght@400;600;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/documents',
  '/api/members',
  '/api/minutes',
  '/api/events',
  '/api/news'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
      caches.open(API_CACHE_NAME) // Initialize API cache
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with cache-first strategy for GET requests
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request));
  }
  // Handle static assets with cache-first strategy
  else if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
  }
  // Handle navigation requests with network-first strategy
  else {
    event.respondWith(handleNavigation(request));
  }
});
// Handle API requests with intelligent caching
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  // For GET requests, try cache first
  if (request.method === 'GET') {
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Serve from cache and update in background
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }
  }
  
  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET responses
    if (request.method === 'GET' && networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try to serve from cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle static assets
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Serve offline page if available
    const cache = await caches.open(STATIC_CACHE_NAME);
    return cache.match('/') || new Response('Offline', { status: 503 });
  }
}

// Update cache in background
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silently fail background updates
    console.log('Background cache update failed:', error);
  }
}

// Helper functions
function isApiRequest(pathname) {
  return API_ENDPOINTS.some(endpoint => pathname.includes(endpoint)) ||
         pathname.includes('/functions/v1/');
}

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/.test(pathname);
}

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});