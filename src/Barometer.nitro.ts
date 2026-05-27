import { type HybridObject } from 'react-native-nitro-modules';

/**
 * Barometric pressure and altitude data.
 */
export interface BarometerData {
  /** Atmospheric pressure in hectopascals (hPa / mbar) */
  pressure: number;
  /**
   * Relative altitude change in meters since startUpdates() was called.
   * iOS only — returns 0 on Android (compute from pressure deltas instead).
   */
  relativeAltitude: number;
  /** Timestamp in seconds since boot */
  timestamp: number;
}

/**
 * Provides access to the device's barometric pressure sensor.
 *
 * Relative altitude: No permission required on either platform.
 *
 * iOS: CMAltimeter (pressure + relative altitude)
 * Android: SensorManager.getDefaultSensor(TYPE_PRESSURE)
 *
 * Note: iOS absolute altitude (iOS 15+) requires NSMotionUsageDescription
 * but is NOT exposed in this interface — only relative altitude is provided.
 */
export interface Barometer extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  /** Whether the barometer sensor is available on this device */
  readonly isAvailable: boolean;

  /** Whether the sensor is currently delivering updates */
  readonly isActive: boolean;

  /**
   * Start receiving barometer updates.
   * Register a listener with `onUpdate` before calling this.
   *
   * Note: Unlike other sensors, barometer update interval is
   * controlled by the OS and cannot be configured.
   */
  start(): void;

  /** Stop receiving barometer updates. */
  stop(): void;

  /**
   * Callback fired on each barometer update.
   * Set this before calling start().
   */
  onUpdate: ((data: BarometerData) => void) | undefined;
}
