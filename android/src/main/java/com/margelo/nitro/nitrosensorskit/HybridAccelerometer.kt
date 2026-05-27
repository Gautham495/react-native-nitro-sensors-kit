package com.margelo.nitro.nitrosensorskit

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.content.Context
import androidx.annotation.Keep
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules

@Keep
@DoNotStrip
class HybridAccelerometer : HybridAccelerometerSpec(), SensorEventListener {

  // MARK: - Private

  private val context: Context
    get() = NitroModules.applicationContext ?: throw Error("No ApplicationContext set!")

  private val sensorManager: SensorManager
    get() = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

  private val sensor: Sensor?
    get() = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

  private var _isActive = false

  // MARK: - Properties

  override val isAvailable: Boolean
    get() = sensor != null

  override val isActive: Boolean
    get() = _isActive

  override var interval: Double = 100.0

  override var onUpdate: ((data: AccelerometerData) -> Unit)? = null

  // MARK: - Methods

  override fun start() {
    val s = sensor ?: throw IllegalStateException("Accelerometer is not available on this device")

    // Convert milliseconds to microseconds for Android SensorManager
    val delayMicros = (interval * 1000).toInt()
    sensorManager.registerListener(this, s, delayMicros)
    _isActive = true
  }

  override fun stop() {
    sensorManager.unregisterListener(this)
    _isActive = false
  }

  // MARK: - SensorEventListener

  override fun onSensorChanged(event: SensorEvent?) {
    val e = event ?: return

    val data = AccelerometerData(
      x = e.values[0].toDouble(), // Already in m/s² on Android
      y = e.values[1].toDouble(),
      z = e.values[2].toDouble(),
      timestamp = e.timestamp.toDouble() / 1_000_000_000.0 // nanoseconds → seconds
    )

    onUpdate?.invoke(data)
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
    // No-op
  }
}
