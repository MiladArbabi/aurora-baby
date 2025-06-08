// src/components/carescreen/Tracker.tsx

import React, { useMemo, useState, useCallback } from 'react'
import { View, StyleSheet, GestureResponderEvent, Dimensions } from 'react-native'
import Svg, { Line, Circle } from 'react-native-svg'
import { useTheme } from 'styled-components/native'

import CategoryRing from './CategoryRing'
import ClockArc from '../../assets/carescreen/tracker-rings/ClockArc'
import ResizableSliceOverlay from './ResizableSliceOverlay'
import type { LogSlice } from '../../models/LogSlice'
import { getLogSliceMeta } from '../../storage/LogSliceMetaStorage'
import { saveLogSliceMeta } from '../../storage/LogSliceMetaStorage'
import { LogSliceMeta } from '../../models/LogSliceMeta'
import { useTrackerSchedule } from '../../hooks/useTrackerSchedule'
import { getDailySchedule, saveDailySchedule } from '../../storage/ScheduleStorage'
import LogDetailModal from './LogDetailModal'

import { setSliceConfirmed } from '../../services/LogSliceMetaService'
import { getTodayISO } from '../../utils/date'

export type TrackerProps = {
  slices: LogSlice[]
  nowFrac: number
  isEditingSchedule: boolean
  confirmedIds: Set<string>
  aiSuggestedIds: Set<string>
  onSlicePress: (hour: number) => void
  onResize: (id: string, newStartAngle?: number, newEndAngle?: number) => void
}

const RING_SIZE = Dimensions.get('window').width * 0.9;

const RING_THICKNESS = 30;
const GAP = 1;
const CLOCK_STROKE_WIDTH = 5;
const CLOCK_STROKE_EXTRA = CLOCK_STROKE_WIDTH;

const OUTER_RADIUS = RING_SIZE / 2
const T = RING_THICKNESS
const G = GAP

