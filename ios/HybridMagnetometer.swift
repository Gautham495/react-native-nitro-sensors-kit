import Foundation
import CoreMotion
import NitroModules

class HybridMagnetometer: HybridMagnetometerSpec {

  // MARK: - Private

  private let motionManager = CMMotionManager()
  private let queue = OperationQueue()

  // MARK: - Properties

  var isAvailable: Bool {
    return motionManager.isMagnetometerAvailable
  }

  var isActive: Bool {
    return motionManager.isMagnetometerActive
  }

  var interval: Double = 100.0 {
    didSet {
      motionManager.magnetometerUpdateInterval = interval / 1000.0
    }
  }

  var onUpdate: ((MagnetometerData) -> Void)?

  // MARK: - Methods

  func start() throws {
    guard motionManager.isMagnetometerAvailable else {
      throw NSError(
        domain: "NitroSensors",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Magnetometer is not available on this device"]
      )
    }

    motionManager.magnetometerUpdateInterval = interval / 1000.0

    motionManager.startMagnetometerUpdates(to: queue) { [weak self] data, error in
      guard let data = data, error == nil else { return }

      let sensorData = MagnetometerData(
        x: data.magneticField.x, // Already in µT
        y: data.magneticField.y,
        z: data.magneticField.z,
        timestamp: data.timestamp
      )

      self?.onUpdate?(sensorData)
    }
  }

  func stop() throws {
    motionManager.stopMagnetometerUpdates()
  }
}
