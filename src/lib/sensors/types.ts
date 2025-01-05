export enum SensorType {
  ACCELEROMETER = 'ACCELEROMETER',
  GYROSCOPE = 'GYROSCOPE',
  BAROMETER = 'BAROMETER'
}

export interface SensorCapturedEvent {
  sensorType: SensorType;
  eventTime: number;
}

// Base sensor interface
export interface AnySensor {
  isAvailable: boolean;
  startUpdates(): Promise<void>;
  stopUpdates(): void;
}

// Extended sensor interface with threshold and event handling
export interface Sensor extends AnySensor {
  threshold: number;
  sensorType: SensorType;
  onEvent?: (event: SensorCapturedEvent) => void;
}