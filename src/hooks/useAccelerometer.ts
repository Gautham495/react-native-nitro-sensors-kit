import { useEffect, useState, useRef } from 'react';
import { accelerometer } from '../index';
import type { AccelerometerData } from '../Accelerometer.nitro';

/**
 * React hook for accelerometer data.
 * Automatically starts/stops updates on mount/unmount.
 *
 * @param interval - Update interval in ms (default: 100)
 * @param active - Whether to receive updates (default: true)
 */
export function useAccelerometer(
  interval: number = 100,
  active: boolean = true
) {
  const [data, setData] = useState<AccelerometerData | null>(null);
  const callbackRef = useRef(setData);
  callbackRef.current = setData;

  useEffect(() => {
    if (!active || !accelerometer.isAvailable) return;

    accelerometer.interval = interval;
    accelerometer.onUpdate = (sensorData) => {
      callbackRef.current(sensorData);
    };
    accelerometer.start();

    return () => {
      accelerometer.stop();
      accelerometer.onUpdate = undefined;
    };
  }, [interval, active]);

  return {
    data,
    isAvailable: accelerometer.isAvailable,
    isActive: accelerometer.isActive,
  };
}
