// src/components/carescreen/Tracker.tsx
import React, { useMemo, useState, useCallback } from 'react'
import { View, StyleSheet, GestureResponderEvent, Pressable, Alert } from 'react-native'
import Svg, { Line, Circle } from 'react-native-svg'
import { useTheme } from 'styled-components/native'

import CategoryRing from './CategoryRing'
import ClockArc from '../../assets/carescreen/tracker-rings/ClockArc'
/* import ResizableSliceOverlay from './ResizableSliceOverlay' */
import type { LogSlice } from '../../models/LogSlice'
import { getLogSliceMeta } from '../../storage/LogSliceMetaStorage'
import { saveLogSliceMeta } from '../../storage/LogSliceMetaStorage'
import { LogSliceMeta } from '../../models/LogSliceMeta'
import { useTrackerSchedule } from '../../hooks/useTrackerSchedule'
import { getDailySchedule, saveDailySchedule } from '../../storage/ScheduleStorage'
import LogDetailModal from './LogDetailModal'
import ApprovalRing from './ApprovalRing'
import { EventOverlay, InstantEvent } from './EventOverlay'

import { setSliceConfirmed } from '../../services/LogSliceMetaService'
import { getTodayISO } from '../../utils/date'
import { RING_THICKNESS, RING_SIZE, GAP, CLOCK_STROKE_WIDTH, CLOCK_STROKE_EXTRA, OUTER_RADIUS,
  WRAPPER_SIZE, CENTER, INNERMOST_DIAMETER, CLOCK_RADIUS, T, G
 } from 'utils/trackerConstants'

export type TrackerProps = {
  slices: LogSlice[]
  nowFrac: number
  isEditingSchedule: boolean
  confirmedIds: Set<string>
  aiSuggestedIds: Set<string>
  onSlicePress: (hour: number) => void
  onSliceLongPress: (hour: number) => void
  onApprovalPress: () => void,
}

