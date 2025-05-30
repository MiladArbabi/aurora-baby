//src/components/carescreen/Tracker.tsx
import React from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native'
import MainArc from '../../assets/carescreen/tracker-rings/MainArc'
import InnerRim from '../../assets/carescreen/tracker-rings/InnerRim'
import Core from '../../assets/carescreen/tracker-rings/Core'
import OutterRim from '../../assets/carescreen/tracker-rings/OutterRim'
import SleepRing from './SleepRing'
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

  // ── 1) CONFIG ───────────────────────────────────────────
  const EPSILON = (5 /*min*/ / 1440)       // 5 minutes as fraction of day
  const SPREAD_ANGLE = (6 * Math.PI) / 180 // 6° in radians
  const MARKER_SIZE = 42 

  // ── 2) COMBINE & BUCKET ────────────────────────────────
  const persisted = eventMarkers.filter(em =>
    !quickMarkers.some(qm => qm.id === em.id)
  )

  const all: QuickMarker[] = [
    ...persisted,
    ...quickMarkers
  ]

  const buckets: QuickMarker[][] = []
  all.forEach(m => {
    const found = buckets.find(b => Math.abs(b[0].fraction - m.fraction) <= EPSILON)
    if (found) found.push(m)
    else buckets.push([m])
  })

  // ── 3) RENDER ITEMS ────────────────────────────────────
  const renderItems = buckets.flatMap((bucket, idx) => {
    const baseFrac = bucket[0].fraction
    if (bucket.length === 1) {
      const m = bucket[0]
      return (
        <EventMarker
          key={m.id}
          size={BASE_SIZE}
          fraction={m.fraction}
          color={m.color}
          ringStrokeWidth={40}
          type={m.type}
          onPress={() => onMarkerPress?.(m.id, m.type)}
        />
      )
    } else if (bucket.length === 2) {
      // two: fan-out
      return bucket.map((m, i) => {
        const offset = i === 0 ? -SPREAD_ANGLE : SPREAD_ANGLE
        let frac = (baseFrac + offset / (2 * Math.PI)) % 1
        if (frac < 0) frac += 1
        return (
          <EventMarker
            key={m.id}
            size={BASE_SIZE}
            fraction={frac}
            color={m.color}
            ringStrokeWidth={40}
            type={m.type}
            onPress={() => onMarkerPress?.(m.id, m.type)}
          />
        )
      })
    } else {
      // more than 2: cluster
      // compute absolute position for the cluster bubble
      const angle = baseFrac * 2 * Math.PI - Math.PI / 2
      const fullRadius = BASE_SIZE / 2
      const placementRadius = fullRadius - 40 / 2
      const x = fullRadius + placementRadius * Math.cos(angle)
      const y = fullRadius + placementRadius * Math.sin(angle)

      return (
        <TouchableOpacity
          key={`cluster-${idx}`}
          style={[
            styles.container,
            {
              left:   x - MARKER_SIZE/2,
              top:    y - MARKER_SIZE/2,
              width:  MARKER_SIZE,
              height: MARKER_SIZE,
              borderRadius: MARKER_SIZE/2,
              backgroundColor: '#888',  // choose your cluster color
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          onPress={() =>
            Alert.alert(
              `${bucket.length} events`,
              bucket
                .map(m => {
                  const minutes = Math.round(m.fraction * 1440)
                  const hh = String(Math.floor(minutes/60)).padStart(2,'0')
                  const mm = String(minutes%60).padStart(2,'0')
                  return `${hh}:${mm} — ${m.type}`
                })
                .join('\n')
            )
          }
        >
          <Text style={styles.clusterText}>+{bucket.length}</Text>
        </TouchableOpacity>
      )
    }
  })

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
      </View>

      {/* Sleep segments */}
      {sleepSegments.map(s => (
      <SleepRing
        key={s.id}
        size={BASE_SIZE}
        startFrac={s.startFraction}
        endFrac={s.endFraction}
        color={s.color}
        onPress={() => onSegmentPress?.(s.id)}
      />
      ))}

      {/* combined, fan-out (2) or cluster (>2) */}
      {renderItems}

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
    marginTop: 16,
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
  clusterText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