export default function Tracker({ slices, nowFrac, isEditingSchedule, aiSuggestedIds, onSlicePress, onResize }: TrackerProps) {
  // Derive subsets
  const theme = useTheme()
  const todayISO = getTodayISO()

  const awakeSlices = useMemo(() => slices.filter(s => s.category === 'awake'), [slices])
  const sleepSlices = useMemo(() => slices.filter(s => s.category === 'sleep'), [slices])
  const feedDiaperSlices = useMemo(() => slices.filter(s => s.category === 'feed' || s.category === 'diaper'), [slices])
  const careSlices = useMemo(() => slices.filter(s => s.category === 'care'), [slices])
  
  const WRAPPER_SIZE = RING_SIZE + CLOCK_STROKE_EXTRA * 2;
  const CENTER = WRAPPER_SIZE / 2;
  const INNERMOST_DIAMETER = RING_SIZE - 4 * (RING_THICKNESS + GAP);
  const CLOCK_RADIUS = INNERMOST_DIAMETER / 2 - RING_THICKNESS;

  const [sliceMode, setSliceMode] = useState<'view' | 'edit' | 'confirm'>('view')
  const [selectedSlice, setSelectedSlice] = useState<LogSlice | null>(null)
  const [unconfirmedSliceIds, setUnconfirmedSliceIds] = useState<string[]>([])
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set())

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
      return <Line key={`tick-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
    })
  }, [CENTER, CLOCK_RADIUS])

  // Handler for ring touch events
function onRingTouch(evt: GestureResponderEvent) {
  const { locationX, locationY } = evt.nativeEvent
  const dx = locationX - CENTER
  const dy = locationY - CENTER
  const r = Math.hypot(dx, dy)

  // exactly match the three rings you drew:
  const inOuter = r >= OUTER_RADIUS - T && r <= OUTER_RADIUS
  const inMiddle = r >= OUTER_RADIUS - 2*T - G && r <= OUTER_RADIUS - T - G
  const inInner = r >= OUTER_RADIUS - 3*T - 2*G && r <= OUTER_RADIUS - 2*T - 2*G

  if (!inOuter && !inMiddle && !inInner) {
    // ignore taps in the center (clock/arc) or outside
    return
  }

  // if we made it here, it’s one of the colored rings – compute the hour:
  let angle = Math.atan2(dy, dx) + Math.PI/2
  if (angle < 0) angle += 2*Math.PI
  const hour = Math.floor((angle * 180/Math.PI)/(360/24))
  console.log('ring tapped at hour', hour)
  handleSlicePress(hour)
}

  //  ── 4) Slice‐tap handler ─────────────────────────────────────────
  const handleSlicePress = useCallback(
        async (hourIndex: number) => { 
        console.log('[CareScreen] handleSlicePress 🕑 hourIndex =', hourIndex)
          // 1) See if there’s already a LogSlice whose startTime hour == hourIndex
          const existing = slices.find(s => {
            const h = new Date(s.startTime).getHours()
            return h === hourIndex
          })
    
          if (existing) {
            const nowMs = Date.now()
                  const startMs = new Date(existing.startTime).getTime()
                  const meta = await getLogSliceMeta(babyId, existing.id)
            
                  if (startMs < nowMs) {
                    if (meta?.confirmed) {
                      setSliceMode('view')
                    } else {
                      setSliceMode('confirm')
                    }
                  } else {
                    setSliceMode('edit')
                  }
                  setSelectedSlice(existing)
            return
          }
    
          // 2) If no existing slice, create a “new” placeholder slice for that hour window
          const pad = (n: number) => n.toString().padStart(2, '0')
          const startIso = `${todayISO}T${pad(hourIndex)}:00:00.000`
          const endIso   = `${todayISO}T${pad(hourIndex + 1 <= 23 ? hourIndex + 1 : 23)}:00:00.000`
          // createdAt/updatedAt can remain UTC‐ISO if you prefer, but slice times must be local
          const nowIso   = new Date().toISOString()
          const newSlice: LogSlice = {
            id: `new-${todayISO}-${hourIndex}`,         // a temporary ID
            babyId: babyId,                             // replace with actual babyId
            category: 'other',                          // default until user edits
            startTime: startIso,
            endTime: endIso,
            createdAt: nowIso,
            updatedAt: nowIso,
            version: 1,                                 // initial version
          }
          setSelectedSlice(newSlice)
        },
        [slices]
      )

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
                }
                await saveLogSliceMeta(babyId, sliceMeta)
            
                // Close the modal and refresh the view
                setSelectedSlice(null)
                refresh()
              }
      
        const handleConfirmAll = useCallback(async () => {
             // Optimistically clear the banner
             setUnconfirmedSliceIds([])
          
             // Mark each past slice as confirmed
             await Promise.all(
               unconfirmedSliceIds.map(id => setSliceConfirmed(babyId, id, true))
             )
          
        // Merge into confirmedIds set
          setConfirmedIds(prev => {
            const updated = new Set(prev)
            unconfirmedSliceIds.forEach(id => updated.add(id))
               return updated
             })
         }, [babyId, unconfirmedSliceIds])
      
         const handleResize = useCallback(
          async (id: string, newStartAngle?: number, newEndAngle?: number) => {
            // find the slice
            const orig = slices.find(s => s.id === id)
            if (!orig) return
        
            // compute new ISO times from angles
            const angleToTime = (angle: number) => {
              const totalMinutes = (angle / 360) * 24 * 60
              const hours = Math.floor(totalMinutes / 60)
              const minutes = Math.round(totalMinutes % 60)
              const pad2 = (n: number) => n.toString().padStart(2,'0')
              return `${todayISO}T${pad2(hours)}:${pad2(minutes)}:00.000`
            }
        
            const updated: LogSlice = {
              ...orig,
             startTime: newStartAngle != null ? angleToTime(newStartAngle) : orig.startTime,
             endTime:   newEndAngle   != null ? angleToTime(newEndAngle)   : orig.endTime,
            }
            // persist
            const sched = (await getDailySchedule(todayISO, babyId)) || []
            const idx = sched.findIndex(s => s.id === id)
            if (idx >= 0) sched[idx] = updated
            else sched.push(updated)
            await saveDailySchedule(todayISO, babyId, sched)
            refresh()
          },
          [slices, todayISO, babyId, refresh],
        ) 

            const outermostRingStyle = {
              position: 'absolute' as const,
              width: RING_SIZE,
              height: RING_SIZE,
              top: CLOCK_STROKE_EXTRA,
              left: CLOCK_STROKE_EXTRA,
              zIndex: 1,
            };
            
            const middleRingStyle = {
              position: 'absolute' as const,
              width: RING_SIZE - 2 * (RING_THICKNESS + GAP),
              height: RING_SIZE - 2 * (RING_THICKNESS + GAP),
              top: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP),
              left: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP),
              zIndex: 0,
            };
            
            const innerRingStyle = {
              position: 'absolute' as const,
              width: RING_SIZE - 4 * (RING_THICKNESS + GAP),
              height: RING_SIZE - 4 * (RING_THICKNESS + GAP),
              top: CLOCK_STROKE_EXTRA + 2 * (RING_THICKNESS + GAP),
              left: CLOCK_STROKE_EXTRA + 2 * (RING_THICKNESS + GAP),
            };
            
            const arcContainerStyle = {
              ...StyleSheet.absoluteFillObject,
              justifyContent: 'center' as const,
              alignItems: 'center' as const,
            };

  // ── Colors for each category ───────────────────────────────────────    // Colors from theme
    const awakeColor      = theme.colors.trackerAwake;
    const sleepColor      = theme.colors.trackerSleep;
    const feedColor       = theme.colors.trackerFeed;
    const essColor        = theme.colors.trackerEssentials;
    const arcColor        = theme.colors.trackerArc;
    const tickColor       = theme.colors.trackerTick;
        
  return (
    <View style={styles.trackerContainer}>
            <View style={styles.ringWrapper}
            onStartShouldSetResponder={() => {
              console.log(`[ringWrapper] shouldResponder? edit=${isEditingSchedule}`);
              return !isEditingSchedule;
            }}
            onResponderRelease={evt => {
              console.log(`[ringWrapper] responderRelease edit=${isEditingSchedule}`);
                if (!isEditingSchedule) onRingTouch(evt)
              }}
            >
        {/* 1) Awake/Sleep ring pair (outermost) */}
        <View style={outermostRingStyle}>
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
                onSlicePress={!isEditingSchedule ? handleSlicePress : undefined}
                onSliceLongPress={!isEditingSchedule ? (hour) => {
                    console.log('[CareScreen] slice long-press → edit mode', hour)
                    setSliceMode('edit')
                    // find the slice and setSelectedSlice(...)
                    const s = slices.find(s => new Date(s.startTime).getHours() === hour)
                    if (s) setSelectedSlice(s)
                  } : undefined}
                dimFuture={nowFrac}
                confirmedIds={confirmedIds}
                aiSuggestedIds={aiSuggestedIds} 
              />
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <CategoryRing
                size={RING_SIZE}
                strokeWidth={RING_THICKNESS}
                slices={sleepSlices}
                onSlicePress={!isEditingSchedule
                  ? (hour: number) => {
                      console.log(`[CategoryRing] tap hour=${hour} edit=${isEditingSchedule}`);
                      handleSlicePress(hour);
                    }
                  : undefined}
                dimFuture={nowFrac}
                accessible
                accessibilityLabel={`Sleep slices`}
                fillColor={sleepColor}
                separatorColor="rgba(0,0,0,0.1)"
                testID="sleep-ring"
                confirmedIds={confirmedIds}
                aiSuggestedIds={aiSuggestedIds} 
              />
            </View>
          </View>

          {/* 2) Feed/Diaper ring (middle) */}
          <View style={middleRingStyle}>
              <CategoryRing
                size={RING_SIZE - 2 * (RING_THICKNESS + GAP)}
                strokeWidth={RING_THICKNESS}
                slices={feedDiaperSlices}
                fillColor={feedColor}
                separatorColor="rgba(0,0,0,0.1)"
                testID="feed-ring"
                onSlicePress={!isEditingSchedule
                  ? (hour: number) => {
                      console.log(`[CategoryRing] tap hour=${hour} edit=${isEditingSchedule}`);
                      handleSlicePress(hour);
                    }
                  : undefined}
                accessible
                accessibilityLabel="Feed/diaper slice"
                dimFuture={nowFrac}
                confirmedIds={confirmedIds}
                aiSuggestedIds={aiSuggestedIds} 
              />
          </View>

          {/* 3) Essentials ring (inner) */}
          <View style={innerRingStyle}>
            
              <CategoryRing
                size={RING_SIZE - 4 * (RING_THICKNESS + GAP)}
                strokeWidth={RING_THICKNESS}
                slices={careSlices}
                fillColor={essColor}
                separatorColor="rgba(0,0,0,0.1)"
                testID="essentials-ring"
                onSlicePress={!isEditingSchedule
                  ? (hour: number) => {
                      console.log(`[CategoryRing] tap hour=${hour} edit=${isEditingSchedule}`);
                      handleSlicePress(hour);
                    }
                  : undefined}
                accessible
                accessibilityLabel="Care slice"
                dimFuture={nowFrac}
                confirmedIds={confirmedIds}
                aiSuggestedIds={aiSuggestedIds} 
              />
          </View>

          {/* draggable handles overlay */}
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {isEditingSchedule && (
          <ResizableSliceOverlay
            size={RING_SIZE + CLOCK_STROKE_EXTRA * 2}
            strokeWidth={RING_THICKNESS}
            slices={slices}
            onResize={handleResize}
          />
        )}
          </View>
          
          {/* 4) Clock arc + ticks (innermost) */}
          <View style={arcContainerStyle}>
            <ClockArc
              size={INNERMOST_DIAMETER - 2 * RING_THICKNESS}
              strokeWidth={CLOCK_STROKE_WIDTH}
              color={arcColor}
              progress={nowFrac}
              testID="time-arc"
              accessible
              accessibilityLabel={`Current time indicator at ${Math.floor(nowFrac * 24)}:00`}
            />
            <Svg
              width={WRAPPER_SIZE}
              height={WRAPPER_SIZE}
              style={styles.tickSvg}
            >
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
                r={4}
                fill={theme.colors.highlight || '#FF4081'}
              />
            </Svg>
          </View>
        </View>
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
  tickSvg: {
       position: 'absolute',
        top: 0,
        left: 0,
      },
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
