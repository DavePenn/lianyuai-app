// Service Worker for PWA functionality
const CACHE_NAME = 'lianyuai-v1.1.9';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js?' + new Date().getTime(),
  '/api/config.js',
  '/api/ai-service.js',
  '/api/backend-service.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  // Add icons when created
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        const cachePromises = urlsToCache.map(url => cache.add(url).catch(err => console.warn('Cache add failed:', url, err)));
        return Promise.all(cachePromises);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache
self.addEventListener('fetch', event => {
  // Network first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache first for other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          fetchResponse => {
            // Check if we received a valid response
            if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response
            const responseToCache = fetchResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return fetchResponse;
          }
        );
      })
      .catch(() => {
        // Return offline page or default response
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for offline message sending
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications (for future use)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '你有新的恋爱建议！',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    actions: [
      {
        action: 'open',
        title: '查看详情'
      },
      {
        action: 'close',
        title: '关闭'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('恋语AI', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Get pending messages from IndexedDB or localStorage
    const pendingMessages = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
    
    for (const message of pendingMessages) {
      try {
        // Attempt to send message to server
        await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message)
        });
        
        // Remove from pending if successful
        const index = pendingMessages.indexOf(message);
        if (index > -1) {
          pendingMessages.splice(index, 1);
        }
      } catch (error) {
        console.log('Failed to sync message:', error);
      }
    }
    
    // Update localStorage with remaining pending messages
    localStorage.setItem('pendingMessages', JSON.stringify(pendingMessages));
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}