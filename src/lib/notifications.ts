export async function setupNotifications() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Notification permission denied');
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered');
      return registration;
    }
  } catch (error) {
    console.error('Notification setup failed:', error);
  }
}

interface DisasterAlert {
  id: string;
  type: string;
}

export function showDisasterAlert(disaster: DisasterAlert) {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;
  
  if (!('Notification' in window)) return;

  try {
    return new Notification('Are you okay?', {
      body: `Detected ${disaster.type} in your area. Please respond.`,
      tag: disaster.id,
      requireInteraction: true
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}