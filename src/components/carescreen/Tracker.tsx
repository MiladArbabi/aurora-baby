//src/components/carescreen/Tracker.tsx
import React from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import MainArc   from '../../assets/carescreen/tracker-rings/MainArc'
import OutterRim from '../../assets/carescreen/tracker-rings/OutterRim'
import InnerRim  from '../../assets/carescreen/tracker-rings/InnerRim'
import Core      from '../../assets/carescreen/tracker-rings/Core'
import SegmentArc  from './SegmentArc'
import EventMarker from './EventMarker'
import { useTrackerData } from '../../hooks/useTrackerData'
import { QuickLogEntry } from '../../models/QuickLogSchema'

const { width } = Dimensions.get('window')
const TRACKER_SIZE = width * 0.8
const BASE_SIZE    = TRACKER_SIZE
const OUTER_SIZE   = BASE_SIZE * (320 / 300)
const INNER_SIZE   = BASE_SIZE * (230 / 300)
const CORE_SIZE    = BASE_SIZE * (220 / 300)

export interface QuickMarker {
  id: string
  fraction: number
  color: string
  type: QuickLogEntry['type']
}

export interface Props {
  onPlusPress: () => void
  onSegmentPress?: (id: string) => void
  onMarkerPress?: (id: string, type: QuickLogEntry['type']) => void
  quickMarkers?: QuickMarker[]
  showLast24h?: boolean
}

const Tracker: React.FC<Props> = ({
  onPlusPress,
  onSegmentPress,
  onMarkerPress,
  quickMarkers = [],
  showLast24h = false,
}) => {
  const { sleepSegments, eventMarkers } = useTrackerData(showLast24h)
  const handleSeg = React.useCallback(
    (id: string) => onSegmentPress?.(id),
    [onSegmentPress],
  )

  const handleMarker = React.useCallback(
    (id: string, type: QuickLogEntry['type']) =>
      onMarkerPress?.(id, type),
    [onMarkerPress],
  )

  // current time fraction for the outer rim
  const now = new Date()
  const nowFrac =
    (now.getHours() * 60 +
     now.getMinutes() +
     now.getSeconds() / 60) /
    1440

  return (
    <View
      style={[
        styles.container,
        { width: TRACKER_SIZE, height: TRACKER_SIZE },
      ]}
    >
      <View style={styles.arcContainer}>

        {/* current time indicator */}
        <View style={styles.arcAbsolute}>
          <OutterRim
            size={OUTER_SIZE}
            strokeWidth={10}
            color="#FFFFFF"
            progress={nowFrac}
            testID="outter-rim"
          />
        </View>

        {/* sleep segments */}
        {sleepSegments.map(s => (
          <TouchableOpacity
            key={s.id}
            testID={`sleep-seg-${s.id}`}
            onPress={() => handleSeg(s.id)}
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

        {/* persisted non‐sleep logs */}
        {eventMarkers.map(m => (
          <EventMarker
            key={m.id}
            testID={`${m.type}-marker-${m.id}`}
            size={BASE_SIZE}
            fraction={m.fraction}
            color={m.color}
            onPress={() => handleMarker(m.id, m.type)}
          />
        ))}

        {/* quick‐logged dots */}
        {quickMarkers.map(m => (
          <EventMarker
            key={`quick-${m.id}`}
            testID={`quicklog-marker-${m.id}`}
            size={BASE_SIZE}
            fraction={m.fraction}
            color={m.color}
            onPress={() => handleMarker(m.id, m.type)}
          />
        ))}

      </View>

      {/* + button */}
      <TouchableOpacity
        onPress={onPlusPress}
        testID="tracker-plus-button"
        style={styles.plusIconWrapper}
      />
    </View>
  )
}

export default Tracker

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcAbsolute: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconWrapper: {
    zIndex: 10,
  },
})