import { AcceleratorSensor } from './AcceleratorSensor';

export function initializeAccelerometer(onDisasterDetected: () => void) {
    const accelerometer = new AcceleratorSensor(
      2.0, // threshold in g's (adjust based on testing)
      100, // update interval in ms
      (event) => {
        console.log('Significant movement detected:', event);
        onDisasterDetected();
      }
    );
  
    return accelerometer;
  }