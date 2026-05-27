import { type HybridObject } from 'react-native-nitro-modules'

/**
 * Raw magnetometer data representing the ambient magnetic field
 * measured in microteslas (µT).
 */
export interface MagnetometerData {
  /** Magnetic field strength along the x-axis in µT */
  x: number
  /** Magnetic field strength along the y-axis in µT */
  y: number
  /** Magnetic field strength along the z-axis in µT */
  z: number
  /** Timestamp in seconds since boot */
  timestamp: number
}

/**
 * Provides access to the device's magnetometer (compass) sensor.
 * No permissions required on either platform.
 *
 * iOS: CMMotionManager.startMagnetometerUpdates()
 * Android: SensorManager.getDefaultSensor(TYPE_MAGNETIC_FIELD)
 */
export interface Magnetometer extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /** Whether the magnetometer sensor is available on this device */
  readonly isAvailable: boolean

  /** Whether the sensor is currently delivering updates */
  readonly isActive: boolean

  /**
   * Set the update interval in milliseconds.
   * Default: 100ms (10Hz).
   */
  interval: number

  /**
   * Start receiving magnetometer updates.
   * Register a listener with `onUpdate` before calling this.
   */
  start(): void

  /** Stop receiving magnetometer updates. */
  stop(): void

  /**
   * Callback fired on each sensor update.
   * Set this before calling start().
   */
  onUpdate: ((data: MagnetometerData) => void) | undefined
}
