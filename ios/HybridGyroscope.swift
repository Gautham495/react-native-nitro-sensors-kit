import Foundation
import CoreMotion
import NitroModules

class HybridGyroscope: HybridGyroscopeSpec {

  // MARK: - Private

  private let motionManager = CMMotionManager()
  private let queue = OperationQueue()

  // MARK: - Properties

  var isAvailable: Bool {
    return motionManager.isGyroAvailable
  }

  var isActive: Bool {
    return motionManager.isGyroActive
  }

  var interval: Double = 100.0 {
    didSet {
      motionManager.gyroUpdateInterval = interval / 1000.0
    }
  }

  var onUpdate: ((GyroscopeData) -> Void)?

  // MARK: - Methods

  func start() throws {
    guard motionManager.isGyroAvailable else {
      throw NSError(
        domain: "NitroSensors",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Gyroscope is not available on this device"]
      )
    }

    motionManager.gyroUpdateInterval = interval / 1000.0

    motionManager.startGyroUpdates(to: queue) { [weak self] data, error in
      guard let data = data, error == nil else { return }

      let sensorData = GyroscopeData(
        x: data.rotationRate.x, // Already in rad/s
        y: data.rotationRate.y,
        z: data.rotationRate.z,
        timestamp: data.timestamp
      )

      self?.onUpdate?(sensorData)
    }
  }

  func stop() throws {
    motionManager.stopGyroUpdates()
  }
}
