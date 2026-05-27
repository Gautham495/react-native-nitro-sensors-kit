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
class HybridBarometer : HybridBarometerSpec(), SensorEventListener {

  // MARK: - Private

  private val context: Context
    get() = NitroModules.applicationContext ?: throw Error("No ApplicationContext set!")

  private val sensorManager: SensorManager
    get() = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

  private val sensor: Sensor?
    get() = sensorManager.getDefaultSensor(Sensor.TYPE_PRESSURE)

  private var _isActive = false

  // Store the initial pressure to compute relative altitude
  private var initialPressure: Float? = null

  // MARK: - Properties

  override val isAvailable: Boolean
    get() = sensor != null

  override val isActive: Boolean
    get() = _isActive

  override var onUpdate: ((data: BarometerData) -> Unit)? = null

  // MARK: - Methods

  override fun start() {
    val s = sensor ?: throw IllegalStateException("Barometer is not available on this device")

    initialPressure = null // Reset on each start
    sensorManager.registerListener(this, s, SensorManager.SENSOR_DELAY_NORMAL)
    _isActive = true
  }

  override fun stop() {
    sensorManager.unregisterListener(this)
    _isActive = false
    initialPressure = null
  }

  // MARK: - SensorEventListener

  override fun onSensorChanged(event: SensorEvent?) {
    val e = event ?: return
    val pressure = e.values[0] // hPa (mbar)

    // Capture initial pressure for relative altitude calculation
    if (initialPressure == null) {
      initialPressure = pressure
    }

    // Compute relative altitude using barometric formula
    // SensorManager.getAltitude gives absolute altitude from sea-level pressure
    // We compute relative by diffing current vs initial
    val relativeAltitude = if (initialPressure != null) {
      val altNow = SensorManager.getAltitude(SensorManager.PRESSURE_STANDARD_ATMOSPHERE, pressure)
      val altInitial = SensorManager.getAltitude(SensorManager.PRESSURE_STANDARD_ATMOSPHERE, initialPressure!!)
      (altNow - altInitial).toDouble()
    } else {
      0.0
    }

    val data = BarometerData(
      pressure = pressure.toDouble(), // Already in hPa on Android
      relativeAltitude = relativeAltitude,
      timestamp = e.timestamp.toDouble() / 1_000_000_000.0
    )

    onUpdate?.invoke(data)
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
    // No-op
  }
}
