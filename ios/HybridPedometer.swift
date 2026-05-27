import Foundation
import CoreMotion
import NitroModules

class HybridPedometer: HybridPedometerSpec {

  // MARK: - Private

  private let pedometer = CMPedometer()
  private var _isActive = false

  // MARK: - Properties

  var isAvailable: Bool {
    return CMPedometer.isStepCountingAvailable()
  }

  var isActive: Bool {
    return _isActive
  }

  var onUpdate: ((PedometerData) -> Void)?

  // MARK: - Permission Methods

  func checkPermission() throws -> Promise<PermissionStatus> {
    return Promise.resolved(withResult: self.mapAuthorizationStatus(CMPedometer.authorizationStatus()))
  }

  func requestPermission() throws -> Promise<PermissionStatus> {
    return Promise.async { [weak self] () -> PermissionStatus in
      guard let self = self else { return .denied }

      // CMPedometer doesn't have a standalone "request" API.
      // Permission is triggered on first data query.
      // We do a tiny historical query to trigger the system prompt.
      return try await withCheckedThrowingContinuation { continuation in
        let now = Date()
        let oneMinuteAgo = now.addingTimeInterval(-60)

        self.pedometer.queryPedometerData(from: oneMinuteAgo, to: now) { _, error in
          if let error = error as? NSError, error.code == Int(CMErrorMotionActivityNotAuthorized.rawValue) {
            continuation.resume(returning: .denied)
          } else {
            continuation.resume(returning: self.mapAuthorizationStatus(CMPedometer.authorizationStatus()))
          }
        }
      }
    }
  }

  // MARK: - Sensor Methods

  func start() throws {
    guard CMPedometer.isStepCountingAvailable() else {
      throw NSError(
        domain: "NitroSensors",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Pedometer is not available on this device"]
      )
    }

    _isActive = true

    pedometer.startUpdates(from: Date()) { [weak self] data, error in
      guard let data = data, error == nil else { return }

      let sensorData = PedometerData(
        steps: Double(truncating: data.numberOfSteps),
        distance: data.distance?.doubleValue ?? -1,
        currentPace: data.currentPace?.doubleValue ?? -1,
        currentCadence: data.currentCadence?.doubleValue ?? -1,
        floorsAscended: data.floorsAscended?.doubleValue ?? -1,
        floorsDescended: data.floorsDescended?.doubleValue ?? -1,
        timestamp: Date().timeIntervalSinceReferenceDate
      )

      self?.onUpdate?(sensorData)
    }
  }

  func stop() throws {
    pedometer.stopUpdates()
    _isActive = false
  }

  func queryHistoricalData(startTime: Double, endTime: Double) throws -> Promise<PedometerData> {
    return Promise.async { [weak self] () -> PedometerData in
      guard let self = self else {
        throw NSError(domain: "NitroSensors", code: 2, userInfo: [NSLocalizedDescriptionKey: "Pedometer instance deallocated"])
      }

      // Convert Unix milliseconds to Date
      let start = Date(timeIntervalSince1970: startTime / 1000.0)
      let end = Date(timeIntervalSince1970: endTime / 1000.0)

      return try await withCheckedThrowingContinuation { continuation in
        self.pedometer.queryPedometerData(from: start, to: end) { data, error in
          if let error = error {
            continuation.resume(throwing: error)
            return
          }

          guard let data = data else {
            continuation.resume(throwing: NSError(
              domain: "NitroSensors",
              code: 3,
              userInfo: [NSLocalizedDescriptionKey: "No pedometer data returned"]
            ))
            return
          }

          let result = PedometerData(
            steps: Double(truncating: data.numberOfSteps),
            distance: data.distance?.doubleValue ?? -1,
            currentPace: data.currentPace?.doubleValue ?? -1,
            currentCadence: data.currentCadence?.doubleValue ?? -1,
            floorsAscended: data.floorsAscended?.doubleValue ?? -1,
            floorsDescended: data.floorsDescended?.doubleValue ?? -1,
            timestamp: Date().timeIntervalSinceReferenceDate
          )

          continuation.resume(returning: result)
        }
      }
    }
  }

  // MARK: - Helpers

  private func mapAuthorizationStatus(_ status: CMAuthorizationStatus) -> PermissionStatus {
    switch status {
    case .authorized:
      return .granted
    case .denied:
      return .denied
    case .restricted:
      return .restricted
    case .notDetermined:
      return .denied
    @unknown default:
      return .denied
    }
  }
}
