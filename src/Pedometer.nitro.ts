import { type HybridObject } from 'react-native-nitro-modules'

/**
 * Permission status for motion/activity recognition.
 */
export type PermissionStatus = 'granted' | 'denied' | 'restricted' | 'notDetermined'

/**
 * Live pedometer data delivered via step counting updates.
 */
export interface PedometerData {
  /** Number of steps taken since start() was called */
  steps: number
  /** Estimated distance in meters. -1 if unavailable. */
  distance: number
  /**
   * Current pace in seconds per meter. -1 if unavailable.
   * iOS only — returns -1 on Android.
   */
  currentPace: number
  /**
   * Current cadence in steps per second. -1 if unavailable.
   * iOS only — returns -1 on Android.
   */
  currentCadence: number
  /**
   * Number of floors ascended. -1 if unavailable.
   * iOS only — returns -1 on Android.
   */
  floorsAscended: number
  /**
   * Number of floors descended. -1 if unavailable.
   * iOS only — returns -1 on Android.
   */
  floorsDescended: number
  /** Timestamp in seconds since boot */
  timestamp: number
}

/**
 * Provides access to the device's pedometer (step counter).
 *
 * Permissions required:
 *   iOS: NSMotionUsageDescription in Info.plist
 *   Android: android.permission.ACTIVITY_RECOGNITION (API 29+)
 *
 * iOS: CMPedometer
 * Android: SensorManager TYPE_STEP_COUNTER + TYPE_STEP_DETECTOR
 */
export interface Pedometer extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /** Whether step counting is available on this device */
  readonly isAvailable: boolean

  /** Whether the pedometer is currently delivering updates */
  readonly isActive: boolean

  /**
   * Check current permission status without prompting the user.
   */
  checkPermission(): Promise<PermissionStatus>

  /**
   * Request motion/activity recognition permission from the user.
   * Returns the resulting permission status.
   *
   * iOS: Triggers the "Motion & Fitness" system dialog.
   * Android: Triggers ACTIVITY_RECOGNITION runtime permission (API 29+).
   *         Pre-API 29 always returns 'granted'.
   */
  requestPermission(): Promise<PermissionStatus>

  /**
   * Start receiving live pedometer updates.
   * Automatically requests permission if not yet granted.
   * Register a listener with `onUpdate` before calling this.
   */
  start(): void

  /** Stop receiving pedometer updates. */
  stop(): void

  /**
   * Query historical pedometer data between two timestamps.
   * @param startTime - Start time as Unix timestamp in milliseconds
   * @param endTime - End time as Unix timestamp in milliseconds
   * @returns Historical pedometer data for the given range
   *
   * iOS: CMPedometer.queryPedometerData(from:to:)
   * Android: Not natively supported — returns current session data only.
   */
  queryHistoricalData(startTime: number, endTime: number): Promise<PedometerData>

  /**
   * Callback fired on each pedometer update (typically every few steps).
   * Set this before calling start().
   */
  onUpdate: ((data: PedometerData) => void) | undefined
}
