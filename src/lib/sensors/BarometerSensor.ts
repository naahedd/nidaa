import { Sensor, SensorType, SensorCapturedEvent } from './types';

export class BarometerSensor implements Sensor {
  private readonly TAG = 'BarometerSensor';
  private isListening = false;
  private initialPressure: number | null = null;
  private pressureSensor: any | null = null;

  constructor(
    public threshold: number, // threshold in hPa (millibar)
    private updateInterval: number, // in milliseconds
    private onEvent?: (event: SensorCapturedEvent) => void
  ) {}

  get sensorType(): SensorType {
    return SensorType.BAROMETER;
  }

  get isAvailable(): boolean {
    return 'Pressure' in window || 'AmbientPressure' in window;
  }

  private handlePressureChange = (reading: any) => {
    const pressure = reading.pressure; // pressure in kPa

    // Convert kPa to hPa (millibar)
    const pressureHPa = pressure * 10;

    if (this.initialPressure === null) {
      this.initialPressure = pressureHPa;
      return;
    }

    const pressureChange = Math.abs(pressureHPa - this.initialPressure);

    if (pressureChange > this.threshold) {
      const sensorEvent: SensorCapturedEvent = {
        sensorType: this.sensorType,
        eventTime: Date.now()
      };

      this.onEvent?.(sensorEvent);
      console.debug(`${this.TAG}: Pressure change detected:`, pressureChange);
    }
  }

  async startUpdates(): Promise<void> {
    if (!this.isAvailable) {
      console.warn(`${this.TAG}: Barometer not available`);
      return;
    }

    try {
      // Try to use the modern Pressure API
      if ('Pressure' in window) {
        this.pressureSensor = new (window as any).Pressure({
          frequency: 1000 / this.updateInterval
        });

        this.pressureSensor.addEventListener('reading', this.handlePressureChange);
        await this.pressureSensor.start();
        this.isListening = true;
      } 
      // Fallback to AmbientPressure API
      else if ('AmbientPressure' in window) {
        this.pressureSensor = new (window as any).AmbientPressure({
          frequency: 1000 / this.updateInterval
        });

        this.pressureSensor.addEventListener('reading', this.handlePressureChange);
        await this.pressureSensor.start();
        this.isListening = true;
      }

      this.initialPressure = null;
      console.debug(`${this.TAG}: Started updates`);
    } catch (error) {
      console.error(`${this.TAG}: Error starting updates:`, error);
    }
  }

  stopUpdates(): void {
    if (this.isListening && this.pressureSensor) {
      this.pressureSensor.removeEventListener('reading', this.handlePressureChange);
      this.pressureSensor.stop();
      this.pressureSensor = null;
      this.isListening = false;
      this.initialPressure = null;
      console.debug(`${this.TAG}: Stopped updates`);
    }
  }
}