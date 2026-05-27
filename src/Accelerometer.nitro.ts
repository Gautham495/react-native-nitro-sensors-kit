import { type HybridObject } from 'react-native-nitro-modules';

/**
 * Raw accelerometer data representing device acceleration
 * including gravity, measured in m/s².
 */
export interface AccelerometerData {
  /** Acceleration along the x-axis in m/s² */
  x: number;
  /** Acceleration along the y-axis in m/s² */
  y: number;
  /** Acceleration along the z-axis in m/s² */
  z: number;
  /** Timestamp in seconds since boot */
  timestamp: number;
}

/**
 * Provides access to the device's accelerometer sensor.
 * No permissions required on either platform.
 *
 * iOS: CMMotionManager.startAccelerometerUpdates()
 * Android: SensorManager.getDefaultSensor(TYPE_ACCELEROMETER)
 */
export interface Accelerometer extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  /** Whether the accelerometer sensor is available on this device */
  readonly isAvailable: boolean;

  /** Whether the sensor is currently delivering updates */
  readonly isActive: boolean;

  /**
   * Set the update interval in milliseconds.
   * Default: 100ms (10Hz). Lower = faster updates, more battery drain.
   */
  interval: number;

  /**
   * Start receiving accelerometer updates.
   * Register a listener with `onUpdate` before calling this.
   */
  start(): void;

  /** Stop receiving accelerometer updates. */
  stop(): void;

  /**
   * Callback fired on each sensor update.
   * Set this before calling start().
   */
  onUpdate: ((data: AccelerometerData) => void) | undefined;
}
