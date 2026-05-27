import { useEffect, useState, useRef, useCallback } from 'react';
import { pedometer } from '../index';
import type { PedometerData, PermissionStatus } from '../Pedometer.nitro';

/**
 * React hook for pedometer data with built-in permission handling.
 * Automatically starts/stops updates on mount/unmount.
 *
 * @param active - Whether to receive updates (default: true)
 */
export function usePedometer(active: boolean = true) {
  const [data, setData] = useState<PedometerData | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('notDetermined');
  const callbackRef = useRef(setData);
  callbackRef.current = setData;

  const requestPermission = useCallback(async () => {
    const status = await pedometer.requestPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  const checkPermission = useCallback(async () => {
    const status = await pedometer.checkPermission();
    setPermissionStatus(status);
    return status;
  }, []);

  const queryHistoricalData = useCallback(
    async (startTime: number, endTime: number) => {
      return pedometer.queryHistoricalData(startTime, endTime);
    },
    []
  );

  useEffect(() => {
    if (!active || !pedometer.isAvailable) return;

    pedometer.onUpdate = (sensorData) => {
      callbackRef.current(sensorData);
    };
    pedometer.start();

    // Check permission status on mount
    pedometer.checkPermission().then(setPermissionStatus);

    return () => {
      pedometer.stop();
      pedometer.onUpdate = undefined;
    };
  }, [active]);

  return {
    data,
    isAvailable: pedometer.isAvailable,
    isActive: pedometer.isActive,
    permissionStatus,
    requestPermission,
    checkPermission,
    queryHistoricalData,
  };
}
