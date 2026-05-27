import { useEffect, useState, useRef } from 'react';
import { barometer } from '../index';
import type { BarometerData } from '../Barometer.nitro';

/**
 * React hook for barometer data (pressure + relative altitude).
 * Automatically starts/stops updates on mount/unmount.
 *
 * @param active - Whether to receive updates (default: true)
 */
export function useBarometer(active: boolean = true) {
  const [data, setData] = useState<BarometerData | null>(null);
  const callbackRef = useRef(setData);
  callbackRef.current = setData;

  useEffect(() => {
    if (!active || !barometer.isAvailable) return;

    barometer.onUpdate = (sensorData) => {
      callbackRef.current(sensorData);
    };
    barometer.start();

    return () => {
      barometer.stop();
      barometer.onUpdate = undefined;
    };
  }, [active]);

  return {
    data,
    isAvailable: barometer.isAvailable,
    isActive: barometer.isActive,
  };
}
