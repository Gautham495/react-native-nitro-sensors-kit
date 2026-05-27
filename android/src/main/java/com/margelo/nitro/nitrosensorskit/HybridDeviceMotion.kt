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
class HybridDeviceMotion : HybridDeviceMotionSpec(), SensorEventListener {

  // MARK: - Private

  private val context: Context
    get() = NitroModules.applicationContext ?: throw Error("No ApplicationContext set!")

  private val sensorManager: SensorManager
    get() = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

  private var _isActive = false

  // Cached latest values from each sensor
  private val rotationMatrix = FloatArray(9)
  private val orientationAngles = FloatArray(3)
  private var latestRotationRate = Vector3(0.0, 0.0, 0.0)
  private var latestUserAcceleration = Vector3(0.0, 0.0, 0.0)
  private var latestGravity = Vector3(0.0, 0.0, 0.0)
  private var latestTimestamp = 0.0

  // Individual sensor listeners
  private val rotationListener = object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent?) {
      val e = event ?: return
      SensorManager.getRotationMatrixFromVector(rotationMatrix, e.values)
      SensorManager.getOrientation(rotationMatrix, orientationAngles)
      latestTimestamp = e.timestamp.toDouble() / 1_000_000_000.0
      emitUpdate()
    }
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
  }

  private val linearAccelListener = object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent?) {
      val e = event ?: return
      latestUserAcceleration = Vector3(
        x = e.values[0].toDouble(),
        y = e.values[1].toDouble(),
        z = e.values[2].toDouble()
      )
    }
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
  }

  private val gravityListener = object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent?) {
      val e = event ?: return
      latestGravity = Vector3(
        x = e.values[0].toDouble(),
        y = e.values[1].toDouble(),
        z = e.values[2].toDouble()
      )
    }
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
  }

  private val gyroListener = object : SensorEventListener {
    override fun onSensorChanged(event: SensorEvent?) {
      val e = event ?: return
      latestRotationRate = Vector3(
        x = e.values[0].toDouble(),
        y = e.values[1].toDouble(),
        z = e.values[2].toDouble()
      )
    }
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
  }

  // MARK: - Properties

  override val isAvailable: Boolean
    get() = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR) != null

  override val isActive: Boolean
    get() = _isActive

  override var interval: Double = 100.0

  override var onUpdate: ((data: DeviceMotionData) -> Unit)? = null

  // MARK: - Methods

  override fun start() {
    val sm = sensorManager
    val delayMicros = (interval * 1000).toInt()

    // Rotation vector (primary — drives the update emission)
    sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)?.let {
      sm.registerListener(rotationListener, it, delayMicros)
    } ?: throw IllegalStateException("Device Motion is not available on this device")

    // Linear acceleration (user acceleration with gravity removed)
    sm.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)?.let {
      sm.registerListener(linearAccelListener, it, delayMicros)
    }

    // Gravity
    sm.getDefaultSensor(Sensor.TYPE_GRAVITY)?.let {
      sm.registerListener(gravityListener, it, delayMicros)
    }

    // Gyroscope (for rotation rate)
    sm.getDefaultSensor(Sensor.TYPE_GYROSCOPE)?.let {
      sm.registerListener(gyroListener, it, delayMicros)
    }

    _isActive = true
  }

  override fun stop() {
    val sm = sensorManager
    sm.unregisterListener(rotationListener)
    sm.unregisterListener(linearAccelListener)
    sm.unregisterListener(gravityListener)
    sm.unregisterListener(gyroListener)
    _isActive = false
  }

  // MARK: - Emit fused data

  private fun emitUpdate() {
    // orientationAngles: [azimuth (yaw), pitch, roll]
    val attitude = AttitudeData(
      pitch = orientationAngles[1].toDouble(),
      roll = orientationAngles[2].toDouble(),
      yaw = orientationAngles[0].toDouble()
    )

    val data = DeviceMotionData(
      attitude = attitude,
      rotationRate = latestRotationRate,
      userAcceleration = latestUserAcceleration,
      gravity = latestGravity,
      heading = -1.0, // Android doesn't provide heading via rotation vector directly
      timestamp = latestTimestamp
    )

    onUpdate?.invoke(data)
  }

  // MARK: - SensorEventListener (unused — using individual listeners)

  override fun onSensorChanged(event: SensorEvent?) {}
  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
