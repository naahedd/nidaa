'use client'

import { useState, useEffect } from 'react'
import { SensorCapturedEvent, SensorType } from '@/lib/sensors/types';
import { AcceleratorSensor } from '@/lib/sensors/AcceleratorSensor';
import { GyroscopeSensor } from '@/lib/sensors/GyroscopeSensor';

export default function TestControls() {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [lastEventTime, setLastEventTime] = useState<number>(0);
  const COOLDOWN_PERIOD = 5000;

  const handleSensorEvent = (event: SensorCapturedEvent) => {
    console.log('Sensor event received, checking conditions:', {
      event,
      isSOSActive,
      permissionStatus,
      hasServiceWorker: !!swRegistration
    });

    // Only process events if SOS is active and notifications are enabled
    if (!isSOSActive || permissionStatus !== 'granted') {
      console.log('Skipping: SOS not active or notifications not permitted');
      return;
    }

    const now = Date.now();
    if (now - lastEventTime < COOLDOWN_PERIOD) {
      console.log('Skipping: Within cooldown period');
      return;
    }

    setLastEventTime(now);

    // Send notification for significant movement
    if (swRegistration?.active) {
      swRegistration.active.postMessage({
        type: 'DISASTER_DETECTED',
        timestamp: Date.now()
      });

      new Notification('Emergency Alert', {
        body: 'Are you OK? Significant movement detected.',
        requireInteraction: true,
        tag: 'disaster-alert'
      });

      // Set a timeout for 2 minutes
      setTimeout(() => {
        // Check if notification wasn't responded to
        // This will be handled by the service worker
        swRegistration.active?.postMessage({
          type: 'CHECK_RESPONSE_TIMEOUT',
          timestamp: Date.now()
        });
      }, 120000); // 2 minutes
    }
  };

  const [sensors] = useState({
    accelerometer: new AcceleratorSensor(5.0, 100, handleSensorEvent),
    gyroscope: new GyroscopeSensor(6.0, 100, handleSensorEvent)
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Check initial permissions and service worker status
  useEffect(() => {
    // Check notification permission
    setPermissionStatus(Notification.permission);

    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('Service Worker ready:', registration);
        setSwRegistration(registration);
      });
    }
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission status:', permission);
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        // Test notification
        new Notification('Test Notification', {
          body: 'Notifications are now enabled!'
        });
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  }

  const simulateDisaster = async () => {
    // First, activate SOS mode
    setIsSOSActive(true);
    console.log('SOS Mode activated');

    // Then ensure notifications are enabled
    if (permissionStatus !== 'granted') {
      console.log('Requesting permissions first...');
      await requestPermissions();
      return;
    }

    try {
      if (!swRegistration) {
        console.error('No Service Worker registration found');
        return;
      }

      console.log('Sending disaster simulation message...');
      swRegistration.active?.postMessage({
        type: 'DISASTER_DETECTED',
        timestamp: Date.now()
      });

      // Send initial "Are you OK?" notification
      new Notification('Emergency Alert', {
        body: 'Are you OK? Movement detected.',
        requireInteraction: true
      });

    } catch (error) {
      console.error('Simulation failed:', error);
    }
  }

  // Add this state for showing sensor events
  const [lastSensorEvent, setLastSensorEvent] = useState<string>('');

  // Modify your existing keyboard shortcuts useEffect
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'a':
          sensors.accelerometer?.onEvent?.({
            sensorType: SensorType.ACCELEROMETER,
            eventTime: Date.now()
          });
          setLastSensorEvent('Accelerometer triggered (Press A)');
          break;
        case 'g':
          sensors.gyroscope?.onEvent?.({
            sensorType: SensorType.GYROSCOPE,
            eventTime: Date.now()
          });
          setLastSensorEvent('Gyroscope triggered (Press G)');
          break;
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [sensors]);

  // Start listening to sensors when component mounts
  useEffect(() => {
    if (sensors.accelerometer?.isAvailable) {
      sensors.accelerometer.startUpdates();
    }
    if (sensors.gyroscope?.isAvailable) {
      sensors.gyroscope.startUpdates();
    }

    // Cleanup when component unmounts
    return () => {
      sensors.accelerometer?.stopUpdates();
      sensors.gyroscope?.stopUpdates();
    };
  }, [sensors]);

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-red-500">Test Mode</span>
        <div className="text-sm">
          <div>SW Status: {swRegistration ? '✅' : '❌'}</div>
          <div>Notifications: {permissionStatus === 'granted' ? '✅' : '❌'}</div>
          <div>SOS Active: {isSOSActive ? '✅' : '❌'}</div>
        </div>
      </div>
      
      {permissionStatus !== 'granted' && (
        <button
          onClick={requestPermissions}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded mb-2"
        >
          Enable Notifications
        </button>
      )}
      
      <button
        onClick={simulateDisaster}
        className={`w-full font-medium py-2 px-4 rounded ${
          isSOSActive 
            ? 'bg-red-100 hover:bg-red-200 text-red-800' 
            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        }`}
      >
        {isSOSActive ? 'SOS Broadcasting Active' : 'Simulate Disaster'}
      </button>

      {isSOSActive && (
        <div className="mt-2 text-center text-sm text-red-600 font-medium animate-pulse">
          SOS Mode Active - Monitoring for emergencies
        </div>
      )}
      
      <div className="text-sm space-y-2 mt-4">
        <p>Sensor Testing:</p>
        <p>Press A to simulate Accelerometer</p>
        <p>Press G to simulate Gyroscope</p>
        {lastSensorEvent && (
          <p className="text-green-600 font-medium">{lastSensorEvent}</p>
        )}
      </div>
    </div>
  )
}