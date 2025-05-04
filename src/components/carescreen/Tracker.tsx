//src/components/carescreen/Tracker.tsx
import React from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import MainArc from '../../assets/carescreen/tracker-rings/MainArc'
import InnerRim from '../../assets/carescreen/tracker-rings/InnerRim'
import Core from '../../assets/carescreen/tracker-rings/Core'
import OutterRim from '../../assets/carescreen/tracker-rings/OutterRim'
import SegmentArc from './SegmentArc'
import EventMarker from './EventMarker'
import { useTrackerData } from '../../hooks/useTrackerData'
import { QuickLogEntry } from '../../models/QuickLogSchema'

const { width } = Dimensions.get('window')
const TRACKER_SIZE = width * 0.8
const BASE_SIZE = TRACKER_SIZE
const OUTER_SIZE = BASE_SIZE * (320 / 300)
const INNER_SIZE = BASE_SIZE * (220 / 300)
const CORE_SIZE = BASE_SIZE * (200 / 300)

export interface QuickMarker {
  id: string
  fraction: number
  color: string
  type: QuickLogEntry['type']
}

export interface Props {
  onSegmentPress?: (id: string) => void
  onMarkerPress?: (id: string, type: QuickLogEntry['type']) => void
  quickMarkers?: QuickMarker[]
  showLast24h?: boolean
}

const Tracker: React.FC<Props> = ({
  onSegmentPress,
  onMarkerPress,
  quickMarkers = [],
  showLast24h = false,
}) => {
  const { sleepSegments, eventMarkers } = useTrackerData(showLast24h)

  // current time fraction
  const now = new Date()
  const nowFrac =
    (now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60) / 1440

  return (
    <View style={[styles.container, { width: TRACKER_SIZE, height: TRACKER_SIZE }]}>      
      {/* Main static arc */}
      <View style={styles.arcAbsolute}>
        <MainArc
          size={BASE_SIZE}
          strokeWidth={40}
          color="rgba(179, 165, 196, 0.50)"
          testID="main-arc"
        />
      </View>;

      {/* Sleep segments */}
      {sleepSegments.map(s => (
        <TouchableOpacity
          key={s.id}
          testID={`sleep-seg-${s.id}`}
          onPress={() => onSegmentPress?.(s.id)}
          style={StyleSheet.absoluteFill}
        >
          <SegmentArc
            size={BASE_SIZE}
            strokeWidth={35}
            startFraction={s.startFraction}
            endFraction={s.endFraction}
            color={s.color}
            testID={`segment-arc-${s.id}`}
          />
        </TouchableOpacity>
      ))}

      {/* Persisted non-sleep markers */}
      {eventMarkers.map(m => (
        <EventMarker
          key={m.id}
          testID={`${m.type}-marker-${m.id}`}
          size={BASE_SIZE}
          fraction={m.fraction}
          color={m.color}
          ringStrokeWidth={40} 
          onPress={() => onMarkerPress?.(m.id, m.type)}
        />
      ))}

      {/* Quick-log markers */}
      {quickMarkers.map(m => (
        <EventMarker
          key={`quick-${m.id}`}
          testID={`quicklog-marker-${m.id}`}
          size={BASE_SIZE}
          fraction={m.fraction}
          color={m.color}
          ringStrokeWidth={40}
          onPress={() => onMarkerPress?.(m.id, m.type)}
        />
      ))}

      {/* Inner rim */}
      <View style={styles.arcAbsolute}>
        <InnerRim
          size={INNER_SIZE}
          strokeWidth={10}
          color="#FFFFFF"
          testID="inner-rim"
        />
      </View>

      {/* Core circle */}
      <View style={styles.arcAbsolute}>
        <Core size={CORE_SIZE} color="#E9DAFA" testId="core-circle" />
      </View>

      {/* Current time indicator outer rim */}
      <View style={styles.arcAbsolute}>
        <OutterRim
          size={OUTER_SIZE}
          strokeWidth={10}
          color="#FFFFFF"
          progress={nowFrac}
          testID="outter-rim"
        />
      </View>
    </View>
  )
}

export default Tracker

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcAbsolute: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
