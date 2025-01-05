import { Sensor, SensorType, SensorCapturedEvent } from './types';

interface DeviceOrientationEventiOS extends EventTarget {
  requestPermission(): Promise<'granted' | 'denied'>;
}

export class GyroscopeSensor implements Sensor {
  private readonly TAG = 'GyroscopeSensor';
  private isListening = false;
  private filteredRotationRate = 0;
  private readonly alpha = 0.8; // Low-pass filter coefficient
  public onEvent?: (event: SensorCapturedEvent) => void;

  constructor(
    public threshold: number, // threshold in rad/s
    private updateInterval: number, // in milliseconds
    onEvent?: (event: SensorCapturedEvent) => void
  ) {
    this.onEvent = onEvent;
  }

  get sensorType(): SensorType {
    return SensorType.GYROSCOPE;
  }

  get isAvailable(): boolean {
    return 'DeviceOrientationEvent' in window;
  }

  private handleOrientation = (event: DeviceOrientationEvent) => {
    const alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;

    // Convert degrees to radians and calculate rotation rate
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const rotationRate = Math.sqrt(
      Math.pow(toRadians(alpha), 2) +
      Math.pow(toRadians(beta), 2) +
      Math.pow(toRadians(gamma), 2)
    );

    // Only log significant rotations
    if (rotationRate > this.threshold) {
      console.debug(`Rotation rate: ${rotationRate.toFixed(2)} rad/s`);
      this.onEvent?.({
        sensorType: this.sensorType,
        eventTime: event.timeStamp
      });
    }
  }

  async startUpdates(): Promise<void> {
    if (!this.isAvailable) {
      console.warn(`${this.TAG}: Gyroscope not available`);
      return;
    }

    try {
      // Request permission if needed (iOS)
      if ('requestPermission' in DeviceOrientationEvent) {
        const permission = await (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission();
        if (permission !== 'granted') {
          console.error(`${this.TAG}: Permission denied`);
          return;
        }
      }

      if (!this.isListening) {
        window.addEventListener('deviceorientation', this.handleOrientation);
        this.isListening = true;
        this.filteredRotationRate = 0;
        console.debug(`${this.TAG}: Started updates`);
      }
    } catch (error) {
      console.error(`${this.TAG}: Error starting updates:`, error);
    }
  }

  stopUpdates(): void {
    if (this.isListening) {
      window.removeEventListener('deviceorientation', this.handleOrientation);
      this.isListening = false;
      this.filteredRotationRate = 0;
      console.debug(`${this.TAG}: Stopped updates`);
    }
  }
}