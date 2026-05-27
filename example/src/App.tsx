import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useAccelerometer,
  useGyroscope,
  useMagnetometer,
  useDeviceMotion,
  useBarometer,
  usePedometer,
} from 'react-native-nitro-sensors-kit';

// ─── Sensor Card ────────────────────────────────────────────
function SensorCard({
  title,
  active,
  onToggle,
  children,
}: {
  title: string;
  active: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            active ? styles.toggleActive : styles.toggleInactive,
          ]}
          onPress={onToggle}
        >
          <Text style={styles.toggleText}>{active ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

// ─── Value Row ──────────────────────────────────────────────
function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.valueRow}>
      <Text style={styles.valueLabel}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

// ─── Format helpers ─────────────────────────────────────────
const fmt = (n?: number) => (n !== undefined ? n.toFixed(3) : '—');

const fmtInt = (n?: number) =>
  n !== undefined && n !== -1 ? Math.round(n).toString() : '—';

// ─── App ────────────────────────────────────────────────────
export default function App() {
  const [accelActive, setAccelActive] = useState(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [magActive, setMagActive] = useState(false);
  const [motionActive, setMotionActive] = useState(false);
  const [baroActive, setBaroActive] = useState(false);
  const [pedoActive, setPedoActive] = useState(false);

  // 100ms update interval for raw sensors
  const accel = useAccelerometer(100, accelActive);
  const gyro = useGyroscope(100, gyroActive);
  const mag = useMagnetometer(100, magActive);
  const motion = useDeviceMotion(100, motionActive);
  const baro = useBarometer(baroActive);
  const pedo = usePedometer(pedoActive);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Nitro Sensors</Text>
        <Text style={styles.subheading}>Tap a sensor to start/stop</Text>

        {/* Accelerometer */}
        <SensorCard
          title="Accelerometer"
          active={accelActive}
          onToggle={() => setAccelActive((p) => !p)}
        >
          {!accel.isAvailable && accel.data ? (
            <Text style={styles.unavailable}>Not available</Text>
          ) : (
            <>
              <ValueRow label="X (m/s²)" value={fmt(accel.data?.x)} />
              <ValueRow label="Y (m/s²)" value={fmt(accel.data?.y)} />
              <ValueRow label="Z (m/s²)" value={fmt(accel.data?.z)} />
            </>
          )}
        </SensorCard>

        {/* Gyroscope */}
        <SensorCard
          title="Gyroscope"
          active={gyroActive}
          onToggle={() => setGyroActive((p) => !p)}
        >
          {!gyro.isAvailable ? (
            <Text style={styles.unavailable}>Not available</Text>
          ) : (
            <>
              <ValueRow label="X (rad/s)" value={fmt(gyro?.data?.x)} />
              <ValueRow label="Y (rad/s)" value={fmt(gyro?.data?.y)} />
              <ValueRow label="Z (rad/s)" value={fmt(gyro?.data?.z)} />
            </>
          )}
        </SensorCard>

        {/* Magnetometer */}
        <SensorCard
          title="Magnetometer"
          active={magActive}
          onToggle={() => setMagActive((p) => !p)}
        >
          {!mag.isAvailable ? (
            <Text style={styles.unavailable}>Not available</Text>
          ) : (
            <>
              <ValueRow label="X (µT)" value={fmt(mag.data?.x)} />
              <ValueRow label="Y (µT)" value={fmt(mag.data?.y)} />
              <ValueRow label="Z (µT)" value={fmt(mag.data?.z)} />
            </>
          )}
        </SensorCard>

        {/* Device Motion */}
        <SensorCard
          title="Device Motion"
          active={motionActive}
          onToggle={() => setMotionActive((p) => !p)}
        >
          {!motion.isAvailable ? (
            <Text style={styles.unavailable}>Not available</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Attitude</Text>
              <ValueRow
                label="Pitch"
                value={fmt(motion.data?.attitude?.pitch)}
              />
              <ValueRow label="Roll" value={fmt(motion.data?.attitude?.roll)} />
              <ValueRow label="Yaw" value={fmt(motion.data?.attitude?.yaw)} />
              <Text style={styles.sectionLabel}>User Acceleration</Text>
              <ValueRow
                label="X (m/s²)"
                value={fmt(motion.data?.userAcceleration?.x)}
              />
              <ValueRow
                label="Y (m/s²)"
                value={fmt(motion.data?.userAcceleration?.y)}
              />
              <ValueRow
                label="Z (m/s²)"
                value={fmt(motion.data?.userAcceleration?.z)}
              />
              <Text style={styles.sectionLabel}>Gravity</Text>
              <ValueRow label="X (m/s²)" value={fmt(motion.data?.gravity?.x)} />
              <ValueRow label="Y (m/s²)" value={fmt(motion.data?.gravity?.y)} />
              <ValueRow label="Z (m/s²)" value={fmt(motion.data?.gravity?.z)} />
              <ValueRow label="Heading (°)" value={fmt(motion.data?.heading)} />
            </>
          )}
        </SensorCard>

        {/* Barometer */}
        <SensorCard
          title="Barometer"
          active={baroActive}
          onToggle={() => setBaroActive((p) => !p)}
        >
          {!baro.isAvailable ? (
            <Text style={styles.unavailable}>Not available</Text>
          ) : (
            <>
              {baro?.data && (
                <ValueRow
                  label="Pressure (hPa)"
                  value={fmt(baro.data?.pressure)}
                />
              )}
              {baro?.data && (
                <ValueRow
                  label="Rel. Altitude (m)"
                  value={fmt(baro.data?.relativeAltitude)}
                />
              )}
            </>
          )}
        </SensorCard>

        {/* Pedometer */}
        <SensorCard
          title="Pedometer"
          active={pedoActive}
          onToggle={() => setPedoActive((p) => !p)}
        >
          {!pedo.isAvailable ? (
            <Text style={styles.unavailable}>Not available</Text>
          ) : (
            <>
              <ValueRow label="Permission" value={pedo.permissionStatus} />
              {pedo.permissionStatus === 'notDetermined' && (
                <TouchableOpacity
                  style={styles.permButton}
                  onPress={pedo.requestPermission}
                >
                  <Text style={styles.permButtonText}>Request Permission</Text>
                </TouchableOpacity>
              )}
              <ValueRow label="Steps" value={fmtInt(pedo.data?.steps)} />
              <ValueRow label="Distance (m)" value={fmt(pedo.data?.distance)} />
              <ValueRow
                label="Pace (s/m)"
                value={fmt(pedo.data?.currentPace)}
              />
              <ValueRow
                label="Cadence (steps/s)"
                value={fmt(pedo.data?.currentCadence)}
              />
              <ValueRow
                label="Floors ↑"
                value={fmtInt(pedo.data?.floorsAscended)}
              />
              <ValueRow
                label="Floors ↓"
                value={fmtInt(pedo.data?.floorsDescended)}
              />
            </>
          )}
        </SensorCard>
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: 20,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: 'System',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subheading: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#888888',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  cardTitle: {
    fontFamily: 'System',
    fontSize: 17,
    color: '#FFFFFF',
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleActive: {
    backgroundColor: '#34C759',
  },
  toggleInactive: {
    backgroundColor: '#333333',
  },
  toggleText: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#FFFFFF',
  },
  cardBody: {
    padding: 16,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  valueLabel: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#888888',
  },
  valueText: {
    fontFamily: 'Menlo',
    fontSize: 14,
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#555555',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  unavailable: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#FF3B30',
  },
  permButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  permButtonText: {
    fontFamily: 'System',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
