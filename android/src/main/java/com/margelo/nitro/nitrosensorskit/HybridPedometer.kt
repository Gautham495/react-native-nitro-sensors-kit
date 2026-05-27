package com.margelo.nitro.nitrosensorskit

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import androidx.annotation.Keep
import androidx.core.content.ContextCompat
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise

@Keep
@DoNotStrip
class HybridPedometer : HybridPedometerSpec(), SensorEventListener {

  // MARK: - Private

  private val context: Context
    get() = NitroModules.applicationContext ?: throw Error("No ApplicationContext set!")

  private val sensorManager: SensorManager
    get() = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

  private val stepCounterSensor: Sensor?
    get() = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

  private var _isActive = false

  // TYPE_STEP_COUNTER gives cumulative steps since boot.
  // We track the initial value to compute relative steps since start().
  private var initialStepCount: Float? = null

  // MARK: - Properties

  override val isAvailable: Boolean
    get() = stepCounterSensor != null

  override val isActive: Boolean
    get() = _isActive

  override var onUpdate: ((data: PedometerData) -> Unit)? = null

  // MARK: - Permission Methods

  override fun checkPermission(): Promise<PermissionStatus> {
    return Promise.resolved(getCurrentPermissionStatus())
  }

  override fun requestPermission(): Promise<PermissionStatus> {
    // Android runtime permissions must be requested from an Activity.
    // From a library context without Activity access, we can only check.
    // The consuming app is responsible for requesting ACTIVITY_RECOGNITION
    // before calling start(). We return the current status.
    //
    // Pre-API 29: no runtime permission needed, always granted.
    return Promise.resolved(getCurrentPermissionStatus())
  }

  // MARK: - Sensor Methods

  override fun start() {
    val s = stepCounterSensor
      ?: throw IllegalStateException("Pedometer is not available on this device")

    initialStepCount = null // Reset on each start
    sensorManager.registerListener(this, s, SensorManager.SENSOR_DELAY_NORMAL)
    _isActive = true
  }

  override fun stop() {
    sensorManager.unregisterListener(this)
    _isActive = false
    initialStepCount = null
  }

  override fun queryHistoricalData(startTime: Double, endTime: Double): Promise<PedometerData> {
    // Android TYPE_STEP_COUNTER doesn't support historical queries.
    // Return an empty result with 0 steps.
    return Promise.resolved(
      PedometerData(
        steps = 0.0,
        distance = -1.0,
        currentPace = -1.0,
        currentCadence = -1.0,
        floorsAscended = -1.0,
        floorsDescended = -1.0,
        timestamp = System.currentTimeMillis().toDouble() / 1000.0
      )
    )
  }

  // MARK: - SensorEventListener

  override fun onSensorChanged(event: SensorEvent?) {
    val e = event ?: return
    val cumulativeSteps = e.values[0]

    // Capture initial step count on first reading
    if (initialStepCount == null) {
      initialStepCount = cumulativeSteps
    }

    val stepsSinceStart = cumulativeSteps - (initialStepCount ?: cumulativeSteps)

    // Android TYPE_STEP_COUNTER only provides step count.
    // Distance, pace, cadence, and floors are not available.
    val data = PedometerData(
      steps = stepsSinceStart.toDouble(),
      distance = -1.0,      // Not available on Android
      currentPace = -1.0,   // Not available on Android
      currentCadence = -1.0, // Not available on Android
      floorsAscended = -1.0, // Not available on Android
      floorsDescended = -1.0, // Not available on Android
      timestamp = e.timestamp.toDouble() / 1_000_000_000.0
    )

    onUpdate?.invoke(data)
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
    // No-op
  }

  // MARK: - Helpers

  private fun getCurrentPermissionStatus(): PermissionStatus {
    // Pre-API 29: ACTIVITY_RECOGNITION permission doesn't exist, always granted
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
      return PermissionStatus.GRANTED
    }

    val result = ContextCompat.checkSelfPermission(
      context,
      Manifest.permission.ACTIVITY_RECOGNITION
    )

    return if (result == PackageManager.PERMISSION_GRANTED) {
      PermissionStatus.GRANTED
    } else {
      // Android doesn't distinguish between "denied" and "not determined"
      // at the library level without Activity access.
      PermissionStatus.DENIED
    }
  }
}
