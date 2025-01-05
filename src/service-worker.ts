/// <reference lib="webworker" />

const NOTIFICATION_TIMEOUT = 120000; // 2 minutes in milliseconds
const CACHE_NAME = 'sos-app-v1';

// Files to cache for offline use
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/sos-icon.png'
];

// Install event - cache essential files
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(filesToCache);
    }).catch((error) => {
      console.error('Failed to cache files:', error);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return clients.claim();
    }).catch((error) => {
      console.error('Failed to activate service worker:', error);
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return new Response('Offline page') // Return a basic Response object
      });
    })
  );
});

// Handle notification responses
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  const response = event.action;
  const disasterId = event.notification.tag;

  if (response === 'need-help') {
    triggerSOS(disasterId);
  } else if (response === 'ok') {
    clearAlert(disasterId);
  }
  
  event.notification.close();
});

// Handle push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/sos-icon.png',
    badge: '/icons/badge-icon.png',
    tag: data.id,
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );

  // Start the response timeout
  checkUserResponse(data.id);
});

// Handle messages from the disaster detector
self.addEventListener('message', (event) => {
  if (event.data.type === 'DISASTER_DETECTED') {
    const disasterId = crypto.randomUUID();
    
    // Show the "Are you okay?" notification
    self.registration.showNotification('Are you okay?', {
      body: 'Possible disaster detected in your area',
      tag: disasterId,
      requireInteraction: true,
      icon: '/icons/alert-icon.png',
      badge: '/icons/badge-icon.png'
    });

    // Start the response timeout
    checkUserResponse(disasterId);
  }
});

function checkUserResponse(disasterId: string) {
  setTimeout(() => {
    // Check if notification was responded to
    self.registration.getNotifications({ tag: disasterId }).then((notifications) => {
      if (notifications.length > 0) {
        // If notification still exists, user hasn't responded
        triggerSOS(disasterId);
      }
    }).catch((error) => {
      console.error('Failed to check notifications:', error);
    });
  }, NOTIFICATION_TIMEOUT);
}

function triggerSOS(disasterId: string | null) {
  // Send SOS signal to server
  fetch('/api/sos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      disasterId,
      timestamp: Date.now(),
      type: 'SOS',
    }),
  }).catch((error) => {
    console.error('Failed to send SOS:', error);
  });

  // Broadcast to nearby devices
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SOS_BROADCAST',
        disasterId,
        timestamp: Date.now(),
      });
    });
  }).catch((error) => {
    console.error('Failed to broadcast SOS:', error);
  });
}

function clearAlert(disasterId: string | null) {
  // Clear the alert from the system
  fetch('/api/alerts/clear', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      disasterId,
      timestamp: Date.now(),
    }),
  }).catch((error) => {
    console.error('Failed to clear alert:', error);
  });
}