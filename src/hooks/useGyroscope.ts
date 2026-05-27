import { useEffect, useState, useRef } from 'react'
import { gyroscope } from '../index'
import type { GyroscopeData } from '../Gyroscope.nitro'

/**
 * React hook for gyroscope data.
 * Automatically starts/stops updates on mount/unmount.
 *
 * @param interval - Update interval in ms (default: 100)
 * @param active - Whether to receive updates (default: true)
 */
export function useGyroscope(interval: number = 100, active: boolean = true) {
  const [data, setData] = useState<GyroscopeData | null>(null)
  const callbackRef = useRef(setData)
  callbackRef.current = setData

  useEffect(() => {
    if (!active || !gyroscope.isAvailable) return

    gyroscope.interval = interval
    gyroscope.onUpdate = (sensorData) => {
      callbackRef.current(sensorData)
    }
    gyroscope.start()

    return () => {
      gyroscope.stop()
      gyroscope.onUpdate = undefined
    }
  }, [interval, active])

  return {
    data,
    isAvailable: gyroscope.isAvailable,
    isActive: gyroscope.isActive,
  }
}
