'use client'

import { useState, useEffect } from 'react'
import { AcceleratorSensor } from '@/lib/sensors/AcceleratorSensor'
import { GyroscopeSensor } from '@/lib/sensors/GyroscopeSensor'
import { BarometerSensor } from '@/lib/sensors/BarometerSensor'
import { SensorCapturedEvent } from '@/lib/sensors/types'

export default function SensorTestPanel() {
  const [sensors, setSensors] = useState<{
    accelerometer: AcceleratorSensor | null,
    gyroscope: GyroscopeSensor | null,
    barometer: BarometerSensor | null
  }>({
    accelerometer: null,
    gyroscope: null,
    barometer: null
  });

  const [events, setEvents] = useState<SensorCapturedEvent[]>([]);

  useEffect(() => {
    // Initialize sensors
    const accelerometer = new AcceleratorSensor(
      2.0, // threshold in g's
      100,  // update interval in ms
      (event) => {
        setEvents(prev => [...prev, event].slice(-5)); // Keep last 5 events
        console.log('Accelerometer event:', event);
      }
    );

    const gyroscope = new GyroscopeSensor(
      1.0, // threshold in rad/s
      100,  // update interval in ms
      (event) => {
        setEvents(prev => [...prev, event].slice(-5));
        console.log('Gyroscope event:', event);
      }
    );

    const barometer = new BarometerSensor(
      1.0, // threshold in hPa
      100,  // update interval in ms
      (event) => {
        setEvents(prev => [...prev, event].slice(-5));
        console.log('Barometer event:', event);
      }
    );

    setSensors({ accelerometer, gyroscope, barometer });

    return () => {
      accelerometer.stopUpdates();
      gyroscope.stopUpdates();
      barometer.stopUpdates();
    };
  }, []);

  const toggleSensor = async (type: 'accelerometer' | 'gyroscope' | 'barometer') => {
    const sensor = sensors[type];
    if (!sensor) return;

    try {
      if (sensor.isAvailable) {
        await sensor.startUpdates();
      }
    } catch (error) {
      console.error(`Error toggling ${type}:`, error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h2 className="font-medium text-lg">Sensor Test Panel</h2>
      
      <div className="space-y-2">
        <button
          onClick={() => toggleSensor('accelerometer')}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded"
        >
          Test Accelerometer
          {sensors.accelerometer?.isAvailable ? ' ✅' : ' ❌'}
        </button>

        <button
          onClick={() => toggleSensor('gyroscope')}
          className="w-full bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-4 rounded"
        >
          Test Gyroscope
          {sensors.gyroscope?.isAvailable ? ' ✅' : ' ❌'}
        </button>

        <button
          onClick={() => toggleSensor('barometer')}
          className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium py-2 px-4 rounded"
        >
          Test Barometer
          {sensors.barometer?.isAvailable ? ' ✅' : ' ❌'}
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-medium">Recent Events:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          {events.map((event, i) => (
            <div key={i}>
              {event.sensorType}: {new Date(event.eventTime).toLocaleTimeString()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}