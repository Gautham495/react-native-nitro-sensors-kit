import { useEffect, useState, useRef } from 'react'
import { deviceMotion } from '../index'
import type { DeviceMotionData } from '../DeviceMotion.nitro'

/**
 * React hook for fused device motion data.
 * Automatically starts/stops updates on mount/unmount.
 *
 * @param interval - Update interval in ms (default: 100)
 * @param active - Whether to receive updates (default: true)
 */
export function useDeviceMotion(interval: number = 100, active: boolean = true) {
  const [data, setData] = useState<DeviceMotionData | null>(null)
  const callbackRef = useRef(setData)
  callbackRef.current = setData

  useEffect(() => {
    if (!active || !deviceMotion.isAvailable) return

    deviceMotion.interval = interval
    deviceMotion.onUpdate = (sensorData) => {
      callbackRef.current(sensorData)
    }
    deviceMotion.start()

    return () => {
      deviceMotion.stop()
      deviceMotion.onUpdate = undefined
    }
  }, [interval, active])

  return {
    data,
    isAvailable: deviceMotion.isAvailable,
    isActive: deviceMotion.isActive,
  }
}
