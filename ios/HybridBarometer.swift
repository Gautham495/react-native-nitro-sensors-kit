import Foundation
import CoreMotion
import NitroModules

class HybridBarometer: HybridBarometerSpec {

  // MARK: - Private

  private let altimeter = CMAltimeter()
  private var _isActive = false

  // MARK: - Properties

  var isAvailable: Bool {
    return CMAltimeter.isRelativeAltitudeAvailable()
  }

  var isActive: Bool {
    return _isActive
  }

  var onUpdate: ((BarometerData) -> Void)?

  // MARK: - Methods

  func start() throws {
    guard CMAltimeter.isRelativeAltitudeAvailable() else {
      throw NSError(
        domain: "NitroSensors",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Barometer is not available on this device"]
      )
    }

    _isActive = true

    altimeter.startRelativeAltitudeUpdates(to: OperationQueue()) { [weak self] data, error in
      guard let data = data, error == nil else { return }

      let sensorData = BarometerData(
        pressure: data.pressure.doubleValue * 10.0, // kPa → hPa (mbar)
        relativeAltitude: data.relativeAltitude.doubleValue, // meters
        timestamp: data.timestamp
      )

      self?.onUpdate?(sensorData)
    }
  }

  func stop() throws {
    altimeter.stopRelativeAltitudeUpdates()
    _isActive = false
  }
}
