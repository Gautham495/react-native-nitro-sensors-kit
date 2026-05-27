import { type HybridObject } from 'react-native-nitro-modules';

/**
 * Raw gyroscope data representing angular velocity
 * around each axis, measured in rad/s.
 */
export interface GyroscopeData {
  /** Angular velocity around the x-axis in rad/s */
  x: number;
  /** Angular velocity around the y-axis in rad/s */
  y: number;
  /** Angular velocity around the z-axis in rad/s */
  z: number;
  /** Timestamp in seconds since boot */
  timestamp: number;
}

/**
 * Provides access to the device's gyroscope sensor.
 * No permissions required on either platform.
 *
 * iOS: CMMotionManager.startGyroUpdates()
 * Android: SensorManager.getDefaultSensor(TYPE_GYROSCOPE)
 */
export interface Gyroscope extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  /** Whether the gyroscope sensor is available on this device */
  readonly isAvailable: boolean;

  /** Whether the sensor is currently delivering updates */
  readonly isActive: boolean;

  /**
   * Set the update interval in milliseconds.
   * Default: 100ms (10Hz).
   */
  interval: number;

  /**
   * Start receiving gyroscope updates.
   * Register a listener with `onUpdate` before calling this.
   */
  start(): void;

  /** Stop receiving gyroscope updates. */
  stop(): void;

  /**
   * Callback fired on each sensor update.
   * Set this before calling start().
   */
  onUpdate: ((data: GyroscopeData) => void) | undefined;
}
