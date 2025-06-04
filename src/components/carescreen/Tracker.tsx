// src/components/carescreen/Tracker.tsx
import React from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  LayoutChangeEvent
} from 'react-native'
import MainArc    from '../../assets/carescreen/tracker-rings/MainArc'
import Core       from '../../assets/carescreen/tracker-rings/Core'
import OutterRim  from '../../assets/carescreen/tracker-rings/OutterRim'
import EventMarker from './EventMarker'
import { useTrackerData } from '../../hooks/useTrackerData'
import { QuickLogEntry } from '../../models/QuickLogSchema'

const { width }      = Dimensions.get('window')
const TRACKER_SIZE   = width * 0.9
const BASE_SIZE      = TRACKER_SIZE
const FUTURE_ARC_SIZE = BASE_SIZE - 90
const CORE_SIZE       = BASE_SIZE * (200 / 300)
const OUTER_SIZE      = BASE_SIZE * (320 / 300)

export interface QuickMarker {
  id: string
  fraction: number
  color: string
  type: QuickLogEntry['type']
  isFuture?: boolean
}

export interface Props {
  onMarkerPress?: (id: string, type: QuickLogEntry['type']) => void
  quickMarkers?: QuickMarker[]
  showLast24h?: boolean
  onLayout?: (e: LayoutChangeEvent) => void
}

