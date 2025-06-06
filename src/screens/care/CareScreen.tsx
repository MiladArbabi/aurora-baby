// src/screens/CareScreen.tsx
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../../navigation/AppNavigator'
import Svg, { Line, Circle } from 'react-native-svg'

import CareLayout from '../../components/carescreen/CareLayout'
import { MiniTab } from '../../components/carescreen/MiniNavBar'
import { useTrackerSchedule } from 'hooks/useTrackerSchedule'
import { LogSlice } from '../../models/LogSlice'
import TrackerFilter from '../../components/carescreen/TrackerFilter'
import CategoryRing from '../../components/carescreen/CategoryRing'
import ClockArc from '../../assets/carescreen/tracker-rings/ClockArc'

import LogDetailModal from '../../components/carescreen/LogDetailModal'
import { QuickLogEntry } from '../../models/QuickLogSchema'
import { getLogsBetween } from '../../services/QuickLogAccess'
import { quickLogEmitter } from '../../storage/QuickLogEvents'
import { getDailySchedule, saveDailySchedule } from '../../storage/ScheduleStorage'
import { setSliceConfirmed } from '../../services/LogSliceMetaService'
import { getLogSliceMeta } from '../../storage/LogSliceMetaStorage'

import FillNextDayLogsIcon from '../../assets/carescreen/common/FillNextDayLogsIcon'
import ClearLogs from '../../assets/carescreen/common/ClearLogs'
import ShareIcon from '../../assets/carescreen/common/ShareIcon'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const RING_SIZE = Dimensions.get('window').width * 0.9;

