import { useEffect, useState, useRef } from 'react';
import { magnetometer } from '../index';
import type { MagnetometerData } from '../Magnetometer.nitro';

/**
 * React hook for magnetometer data.
 * Automatically starts/stops updates on mount/unmount.
 *
 * @param interval - Update interval in ms (default: 100)
 * @param active - Whether to receive updates (default: true)
 */
export function useMagnetometer(
  interval: number = 100,
  active: boolean = true
) {
  const [data, setData] = useState<MagnetometerData | null>(null);
  const callbackRef = useRef(setData);
  callbackRef.current = setData;

  useEffect(() => {
    if (!active || !magnetometer.isAvailable) return;

    magnetometer.interval = interval;
    magnetometer.onUpdate = (sensorData) => {
      callbackRef.current(sensorData);
    };
    magnetometer.start();

    return () => {
      magnetometer.stop();
      magnetometer.onUpdate = undefined;
    };
  }, [interval, active]);

  return {
    data,
    isAvailable: magnetometer.isAvailable,
    isActive: magnetometer.isActive,
  };
}
