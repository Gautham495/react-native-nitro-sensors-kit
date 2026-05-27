import { type HybridObject } from 'react-native-nitro-modules'

/**
 * 3D vector used for acceleration and gravity components.
 */
export interface Vector3 {
  x: number
  y: number
  z: number
}

/**
 * Device attitude (orientation) in Euler angles.
 */
export interface AttitudeData {
  /** Pitch in radians — rotation around the x-axis (-π to π) */
  pitch: number
  /** Roll in radians — rotation around the y-axis (-π/2 to π/2) */
  roll: number
  /** Yaw in radians — rotation around the z-axis (-π to π) */
  yaw: number
}

/**
 * Fused device motion data combining accelerometer, gyroscope,
 * and magnetometer through the OS sensor fusion algorithm.
 */
export interface DeviceMotionData {
  /** Device attitude (pitch, roll, yaw) in radians */
  attitude: AttitudeData
  /** Rotation rate around each axis in rad/s */
  rotationRate: Vector3
  /** User acceleration (gravity removed) in m/s² */
  userAcceleration: Vector3
  /** Gravity vector in m/s² */
  gravity: Vector3
  /** Heading relative to magnetic north in degrees (0-360). -1 if unavailable. */
  heading: number
  /** Timestamp in seconds since boot */
  timestamp: number
}

/**
 * Provides fused device motion data combining all motion sensors
 * through the OS-level Kalman filter / sensor fusion.
 * No permissions required on either platform.
 *
 * iOS: CMMotionManager.startDeviceMotionUpdates()
 * Android: TYPE_ROTATION_VECTOR + TYPE_LINEAR_ACCELERATION + TYPE_GRAVITY
 */
export interface DeviceMotion extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /** Whether device motion is available on this device */
  readonly isAvailable: boolean

  /** Whether the sensor is currently delivering updates */
  readonly isActive: boolean

  /**
   * Set the update interval in milliseconds.
   * Default: 100ms (10Hz).
   */
  interval: number

  /**
   * Start receiving device motion updates.
   * Register a listener with `onUpdate` before calling this.
   */
  start(): void

  /** Stop receiving device motion updates. */
  stop(): void

  /**
   * Callback fired on each fused sensor update.
   * Set this before calling start().
   */
  onUpdate: ((data: DeviceMotionData) => void) | undefined
}