const Tracker: React.FC<Props> = ({
  onMarkerPress,
  quickMarkers = [],
  showLast24h = false,
  onLayout
}) => {
  // “past/present” logs from storage
  const { eventMarkers } = useTrackerData(showLast24h)

  // current‐time fraction for the outer rim
  const now    = new Date()
  const nowFrac =
    (now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60) / 1440

  // ── 1) CONFIG ───────────────────────────────────────────
  const EPSILON      = 5 / 1440            // 5 minutes of bucket width
  const SPREAD_ANGLE = (6 * Math.PI) / 180 // offset by ±6° if two overlap
  const MARKER_SIZE  = 42

  // ── 2) COMBINE “past” (eventMarkers) + “quick” (future) ──
  const persisted = eventMarkers.filter(em =>
    !quickMarkers.some(qm => qm.id === em.id)
  )

  // Build a single array of Everything, tagging future= true only on quickMarkers
  const allMarkers: QuickMarker[] = [
    // Past/present (no isFuture flag)
    ...persisted.map(em => ({
      id: em.id,
      fraction: em.fraction,
      color: em.color,
      type: em.type,
      isFuture: false,
    })),
    // quickMarkers (some of these come in with isFuture: true already)
    ...quickMarkers.map(qm => ({ ...qm })),
  ]

  // Bucket by time (EPSILON)
  const buckets: QuickMarker[][] = []
  allMarkers.forEach(m => {
    const found = buckets.find(
      b => Math.abs(b[0].fraction - m.fraction) <= EPSILON
    )
    if (found) found.push(m)
    else buckets.push([m])
  })

  // ── 3) RENDER ────────────────────────────────────────────
  const renderItems = buckets.flatMap((bucket, idx) => {
    const baseFrac = bucket[0].fraction

    // If there's exactly 1 marker at this “time”:
    if (bucket.length === 1) {
      const m = bucket[0]
      // Decide ring size & stroke width
      const ringSize    = m.isFuture ? FUTURE_ARC_SIZE : BASE_SIZE
      const strokeWidth = m.isFuture ? 20 : 40
      const opacity     = m.isFuture ? 0.5 : 1.0

      // If it's a future‐marker, wrap in a centered container
      if (m.isFuture) {
        return (
          <View
            key={m.id}
            style={{
              position: 'absolute',
              // push smaller box into center of BASE_SIZE
              left:  (BASE_SIZE - FUTURE_ARC_SIZE) / 2,
              top:   (BASE_SIZE - FUTURE_ARC_SIZE) / 2,
              width: FUTURE_ARC_SIZE,
              height: FUTURE_ARC_SIZE,
            }}
          >
            <EventMarker
              size={FUTURE_ARC_SIZE}
              fraction={m.fraction}
              color={m.color}
              ringStrokeWidth={strokeWidth}
              style={{ opacity }}
              type={m.type}
              onPress={() => onMarkerPress?.(m.id, m.type)}
            />
          </View>
        )
      }

      // Else, a past/present marker just sits in the full BASE_SIZE coordinate space
      return (
        <EventMarker
          key={m.id}
          size={BASE_SIZE}
          fraction={m.fraction}
          color={m.color}
          ringStrokeWidth={strokeWidth}
          style={{ opacity }}
          type={m.type}
          onPress={() => onMarkerPress?.(m.id, m.type)}
        />
      )
    }

    // If exactly two markers collide at the same time, offset them ±SPREAD_ANGLE:
    if (bucket.length === 2) {
      return bucket.map((m, i) => {
        let frac = (baseFrac + (i === 0 ? -SPREAD_ANGLE : SPREAD_ANGLE) / (2 * Math.PI)) % 1
        if (frac < 0) frac += 1

        const ringSize    = m.isFuture ? FUTURE_ARC_SIZE : BASE_SIZE
        const strokeWidth = m.isFuture ? 20 : 40
        const opacity     = m.isFuture ? 0.5 : 1.0

        if (m.isFuture) {
          return (
            <View
              key={m.id}
              style={{
                position: 'absolute',
                left:  (BASE_SIZE - FUTURE_ARC_SIZE) / 2,
                top:   (BASE_SIZE - FUTURE_ARC_SIZE) / 2,
                width: FUTURE_ARC_SIZE,
                height: FUTURE_ARC_SIZE,
              }}
            >
              <EventMarker
                size={FUTURE_ARC_SIZE}
                fraction={frac}
                color={m.color}
                ringStrokeWidth={strokeWidth}
                style={{ opacity }}
                type={m.type}
                onPress={() => onMarkerPress?.(m.id, m.type)}
              />
            </View>
          )
        }

        return (
          <EventMarker
            key={m.id}
            size={BASE_SIZE}
            fraction={frac}
            color={m.color}
            ringStrokeWidth={strokeWidth}
            style={{ opacity }}
            type={m.type}
            onPress={() => onMarkerPress?.(m.id, m.type)}
          />
        )
      })
    }

    // If >2, show a cluster bubble.  Decide whether cluster sits on past or future ring.
    const anyPast = bucket.some(m => !m.isFuture)
    const ringSize = anyPast ? BASE_SIZE : FUTURE_ARC_SIZE
    const strokeHalf = anyPast ? 40 / 2 : 20 / 2

    const angle = baseFrac * 2 * Math.PI - Math.PI / 2
    const fullR = ringSize / 2
    const placeR = fullR - strokeHalf 
    const x = fullR + placeR * Math.cos(angle)
    const y = fullR + placeR * Math.sin(angle)

    return (
      <TouchableOpacity
        key={`cluster-${idx}`}
        style={[
          styles.container,
          {
            left: x - MARKER_SIZE / 2,
            top:  y - MARKER_SIZE / 2,
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            borderRadius: MARKER_SIZE / 2,
            backgroundColor: '#888',
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
                const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
                const mm = String(minutes % 60).padStart(2, '0')
                return `${hh}:${mm} — ${m.type}`
              })
              .join('\n')
          )
        }
      >
        <Text style={styles.clusterText}>+{bucket.length}</Text>
      </TouchableOpacity>
    )
  })

  return (
    <View
      style={[styles.container, { width: TRACKER_SIZE, height: TRACKER_SIZE }]}
      onLayout={onLayout}
    >
      {/* Outer “past/present” arc */}
      <View style={styles.arcAbsolute}>
        <MainArc
          size={BASE_SIZE}
          strokeWidth={40}
          color="rgba(179,165,196,0.50)"
          testID="main-arc"
        />
      </View>

      {/* Inner “future” arc */}
      <View style={styles.arcAbsolute}>
        <MainArc
          size={FUTURE_ARC_SIZE}
          strokeWidth={30}
          color="rgba(203,221,34,0.5)"
          testID="future-arc"
        />
      </View>

      {/* Draw all markers (wrapped if isFuture) */}
      {renderItems}

      {/* (Optional) Core circle */}
      <View style={styles.arcAbsolute}>
        <Core size={CORE_SIZE - 50} color="#E9DAFA" testId="core-circle" />
      </View>

      {/* Current‐time indicator (outer rim) */}
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