const RING_THICKNESS = 30;
const GAP = 1;
const CLOCK_STROKE_WIDTH = 5;
const CLOCK_STROKE_EXTRA = CLOCK_STROKE_WIDTH;

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const theme = useTheme()

  const today = new Date()
  const todayISO = today.toISOString().split('T')[0] 

    // Derive shared constants:
    const WRAPPER_SIZE = RING_SIZE + CLOCK_STROKE_EXTRA * 2;
    const CENTER = WRAPPER_SIZE / 2;
    const INNERMOST_DIAMETER = RING_SIZE - 4 * (RING_THICKNESS + GAP);
    const CLOCK_RADIUS = INNERMOST_DIAMETER / 2 - RING_THICKNESS;
  
  // Show last 24h vs today
  const [showLast24h, setShowLast24h] = useState(false)
  // Example “isGenerating” flag (for any future‐generation button)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Pull dynamic slices (LogSlice[]) and nowFrac via the new hook
  // TODO: replace 'defaultBabyId' with the actual babyId from context or props
  const babyId = 'defaultBabyId'
  const { slices, nowFrac, loading, error, refresh } = 
  useTrackerSchedule(babyId, showLast24h)

  // HOOKS
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [hourEntry, setHourEntry] = useState<QuickLogEntry | null>(null)
  const [selectedSlice, setSelectedSlice] = useState<LogSlice | null>(null)
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set())
  const [unconfirmedSliceIds, setUnconfirmedSliceIds] = useState<string[]>([])
  const [aiSuggestedIds, setAiSuggestedIds] = useState<Set<string>>(new Set())

  // Memoize category-specific subsets
  const awakeSlices = useMemo(() => slices.filter(s => s.category === 'awake'), [slices])
  const sleepSlices = useMemo(() => slices.filter(s => s.category === 'sleep'), [slices])
  const feedDiaperSlices = useMemo(() => slices.filter(s => s.category === 'feed' || s.category === 'diaper'), [slices])
  const careSlices = useMemo(() => slices.filter(s => s.category === 'care'), [slices])

  // Whenever 'slices' changes, load metadata to build the two sets (confirmed and unconfirmed)
  useEffect(() => {
    let isSubscribed = true
    async function checkMeta(){
      const nowMs = Date.now()
      const newlyConfirmed = new Set<string>()
      const newlyUnconfirmed: string[] = []
      const newlyAISuggested = new Set<string>() 

      for (const slice of slices) {
        const sliceStartMs = new Date(slice.startTime).getTime()
        const meta = await getLogSliceMeta(babyId, slice.id)

        if (meta && meta.confirmed) {
          newlyConfirmed.add(slice.id)
        }

        if (sliceStartMs < nowMs) {
          if (!meta || meta.confirmed === false) {
            newlyUnconfirmed.push(slice.id)
          }
        }

        // ── NEW: collect AI-suggested slices
        if (meta && meta.source === 'ai') {
          newlyAISuggested.add(slice.id)
        }
      }
        
      if (!isSubscribed) return
      setConfirmedIds(newlyConfirmed)
      setUnconfirmedSliceIds(newlyUnconfirmed)
      setAiSuggestedIds(newlyAISuggested) 
    }
    checkMeta()
    return () => {
      isSubscribed = false
    }
  }, [slices, babyId])

  // Toggle between “last 24h” and “today”
  const handleToggleFilter = useCallback(() => {
    setShowLast24h((v) => !v)
  }, [])

  // Bottom‐tab navigation handler
  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'cards') navigation.navigate('PastLogs')
    else if (tab === 'tracker') return // already here
    else if (tab === 'graph') navigation.navigate('Insights')
    else if (tab === 'future') navigation.navigate('InferredLogs')
  }

  // Log container heights (if needed)
  const logLayout = (name: string) => (e: LayoutChangeEvent) => {
    console.log(`${name} row height:`, e.nativeEvent.layout.height)
  }

  // Colors from theme
  const awakeColor      = theme.colors.trackerAwake;
  const sleepColor      = theme.colors.trackerSleep;
  const feedColor       = theme.colors.trackerFeed;
  const essColor        = theme.colors.trackerEssentials;
  const arcColor        = theme.colors.trackerArc;
  const tickColor       = theme.colors.trackerTick;

  //  ── 4) Slice‐tap handler ─────────────────────────────────────────
  const handleSlicePress = useCallback(
        async (hourIndex: number) => { 
    
          // 1) See if there’s already a LogSlice whose startTime hour == hourIndex
          const existing = slices.find(s => {
            const h = new Date(s.startTime).getHours()
            return h === hourIndex
          })
    
          if (existing) {
            // Already‐logged slice → show it
            setSelectedSlice(existing)
            return
          }
    
          // 2) If no existing slice, create a “new” placeholder slice for that hour window
          const pad = (n: number) => n.toString().padStart(2, '0')
          const startIso = `${todayISO}T${pad(hourIndex)}:00:00.000Z`
          const endIso   = `${todayISO}T${pad(hourIndex+1 <= 23 ? hourIndex+1 : 23)}:00:00.000Z`
          const nowIso   = new Date().toISOString()
          const newSlice: LogSlice = {
            id: `new-${todayISO}-${hourIndex}`,         // a temporary ID
            babyId: babyId,                             // replace with actual babyId
            category: 'other',                          // default until user edits
            startTime: startIso,
            endTime: endIso,
            createdAt: nowIso,
            updatedAt: nowIso,
          }
          setSelectedSlice(newSlice)
        },
        [slices]
      )


 // Pre-compute tick lines once (they never depend on changing state):
 const clockTicks = useMemo(() => {
  return Array.from({ length: 24 }).map((_, i) => {
    const tickOuter = CLOCK_RADIUS + CLOCK_STROKE_WIDTH / 2;
    const isMajor = [0, 6, 12, 18].includes(i);
    const tickInner = tickOuter - (isMajor ? 12 : 6);

    const angleDeg = (i * 360) / 24;
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;

    const x1 = CENTER + tickOuter * Math.cos(angleRad);
    const y1 = CENTER + tickOuter * Math.sin(angleRad);
    const x2 = CENTER + tickInner * Math.cos(angleRad);
    const y2 = CENTER + tickInner * Math.sin(angleRad);

    return (
      <Line
        key={`tick-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={tickColor}
        strokeWidth={1}
      />
    );
  });
}, [CENTER, CLOCK_RADIUS, tickColor]);

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
    
  // Example handlers for the three icons (Clear, Fill, Share)
  // Currently, they log to console or toggle a flag.
  const handleClearAll = () => {
    console.log('Clear‐all icon pressed')
    // TODO: implement logic (if still needed) or remove
  }

  const handleFillNextDay = () => {
    console.log('Fill Next‐Day icon pressed')
    setIsGenerating(true)
    // TODO: trigger AI/rule‐based generation if still desired
    setTimeout(() => setIsGenerating(false), 1000)
  }

  const handleShare = () => {
    console.log('Share icon pressed')
    navigation.navigate('EndOfDayExport')
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

    // Show loading or error
    if (loading) {
      return (
        <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CareLayout>
      )
    }
    if (error) {
      return (
        <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
          <Text style={{ color: theme.colors.error, textAlign: 'center', marginTop: 20 }}>
            {error.message}
          </Text>
          <TouchableOpacity onPress={refresh} style={{ marginTop: 10 }}>
            <Text style={{ color: theme.colors.primary }}>Retry</Text>
          </TouchableOpacity>
        </CareLayout>
      )
    }

  return (
    <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
      {/* ── 0. CONFIRM‐ALL BANNER ────────────────────────────────────────── */}
     {unconfirmedSliceIds.length > 0 && (
       <View style={styles.confirmBanner}>
         <Text style={styles.confirmText}>
           You have {unconfirmedSliceIds.length} past slice
           {unconfirmedSliceIds.length > 1 ? 's' : ''} to confirm.
         </Text>
         <TouchableOpacity onPress={handleConfirmAll} style={styles.confirmButton}>
           <Text style={styles.confirmButtonText}>Confirm All</Text>
         </TouchableOpacity>
       </View>
     )}
      {/* ── 1. Icons ─────────────────────────────────────────── */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleClearAll} style={styles.iconWrapper}>
          <ClearLogs width={50} height={50} fill={theme.colors.error || '#D0021B'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFillNextDay}
          disabled={isGenerating}
          style={styles.iconWrapper}
        >
          <FillNextDayLogsIcon width={50} height={50} fill={theme.colors.primary || '#50E3C2'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.iconWrapper}>
          <ShareIcon width={75} height={75} fill={theme.colors.background || '#453F4E'} />
        </TouchableOpacity>
      </View>

      {/* ── 2. Tracker ───────────────────────────────────────── */}
      <View style={styles.trackerContainer}>
        <View style={styles.ringWrapper}>
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
                onSlicePress={handleSlicePress}
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
                onSlicePress={handleSlicePress}
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
                onSlicePress={handleSlicePress}
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
                onSlicePress={handleSlicePress}
                accessible
                accessibilityLabel="Care slice"
                dimFuture={nowFrac}
                confirmedIds={confirmedIds}
                aiSuggestedIds={aiSuggestedIds} 
              />
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
      </View>

      {/* ── 3. Filter ─────────────────────────────────────────── */}
      <View style={styles.filterContainer} onLayout={logLayout('Filter')}>
        <TrackerFilter showLast24h={showLast24h} onToggle={handleToggleFilter} />
      </View>

      {selectedSlice !== null && (
        <LogDetailModal
          visible={true}
          slice={selectedSlice}
          onClose={() => setSelectedSlice(null)}
          onDelete={async (sliceId) => {
            // If it was an “existing” slice, remove it from today’s schedule:
            if (!sliceId.startsWith('new-')) {
              // 1) fetch the full array
              const schedule = await getDailySchedule(todayISO, babyId)
              if (schedule) {
                const filtered = schedule.filter(s => s.id !== sliceId)
                await saveDailySchedule(todayISO, babyId, filtered)
                refresh()
              }
            }
            setSelectedSlice(null)
          }}
        />
      )}
    </CareLayout>
  );
};

export default CareScreen

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // Icons section (flex:1)
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
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
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: 14,
  },
})
