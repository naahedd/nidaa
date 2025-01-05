const NOTIFICATION_TIMEOUT = 120000; // 2 minutes in milliseconds

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'DISASTER_DETECTED') {
    const disasterId = crypto.randomUUID();
    
    self.registration.showNotification('Are you okay?', {
      body: 'Possible disaster detected in your area',
      tag: disasterId,
      requireInteraction: true
    });

    checkUserResponse(disasterId);
  }
});

self.addEventListener('notificationclick', (event) => {
  const response = event.action;
  const disasterId = event.notification.tag;

  if (response === 'need-help') {
    triggerSOS(disasterId);
  } else if (response === 'ok') {
    clearAlert(disasterId);
  }
  
  event.notification.close();
});

function checkUserResponse(disasterId) {
  setTimeout(() => {
    self.registration.getNotifications({ tag: disasterId }).then((notifications) => {
      if (notifications.length > 0) {
        triggerSOS(disasterId);
      }
    });
  }, NOTIFICATION_TIMEOUT);
}

function triggerSOS(disasterId) {
  console.log('SOS triggered:', disasterId);
}

function clearAlert(disasterId) {
  console.log('Alert cleared:', disasterId);
}
