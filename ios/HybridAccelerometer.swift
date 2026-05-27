import Foundation
import CoreMotion
import NitroModules

class HybridAccelerometer: HybridAccelerometerSpec {

  // MARK: - Private

  private let motionManager = CMMotionManager()
  private let queue = OperationQueue()

  // MARK: - Properties

  var isAvailable: Bool {
    return motionManager.isAccelerometerAvailable
  }

  var isActive: Bool {
    return motionManager.isAccelerometerActive
  }

  var interval: Double = 100.0 {
    didSet {
      // Convert milliseconds to seconds for CoreMotion
      motionManager.accelerometerUpdateInterval = interval / 1000.0
    }
  }

  var onUpdate: ((AccelerometerData) -> Void)?

  // MARK: - Methods

  func start() throws {
    guard motionManager.isAccelerometerAvailable else {
      throw NSError(
        domain: "NitroSensors",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Accelerometer is not available on this device"]
      )
    }

    motionManager.accelerometerUpdateInterval = interval / 1000.0

    motionManager.startAccelerometerUpdates(to: queue) { [weak self] data, error in
      guard let data = data, error == nil else { return }

      let sensorData = AccelerometerData(
        x: data.acceleration.x * 9.81, // Convert g to m/s²
        y: data.acceleration.y * 9.81,
        z: data.acceleration.z * 9.81,
        timestamp: data.timestamp
      )

      self?.onUpdate?(sensorData)
    }
  }

  func stop() throws {
    motionManager.stopAccelerometerUpdates()
  }
}
