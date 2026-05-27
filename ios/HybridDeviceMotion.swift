import Foundation
import CoreMotion
import NitroModules

class HybridDeviceMotion: HybridDeviceMotionSpec {

  // MARK: - Private

  private let motionManager = CMMotionManager()
  private let queue = OperationQueue()

  // MARK: - Properties

  var isAvailable: Bool {
    return motionManager.isDeviceMotionAvailable
  }

  var isActive: Bool {
    return motionManager.isDeviceMotionActive
  }

  var interval: Double = 100.0 {
    didSet {
      motionManager.deviceMotionUpdateInterval = interval / 1000.0
    }
  }

  var onUpdate: ((DeviceMotionData) -> Void)?

  // MARK: - Methods

  func start() throws {
    guard motionManager.isDeviceMotionAvailable else {
      throw NSError(
        domain: "NitroSensors",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Device Motion is not available on this device"]
      )
    }

    motionManager.deviceMotionUpdateInterval = interval / 1000.0

    // Use xMagneticNorthZVertical for heading support when magnetometer is available
    let referenceFrame: CMAttitudeReferenceFrame = CMMotionManager.availableAttitudeReferenceFrames()
      .contains(.xMagneticNorthZVertical) ? .xMagneticNorthZVertical : .xArbitraryZVertical

    motionManager.startDeviceMotionUpdates(using: referenceFrame, to: queue) { [weak self] data, error in
      guard let data = data, error == nil else { return }

      let attitude = AttitudeData(
        pitch: data.attitude.pitch,
        roll: data.attitude.roll,
        yaw: data.attitude.yaw
      )

      let rotationRate = Vector3(
        x: data.rotationRate.x,
        y: data.rotationRate.y,
        z: data.rotationRate.z
      )

      let userAcceleration = Vector3(
        x: data.userAcceleration.x * 9.81, // Convert g to m/s²
        y: data.userAcceleration.y * 9.81,
        z: data.userAcceleration.z * 9.81
      )

      let gravity = Vector3(
        x: data.gravity.x * 9.81,
        y: data.gravity.y * 9.81,
        z: data.gravity.z * 9.81
      )

      let sensorData = DeviceMotionData(
        attitude: attitude,
        rotationRate: rotationRate,
        userAcceleration: userAcceleration,
        gravity: gravity,
        heading: data.heading, // -1 if unavailable
        timestamp: data.timestamp
      )

      self?.onUpdate?(sensorData)
    }
  }

  func stop() throws {
    motionManager.stopDeviceMotionUpdates()
  }
}
