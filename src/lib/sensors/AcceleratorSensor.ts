import { Sensor, SensorType, SensorCapturedEvent } from './types';

interface DeviceMotionEventiOS extends EventTarget {
  requestPermission(): Promise<'granted' | 'denied'>;
}

export class AcceleratorSensor implements Sensor {
  private readonly TAG = 'AcceleratorSensor';
  private isListening = false;
  public onEvent?: (event: SensorCapturedEvent) => void;

  constructor(
    public threshold: number, // threshold in g's
    private updateInterval: number, // in milliseconds
    onEvent?: (event: SensorCapturedEvent) => void
  ) {
    this.onEvent = onEvent;
  }

  get sensorType(): SensorType {
    return SensorType.ACCELEROMETER;
  }

  get isAvailable(): boolean {
    return 'DeviceMotionEvent' in window;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    // Calculate total acceleration magnitude in g's
    const totalAcceleration = Math.sqrt(
      Math.pow(acceleration.x || 0, 2) +
      Math.pow(acceleration.y || 0, 2) +
      Math.pow(acceleration.z || 0, 2)
    ) / 9.81; // Convert to g's

    // Only log significant movements
    if (totalAcceleration > this.threshold) {
      console.debug(`Acceleration: ${totalAcceleration.toFixed(2)}g`);
      this.onEvent?.({
        sensorType: this.sensorType,
        eventTime: event.timeStamp
      });
    }
  }

  async startUpdates(): Promise<void> {
    if (!this.isAvailable) {
      console.warn(`${this.TAG}: Accelerometer not available`);
      return;
    }

    try {
      // Request permission if needed (iOS)
      if ('requestPermission' in DeviceMotionEvent) {
        const permission = await (DeviceMotionEvent as unknown as DeviceMotionEventiOS).requestPermission();
        if (permission !== 'granted') {
          console.error(`${this.TAG}: Permission denied`);
          return;
        }
      }

      if (!this.isListening) {
        window.addEventListener('devicemotion', this.handleMotion);
        this.isListening = true;
        console.debug(`${this.TAG}: Started updates`);
      }
    } catch (error) {
      console.error(`${this.TAG}: Error starting updates:`, error);
    }
  }

  stopUpdates(): void {
    if (this.isListening) {
      window.removeEventListener('devicemotion', this.handleMotion);
      this.isListening = false;
      console.debug(`${this.TAG}: Stopped updates`);
    }
  }
}