export default function Tracker({ 
  slices, 
  nowFrac, 
  isEditingSchedule, 
  aiSuggestedIds, 
  onSlicePress, 
  onSliceLongPress,
  onApprovalPress,
  confirmedIds,
 }: TrackerProps) {
  // Derive subsets
  const theme = useTheme()
  const todayISO = getTodayISO()

  const awakeSlices = useMemo(() => slices.filter(s => s.category === 'awake'), [slices])
  const sleepSlices = useMemo(() => slices.filter(s => s.category === 'sleep'), [slices])
  const feedSlices = useMemo(() => slices.filter(s => s.category === 'feed'), [slices])
  const diaperSlices = useMemo(() => slices.filter(s => s.category === 'diaper'), [slices])
  const careSlices = useMemo(() => slices.filter(s => s.category === 'care'), [slices])
  const talkSlices = useMemo(() => slices.filter(s => s.category === 'talk'), [slices])
  const otherSlices = useMemo(() => slices.filter(s => s.category === 'other'), [slices])

  // deriving the new lists
  const feedEvents: InstantEvent[] = feedSlices.map(s => ({
    id: s.id,
    timestamp: s.startTime,
    category: 'feed',
  }))
  const diaperEvents: InstantEvent[] = diaperSlices.map(s => ({
    id: s.id,
    timestamp: s.startTime,
    category: 'diaper',
  }))
  const careEvents: InstantEvent[] = careSlices.map(s => ({
    id: s.id,
    timestamp: s.startTime,
    category: 'care',
  }))
  const talkEvents: InstantEvent[] = talkSlices.map(s => ({
    id: s.id,
    timestamp: s.startTime,
    category: 'talk',
  }))
  const otherEvents: InstantEvent[] = otherSlices.map(s => ({
    id: s.id,
    timestamp: s.startTime,
    category: 'other',
  }))

  const [sliceMode, setSliceMode] = useState<'view' | 'edit' | 'confirm'>('view')
  const [selectedSlice, setSelectedSlice] = useState<LogSlice | null>(null)

  const babyId = 'defaultBabyId'
    const { loading, error, refresh } = 
    useTrackerSchedule( babyId )

  // Pre-compute ticks
  const clockTicks = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const tickOuter = CLOCK_RADIUS + CLOCK_STROKE_WIDTH / 2
      const isMajor = [0, 6, 12, 18].includes(i)
      const tickInner = tickOuter - (isMajor ? 12 : 6)
      const angleDeg = (i * 360) / 24
      const angleRad = ((angleDeg - 90) * Math.PI) / 180
      const x1 = CENTER + tickOuter * Math.cos(angleRad)
      const y1 = CENTER + tickOuter * Math.sin(angleRad)
      const x2 = CENTER + tickInner * Math.cos(angleRad)
      const y2 = CENTER + tickInner * Math.sin(angleRad)
      return <Line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0, 0, 0, 0.6)" strokeWidth={1} />
    })
  }, [CENTER, CLOCK_RADIUS])

      const hitTest = useCallback((evt: GestureResponderEvent): number | null => {
        const { locationX, locationY } = evt.nativeEvent;
        const dx = locationX - CENTER;
        const dy = locationY - CENTER;
        const r = Math.hypot(dx, dy);
      
        const inOuter  = r >= OUTER_RADIUS - T      && r <= OUTER_RADIUS;
        const inMiddle = r >= OUTER_RADIUS - 2*T - G && r <= OUTER_RADIUS - T - G;
        const inInner  = r >= OUTER_RADIUS - 3*T - 2*G && r <= OUTER_RADIUS - 2*T - 2*G;
        if (!inOuter && !inMiddle && !inInner) return null;
      
        let angle = Math.atan2(dy, dx) + Math.PI/2;
        if (angle < 0) angle += 2 * Math.PI;
        const hour = Math.floor((angle * 180/Math.PI) / (360/24));
        return hour;
      }, [CENTER, OUTER_RADIUS, T, G]);

       const handleSave = async (updated: LogSlice) => {
                // ── A) Update today's schedule array ───────────────────────────────
                const schedule = (await getDailySchedule(todayISO, babyId)) || []
                // If a slice with the same ID exists, replace it; otherwise append.
                const foundIdx = schedule.findIndex(s => s.id === updated.id)
                let newSchedule: LogSlice[]
                if (foundIdx >= 0) {
                  newSchedule = [
                    ...schedule.slice(0, foundIdx),
                    updated,
                    ...schedule.slice(foundIdx + 1),
                  ]
                } else {
                  newSchedule = [...schedule, updated]
                }
                await saveDailySchedule(todayISO, babyId, newSchedule)
            
                // ── B) Mark this slice as “edited” in metadata ─────────────────────
                const nowISO = new Date().toISOString()
                const sliceMeta: LogSliceMeta = {
                  id: updated.id,
                  source: 'user',
                  confirmed: false,
                  edited: true,
                  lastModified: nowISO,
                  overlap: false,
                  incomplete: false,
                }
                await saveLogSliceMeta(babyId, sliceMeta)
            
                // Close the modal and refresh the view
                setSelectedSlice(null)
                refresh()
              }
      
        const ringStyles = useMemo(() => ({
              outermost: {
                position: 'absolute' as const,
                width: RING_SIZE,
                height: RING_SIZE,
                top: CLOCK_STROKE_EXTRA,
                left: CLOCK_STROKE_EXTRA,
                zIndex: 1,
              },
              middle: {
                position: 'absolute' as const,
                width: RING_SIZE - 2 * (RING_THICKNESS + GAP),
                height: RING_SIZE - 2 * (RING_THICKNESS + GAP),
                top: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP),
                left: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP),
                zIndex: 0,
              },
              inner: {
                position: 'absolute' as const,
                width: RING_SIZE - 4 * (RING_THICKNESS + GAP),
                height: RING_SIZE - 4 * (RING_THICKNESS + GAP),
                top: CLOCK_STROKE_EXTRA + 2 * (RING_THICKNESS + GAP),
                left: CLOCK_STROKE_EXTRA + 2 * (RING_THICKNESS + GAP),
              },
              arcContainer: {
                ...StyleSheet.absoluteFillObject,
                justifyContent: 'center' as const,
                alignItems: 'center' as const,
              },
              approval: {
                position: 'absolute' as const,
                width: INNERMOST_DIAMETER - 3 * RING_THICKNESS,
                height: INNERMOST_DIAMETER - 3 * RING_THICKNESS,
                top: (WRAPPER_SIZE - (INNERMOST_DIAMETER - 3 * RING_THICKNESS)) / 2,
                left: (WRAPPER_SIZE - (INNERMOST_DIAMETER - 3 * RING_THICKNESS)) / 2,
                zIndex: 10,
                elevation: 10,
              },
              
              absolute: {
                position: 'absolute' as const,
                top: 0,
                left: 0,
              },
            }), [])
            

  // ── Colors for each category ───────────────────────────────────────    // Colors from theme
    const awakeColor      = theme.colors.trackerAwake;
    const sleepColor      = theme.colors.trackerSleep;
    const feedColor       = theme.colors.trackerFeed;
    const diaperColor     = theme.colors.trackerDiaper;
    const essColor        = theme.colors.trackerEssentials;
    const talkColor       = theme.colors.trackerTalk;
    const otherColor      = theme.colors.trackerEssentials;
    const arcColor        = theme.colors.trackerArc;
    const tickColor       = theme.colors.trackerTick;
        
  return (
    <View style={styles.trackerContainer}>
      <Pressable
        style={styles.ringWrapper}
        disabled={isEditingSchedule}
        onPress={(evt) => {
          const hour = hitTest(evt);
          if (hour !== null) onSlicePress(hour);
        }}
        onLongPress={(evt) => {
          const hour = hitTest(evt);
          if (hour !== null) onSliceLongPress(hour);
        }}
        delayLongPress={300}
      >
        {/* 1) Awake/Sleep ring pair (outermost) */}
        <View style={ringStyles.outermost}>
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <CategoryRing
                size={RING_SIZE}
                strokeWidth={RING_THICKNESS}
                slices={awakeSlices}
                fillColor={awakeColor}
                separatorColor="rgba(0,0,0,0.1)"
                testID="awake-ring"
                accessible
                accessibilityLabel={`Awake slices`}
                onSlicePress={!isEditingSchedule ? onSlicePress : undefined}
                onSliceLongPress={!isEditingSchedule ? onSliceLongPress : undefined}
                dimFuture={nowFrac}
                confirmedIds={confirmedIds}
                aiSuggestedIds={aiSuggestedIds} 
                showGaps={false}
                showSeparators={false} 
              />
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <CategoryRing
                size={RING_SIZE}
                strokeWidth={RING_THICKNESS}
                slices={sleepSlices}
                onSlicePress={!isEditingSchedule ? onSlicePress : undefined}
                onSliceLongPress={!isEditingSchedule ? onSliceLongPress : undefined}
                dimFuture={nowFrac}
                accessible
                accessibilityLabel={`Sleep slices`}
                fillColor={sleepColor}
                separatorColor="rgba(0,0,0,0.1)"
                testID="sleep-ring"
                confirmedIds={confirmedIds}
                aiSuggestedIds={aiSuggestedIds} 
                showGaps={false}
                showSeparators={false}
              />
            </View>
          </View>

          {/* middle band → instant feed & diaper icons */}
          <EventOverlay
            events={feedEvents}
            size={RING_SIZE - 2*(RING_THICKNESS+GAP)}
            radius={(RING_SIZE - 2*(RING_THICKNESS+GAP))/2 - RING_THICKNESS/2}
            onPress={id => console.log('feed tapped', id)}
            style={ringStyles.middle}
          />
          <EventOverlay
            events={diaperEvents}
            size={RING_SIZE - 2*(RING_THICKNESS+GAP)}
            radius={(RING_SIZE - 2*(RING_THICKNESS+GAP))/2 - RING_THICKNESS/2}
            onPress={id => console.log('diaper tapped', id)}
            style={ringStyles.middle}
          />

          {/* inner band → care, talk, other */}
          <EventOverlay
            events={careEvents}
            size={RING_SIZE - 4*(RING_THICKNESS+GAP)}
            radius={(RING_SIZE - 4*(RING_THICKNESS+GAP))/2 - RING_THICKNESS/2}
            onPress={id => console.log('care tapped', id)}
            style={ringStyles.inner}
          />
          <EventOverlay
            events={talkEvents}
            size={RING_SIZE - 4*(RING_THICKNESS+GAP)}
            radius={(RING_SIZE - 4*(RING_THICKNESS+GAP))/2 - RING_THICKNESS/2}
            onPress={id => console.log('talk tapped', id)}
            style={ringStyles.inner}
          />
          <EventOverlay
            events={otherEvents}
            size={RING_SIZE - 4*(RING_THICKNESS+GAP)}
            radius={(RING_SIZE - 4*(RING_THICKNESS+GAP))/2 - RING_THICKNESS/2}
            onPress={id => console.log('other tapped', id)}
            style={ringStyles.inner}
          />
          
          {/* 4) Clock arc + ticks (innermost) */}
          <View style={ringStyles.arcContainer}>
            <ClockArc
              size={INNERMOST_DIAMETER - 2 * RING_THICKNESS}
              strokeWidth={CLOCK_STROKE_WIDTH}
              color={arcColor}
              progress={nowFrac}
              testID="time-arc"
              accessible
              accessibilityLabel={`Current time indicator at ${Math.floor(nowFrac * 24)}:00`}
            />
            {/* <Svg
              width={WRAPPER_SIZE}
              height={WRAPPER_SIZE}
              style={styles.tickSvg}
            > */}
              {clockTicks}

              {/* Now‐marker dot at end of arc */}
              <Circle
                cx={
                  CENTER +
                  (CLOCK_RADIUS + CLOCK_STROKE_WIDTH / 2) *
                    Math.cos(nowFrac * 2 * Math.PI - Math.PI / 2)
                }
                cy={
                  CENTER +
                  (CLOCK_RADIUS + CLOCK_STROKE_WIDTH / 2) *
                    Math.sin(nowFrac * 2 * Math.PI - Math.PI / 2)
                }
                r={5}
                fill={theme.colors.primary || '#FF4081'}
              />
            {/* </Svg> */}

            {/* Approval Dashes */}
            <Pressable
              style={ringStyles.approval}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              pointerEvents="box-only"
              onPress={() => {
                onApprovalPress()
              }}
              android_ripple={{ radius: (INNERMOST_DIAMETER - 3 * RING_THICKNESS) / 2 }}
            >
              <ApprovalRing
                size={INNERMOST_DIAMETER - 3 * RING_THICKNESS}
                strokeWidth={3}
                logSlices={slices}
                confirmedIds={confirmedIds}
                nowFrac={nowFrac}
                onSectorPress={(hour) => console.log(`[Tracker] sector ${hour} pressed`)}
              />
            </Pressable>
          </View>
        </Pressable>
        {/* ── 4. Detail Modal ───────────────────────────────────── */}
           {selectedSlice && (
            <LogDetailModal
              visible={true}
              slice={selectedSlice}
              mode={sliceMode}
              onClose={() => setSelectedSlice(null)}
              onSave={handleSave}
              onConfirm={async (id) => {
                await setSliceConfirmed(babyId, id, true)
                setSelectedSlice(null)
                refresh()
              }}
              onDelete={async (id) => {
                if (!id.startsWith('new-')) {
                  const sched = await getDailySchedule(todayISO, babyId)
                  if (sched) {
                    await saveDailySchedule(
                      todayISO,
                      babyId,
                      sched.filter((s) => s.id !== id)
                    )
                    refresh()
                  }
                }
                setSelectedSlice(null)
                }}
              />
            )}
      </View>
    )
}

const styles = StyleSheet.create({
buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  iconWrapper: {
    marginHorizontal: 12,
  },
/*   tickSvg: {
       position: 'absolute',
        top: 0,
        left: 0,
      }, */
  // Tracker section (flex:4)
  trackerContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringWrapper: {
    width: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    height: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
  },
  arcAbsolute: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Time‐of‐day labels (positioned inside trackerContainer)
  labelsWrapper: {
    position: 'absolute',
    width: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    height: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: {
    position: 'absolute',
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    width: 32,
    textAlign: 'center',
  },

  // Filter section (flex:1)
  filterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── CONFIRM‐ALL BANNER STYLES ──────────────────────────────────────
  confirmBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEEBA',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmText: {
    color: '#856404',
    fontFamily: 'Inter',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#856404',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  confirmButtonText: {
    color: '#000000',
    fontFamily: 'Inter',
    fontSize: 14,
  },
})
