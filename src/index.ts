import { NitroModules } from 'react-native-nitro-modules';

// Spec types
import type { Accelerometer } from './Accelerometer.nitro';
import type { Gyroscope } from './Gyroscope.nitro';
import type { Magnetometer } from './Magnetometer.nitro';
import type { DeviceMotion } from './DeviceMotion.nitro';
import type { Barometer } from './Barometer.nitro';
import type { Pedometer } from './Pedometer.nitro';

// Data types
export type { AccelerometerData } from './Accelerometer.nitro';
export type { GyroscopeData } from './Gyroscope.nitro';
export type { MagnetometerData } from './Magnetometer.nitro';
export type {
  DeviceMotionData,
  AttitudeData,
  Vector3,
} from './DeviceMotion.nitro';
export type { BarometerData } from './Barometer.nitro';
export type { PedometerData, PermissionStatus } from './Pedometer.nitro';

// Re-export spec types
export type {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  DeviceMotion,
  Barometer,
  Pedometer,
};

// Create singleton HybridObject instances
export const accelerometer =
  NitroModules.createHybridObject<Accelerometer>('Accelerometer');
export const gyroscope =
  NitroModules.createHybridObject<Gyroscope>('Gyroscope');
export const magnetometer =
  NitroModules.createHybridObject<Magnetometer>('Magnetometer');
export const deviceMotion =
  NitroModules.createHybridObject<DeviceMotion>('DeviceMotion');
export const barometer =
  NitroModules.createHybridObject<Barometer>('Barometer');
export const pedometer =
  NitroModules.createHybridObject<Pedometer>('Pedometer');

// Hooks
export { useAccelerometer } from './hooks/useAccelerometer';
export { useGyroscope } from './hooks/useGyroscope';
export { useMagnetometer } from './hooks/useMagnetometer';
export { useDeviceMotion } from './hooks/useDeviceMotion';
export { useBarometer } from './hooks/useBarometer';
export { usePedometer } from './hooks/usePedometer';
