// src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../../navigation/AppNavigator'
import styled from 'styled-components/native'
import { DefaultTheme } from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage'

import CareLayout from '../../components/carescreen/CareLayout'
import { MiniTab } from '../../components/carescreen/MiniNavBar'
/* import Tracker, { QuickMarker } from '../../components/carescreen/Tracker' */
import SliceRing, { SliceCategory } from 'components/carescreen/SliceRing'
import { saveQuickLogEntry } from '../../storage/QuickLogStorage'; 

import { useTrackerData, colorMap } from '../../hooks/useTrackerData'
import TrackerFilter from '../../components/carescreen/TrackerFilter'
import QuickLogMenu from '../../components/carescreen/QuickLogMenu'
import LogDetailModal from '../../components/carescreen/LogDetailModal'
import QuickLogButton from '../../components/carescreen/QuickLogButton'
import WhisprVoiceButton from '../../components/whispr/WhisprVoiceButton'
import { QuickMarker } from '../../components/carescreen/Tracker'

import { 
  getLogsBetween, 
  getFutureEntries, 
  saveFutureEntries,
  deleteLogEntry,
  deleteFutureEntry
} from '../../services/QuickLogAccess'
import { QuickLogEntry } from '../../models/QuickLogSchema'
import { quickLogEmitter } from '../../storage/QuickLogEvents';
import { generateAIQuickLogs } from '../../services/LlamaLogGenerator'
import { useFutureLogs } from '../../hooks/useFutureLogs'
import { generateRuleBasedQuickLogs } from '../../services/RuleBasedLogGenerator' 
import { FUTURE_LOGS_KEY } from '../../services/QuickLogAccess'
import FillNextDayLogsIcon from '../../assets/carescreen/common/FillNextDayLogsIcon'
import ClearLogs           from '../../assets/carescreen/common/ClearLogs'
import ShareIcon           from '../../assets/carescreen/common/ShareIcon'
import { generateDefaultDailyTemplate } from '../../utils/dailySliceTemplate'
import CategoryRing from '../../components/carescreen/CategoryRing'
import OutterRim from '../../assets/carescreen/tracker-rings/OutterRim'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

// Replace common/Button with a styled wrapper for centering and wrapping text
const ShareButton = styled.TouchableOpacity`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.secondaryBackground};
  padding-vertical: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  padding-horizontal: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
  border-radius: 8px;
  align-self: center;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`
const ShareLabel = styled.Text`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
  font-size: 16px;
  text-align: center;
  flex-wrap: wrap;
`
const RING_SIZE = Math.min(Dimensions.get('window').width * 0.85, 300)
const RING_THICKNESS = 30
const GAP = 4
const CLOCK_STROKE_WIDTH = 10
const CLOCK_STROKE_EXTRA = CLOCK_STROKE_WIDTH / 2

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const theme = useTheme()

  const [quickLogMarkers, setQuickLogMarkers] = useState<QuickMarker[]>([])
  const [quickLogEntries, setQuickLogEntries] = useState<QuickLogEntry[]>([])
  const [selectedLog, setSelectedLog] = useState<QuickLogEntry | null>(null)
  const [futureMarkers, setFutureMarkers] = useState<QuickMarker[]>([])
  const [futureEntries, setFutureEntries] = useState<QuickLogEntry[]>([])
  const [showLast24h, setShowLast24h] = useState(false)
  const [isQuickLogOpen, setQuickLogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { entries, eventMarkers, nowFrac, hourlyCategories } = useTrackerData(showLast24h)

  const sleepMask:    boolean[] = Array(24).fill(false)
  const playMask:     boolean[] = Array(24).fill(false)
  const feedDiaperMask: boolean[] = Array(24).fill(false)
  const showerEssMask: boolean[] = Array(24).fill(false)

  for (let h = 0; h < 24; h++) {
    switch (hourlyCategories[h]) {
      case 'sleep':
        sleepMask[h] = true
        break
      case 'play':
        playMask[h] = true
        break
      case 'feedDiaper':
        feedDiaperMask[h] = true
        break
      case 'showerEss':
        showerEssMask[h] = true
        break
    }
  }

/*   // Build a static 24‐hour category array from our default template
  const template = generateDefaultDailyTemplate()
  // flatten into a single SliceCategory[] based on priority order:
  //  sleep > feedDiaper > showerEss > play
  const categories: SliceCategory[] = []
  for (let h = 0; h < 24; ++h) {
    if (template.sleep[h]) {
      categories[h] = 'sleep'
    } else if (template.feedDiaper[h]) {
      categories[h] = 'feedDiaper'
    } else if (template.showerEss[h]) {
      categories[h] = 'showerEss'
    } else {
      categories[h] = 'play'
    }
  } */

     // Simply feed the computed `hourlyCategories` into SliceRing:
  const toFutureMarkers = (entries: QuickLogEntry[]): QuickMarker[] => {
    return entries.map((e) => {
      const t = new Date(e.timestamp)
      const fraction = (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440
      return {
        id: e.id,
        fraction,
        color: colorMap[e.type],
        type: e.type,
        isFuture: true,
      }
    })
  }

  const promoteFutureLog = useCallback(
    async (entry: QuickLogEntry) => {
      try {
        // 1) Save as a “real” log
        await saveQuickLogEntry(entry)
        // (saveQuickLogEntry internally emits 'saved', so Tracker/past logs will refresh)

        // 2) Remove from future storage:
        //    You can re-write the entire array of futureEntries without this one
        const remaining = futureEntries.filter((e) => e.id !== entry.id)
        setFutureEntries(remaining)
        const remainingMarkers = futureMarkers.filter((m) => m.id !== entry.id)
        setFutureMarkers(remainingMarkers)

        //    Also update the AsyncStorage key so it’s gone next time you reload
        await AsyncStorage.setItem(
          '@future_logs',
          JSON.stringify(remaining)
        )
        // 3) Optionally emit a custom event (e.g. 'future-promoted')—not strictly required,
        //    because saveQuickLogEntry already broadcasts to past‐log listeners.
        quickLogEmitter.emit('future-promoted', entry)
      } catch (err) {
        console.error('[CareScreen] promoteFutureLog error:', err)
      }
    },
    [futureEntries, futureMarkers]
  )

  /** ── “Clear all future logs” ─────────────────────────────────────────────────── */
  const handleClearAll = useCallback(async () => {
    try {
      // 1) wipe AsyncStorage key
      await AsyncStorage.setItem(FUTURE_LOGS_KEY, JSON.stringify([]))

      // 2) clear local future state
      setFutureEntries([])
      setFutureMarkers([])

      // 3) Let any listeners know they should remove future markers:
      quickLogEmitter.emit('future-deleted', { id: '' }) // generic broadcast
    } catch (err) {
      console.error('[CareScreen] clearAllFuture error:', err)
    }
  }, [])

  // ── (NEW) “Fill next-day logs” handler ─────────────────────
  const handleFillNextDay = useCallback(async () => {
    setIsGenerating(true)
    try {
      // a) get “real” logs from start-of-today → now
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const recent = await getLogsBetween(start.toISOString(), now.toISOString())

      // b) generate rule-based (or AI) suggestions for next 24h
      //    assume you have generateRuleBasedQuickLogs(recent, hoursAhead, babyId)
      //    (replace with your AI call if desired)
      let babyId = recent[0]?.babyId ?? ''
      const suggestions = await generateRuleBasedQuickLogs(recent, 24, babyId)

      // c) persist to AsyncStorage under FUTURE_LOGS_KEY
      await saveFutureEntries(suggestions)
      quickLogEmitter.emit('future-saved', suggestions[0] /* or emit each individually */)

      // d) update local state immediately
      setFutureEntries((prev) => [...prev, ...suggestions])
      setFutureMarkers((prev) => [...prev, ...toFutureMarkers(suggestions)])
    } catch (err) {
      console.error('[CareScreen] fillNextDay error:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [futureEntries, futureMarkers])

  /** ── Optionally listen for “future-deleted” so UI updates immediately */
  useEffect(() => {
    const onFutureDeleted = ({ id }: { id: string }) => {
      setFutureEntries([])
      setFutureMarkers([])
    }
    quickLogEmitter.on('future-deleted', onFutureDeleted)
    return () => {
      quickLogEmitter.off('future-deleted', onFutureDeleted)
    }
  }, [])

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now()
      futureEntries.forEach((entry) => {
        const entryTime = new Date(entry.timestamp).getTime()
        if (entryTime <= now) {
          promoteFutureLog(entry)
        }
      })
    }, 30_000) // check every 30s; you can adjust to 60_000 (1min)

    return () => clearInterval(checkInterval)
  }, [futureEntries, promoteFutureLog])

  useEffect(() => {
    const now = new Date()
    const start = showLast24h
      ? new Date(now.getTime() - 24*60*60*1000)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate())
    getLogsBetween(start.toISOString(), now.toISOString())
      .then(entries => {
        setQuickLogEntries(entries)
        const seededMarkers = entries
          .filter(e => e.type !== 'sleep')
          .map(e => {
            // always use the timestamp field—even for 'sleep'
            const t = new Date(e.timestamp)
            const fraction =
              (t.getHours()*60 + t.getMinutes() + t.getSeconds()/60) / 1440
            return { id: e.id, fraction, color: colorMap[e.type], type: e.type }
          })
        setQuickLogMarkers(seededMarkers)
      })
      .catch(err => console.error('[CareScreen] fetch logs:', err))
  }, [showLast24h])

  const handleLogged = useCallback((entry: QuickLogEntry) => {
    try {
      if (entry.type !== 'sleep') {
        const t = new Date(entry.timestamp)
        const fraction =
          (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440
        setQuickLogMarkers(existing =>
          existing.some(m => m.id === entry.id)
            ? existing
            : [...existing, { id: entry.id, fraction, color: colorMap[entry.type], type: entry.type }]
        )
      }
      setQuickLogEntries(existing => [entry, ...existing])
    } catch (err) {
      console.error('[CareScreen] handleLogged error:', err)
    }
  }, [])

  useEffect(() => {
    const onSaved = (entry: QuickLogEntry) => handleLogged(entry)
    quickLogEmitter.on('saved', onSaved)
    return () => {
      quickLogEmitter.off('saved', onSaved)
    }
  }, [handleLogged])

  const handleMarkerPress = useCallback(
    (id: string) => {
      const entry = quickLogEntries.find(e => e.id === id)
      if (entry) setSelectedLog(entry)
    },
    [quickLogEntries]
  )

  useEffect(() => {
    getFutureEntries()
      .then((entries) => {
        setFutureEntries(entries);
        // Convert each to a marker:
        const markers = entries.map((e) => {
          const t = new Date(e.timestamp);
          const fraction =
            (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440;
          return {
            id: e.id,
            fraction,
            color: colorMap[e.type],
            type: e.type,
            isFuture: true 
          } as QuickMarker;
        });
        setFutureMarkers(markers);
      })
      .catch((err) => console.error('[CareScreen] fetch future logs:', err));

    // Listen for any “future-saved” event to append just one new future entry
    const onFutureSaved = (entry: QuickLogEntry) => {
      setFutureEntries((prev) => [...prev, entry]);
      const t = new Date(entry.timestamp);
      const fraction = (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440;
      const m: QuickMarker = {
        id: entry.id,
        fraction,
        color: colorMap[entry.type] + '80', // semi-transparent
        type: entry.type,
      };
      setFutureMarkers((prev) =>
        prev.some((x) => x.id === entry.id) ? prev : [...prev, m]
      );
    };
    quickLogEmitter.on('future-saved', onFutureSaved);

    return () => {
      quickLogEmitter.off('future-saved', onFutureSaved);
    };
  }, []);

  const handleToggleFilter = useCallback(() => setShowLast24h(v => !v), [])

  const handleDeleteLog = useCallback(async (id: string) => {
    try {
      // 1) Determine if this id lives in "past" or "future"
      const pastMatch = quickLogEntries.find((e) => e.id === id)
      if (pastMatch) {
        // Deleting a real/past log:
        await deleteLogEntry(pastMatch)
        // local state
        setQuickLogEntries((prev) => prev.filter((e) => e.id !== id))
        setQuickLogMarkers((prev) => prev.filter((m) => m.id !== id))
      } else {
        // Deleting from future logs:
        await deleteFutureEntry(id)
        setFutureEntries((prev) => prev.filter((e) => e.id !== id))
        setFutureMarkers((prev) => prev.filter((m) => m.id !== id))
      }
      setSelectedLog(null)
    } catch (err) {
      console.error('[CareScreen] deleteLog error:', err);
    }
  }, [quickLogEntries, futureEntries, quickLogMarkers, futureMarkers]);

  // Whenever a real‐log is deleted elsewhere, remove its marker & entry
  useEffect(() => {
    const handler = (entry: QuickLogEntry) => {
      setQuickLogEntries((prev) => prev.filter((e) => e.id !== entry.id))
      setQuickLogMarkers((prev) => prev.filter((m) => m.id !== entry.id))
      if (selectedLog?.id === entry.id) {
        setSelectedLog(null)
      }
    }
    quickLogEmitter.on('deleted', handler)
    return () => {
      quickLogEmitter.off('deleted', handler)
    }
  }, [selectedLog])

  // Whenever a future‐log is deleted elsewhere, remove its marker & entry
  useEffect(() => {
    const handler = ({ id }: { id: string }) => {
      setFutureEntries((prev) => prev.filter((e) => e.id !== id))
      setFutureMarkers((prev) => prev.filter((m) => m.id !== id))
      if (selectedLog?.id === id) {
        setSelectedLog(null)
      }
    }
    quickLogEmitter.on('deleted', handler)
    return () => {
      quickLogEmitter.off('deleted', handler)
    }
  }, [selectedLog])

  function handleGenerateFuture(hoursAhead: number) {
    const now = new Date()
    const start = new Date(now.getTime() - (showLast24h ? 24 : now.getHours() * 60 + now.getMinutes()) * 60 * 1000)
    getLogsBetween(start.toISOString(), now.toISOString())
      .then((recent) => generateAIQuickLogs(recent, hoursAhead))
      .then((suggestions: QuickLogEntry[]) => saveFutureEntries(suggestions))
      .then(() => navigation.navigate('Care'))
      .catch(err => console.error('[CareScreen] future-logs generation error:', err))
  }

  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'cards') navigation.navigate('PastLogs');
    else if (tab === 'tracker') return;     // already on Care
    else if (tab === 'graph') navigation.navigate('Insights');
    else if (tab === 'future') navigation.navigate('InferredLogs');
  };

  const logLayout = (name: string) => (e: LayoutChangeEvent) => {
    console.log(`${name} row height:`, e.nativeEvent.layout.height)
  }

  /**
   * Render four small "00:00 / 06:00 / 12:00 / 18:00" labels around the ring.
   */
  const renderTimeLabels = () => {
        // replicate same ring size logic
        const ringSize = Math.min(Dimensions.get('window').width * 0.85, 300)
        const center = ringSize / 2
        const innerRadius = center - 30   // strokeWidth = 30, so text just outside outer edge
        const outerRadius = center
        const padding = 24
    
        // helper: convert polar (angleDeg) → Cartesian on SVG coordinate system
        const toCartesian = (angleDeg: number, radius: number) => {
          const angleRad = (angleDeg - 90) * (Math.PI / 180)
          return {
            x: center + radius * Math.cos(angleRad),
            y: center + radius * Math.sin(angleRad),
          }
        }
    
        // label positions at indices 0, 6, 12, 18 → angles 0*15°, 6*15°, etc
        const labels = [
          { text: '00:00', idx: 0 },
          { text: '06:00', idx: 6 },
          { text: '12:00', idx: 12 },
          { text: '18:00', idx: 18 },
        ]
    
        return labels.map(({ text, idx }) => {
          const angleDeg = idx * (360 / 24)   // 15° * idx
          const { x, y } = toCartesian(angleDeg, outerRadius + padding)
          return (
            <Text
              key={text}
              style={[
                styles.timeLabel,
                {
                  left: x - 16,    // offset half of label width (32/2)
                  top: y - 8,      // offset half of label height (16/2)
                },
              ]}
            >
              {text}
            </Text>
          )
        })
      }

  return (
    <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
      {/* ── 3. Icons section (flex:1) ─────────────────────────── */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleClearAll}
          style={styles.iconWrapper}
        >
          <ClearLogs width={50} height={50} fill="#D0021B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFillNextDay}
          disabled={isGenerating}
          style={styles.iconWrapper}
        >
          <FillNextDayLogsIcon width={50} height={50} fill="#50E3C2" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('EndOfDayExport')}
          style={styles.iconWrapper}
        >
          <ShareIcon width={75} height={75} fill="#453F4E" />
        </TouchableOpacity>
      </View>

      {/* ── 4. Tracker section (flex:4) ─────────────────────────── */}
      <View style={styles.trackerContainer}>
      <View style={styles.ringWrapper}>
          {/* 1) sleep/nap ring (outermost) */}
          <View
            style={{
              position: 'absolute',
              width: RING_SIZE,
              height: RING_SIZE,
              top: CLOCK_STROKE_EXTRA,
              left: CLOCK_STROKE_EXTRA,
            }}
          >
            <CategoryRing
              size={RING_SIZE}
              strokeWidth={RING_THICKNESS}
              mask={sleepMask}
              fillColor="#A3B1E0"       // light blue
              separatorColor="rgba(0,0,0,0.1)"
              testID="sleep-ring"
            />
          </View>

          {/* 2) awake/play ring (next) */}
          <View
            style={{
              position: 'absolute',
              width: RING_SIZE - (RING_THICKNESS + GAP),
              height: RING_SIZE - (RING_THICKNESS + GAP),
              top: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP) / 2,
              left: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP) / 2,
            }}
          >
            <CategoryRing
              size={RING_SIZE - (RING_THICKNESS + GAP)}
              strokeWidth={RING_THICKNESS}
              mask={playMask}
              fillColor="#C8E6C9"       // light green
              separatorColor="rgba(0,0,0,0.1)"
              testID="play-ring"
            />
          </View>

          {/* 3) feed/diaper ring (third) */}
          <View
            style={{
              position: 'absolute',
              width: RING_SIZE - 2 * (RING_THICKNESS + GAP),
              height: RING_SIZE - 2 * (RING_THICKNESS + GAP),
              top: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP),
              left: CLOCK_STROKE_EXTRA + (RING_THICKNESS + GAP),
            }}
          >
            <CategoryRing
              size={RING_SIZE - 2 * (RING_THICKNESS + GAP)}
              strokeWidth={RING_THICKNESS}
              mask={feedDiaperMask}
              fillColor="#FFE0B2"       // light orange
              separatorColor="rgba(0,0,0,0.1)"
              testID="feed-ring"
            />
          </View>

          {/* 4) other essentials ring (innermost) */}
          <View
            style={{
              position: 'absolute',
              width: RING_SIZE - 3 * (RING_THICKNESS + GAP),
              height: RING_SIZE - 3 * (RING_THICKNESS + GAP),
              top: CLOCK_STROKE_EXTRA + 2 * (RING_THICKNESS + GAP) - (RING_THICKNESS + GAP) / 2,
              left: CLOCK_STROKE_EXTRA + 2 * (RING_THICKNESS + GAP) - (RING_THICKNESS + GAP) / 2,
            }}
          >
            <CategoryRing
              size={RING_SIZE - 3 * (RING_THICKNESS + GAP)}
              strokeWidth={RING_THICKNESS}
              mask={showerEssMask}
              fillColor="#F0F4C3"       // light yellow
              separatorColor="rgba(0,0,0,0.1)"
              testID="essentials-ring"
            />
          </View>

          {/* 5) current‐time arc around the outermost circle */}
          <View style={styles.arcAbsolute}>
            <OutterRim
              size={RING_SIZE + CLOCK_STROKE_EXTRA * 2}
              strokeWidth={CLOCK_STROKE_WIDTH}
              color="#FFFFFF"
              progress={nowFrac}
              testID="time-arc"
            />
          </View>
          </View>
         <View style={styles.labelsWrapper}>
          {renderTimeLabels()}
        </View>
      </View>

      {/* ── 5. Filter section (flex:1) ──────────────────────────── */}
      <View style={styles.filterContainer} onLayout={logLayout('Filter')}>
        <TrackerFilter showLast24h={showLast24h} onToggle={handleToggleFilter} />
      </View>

      <QuickLogMenu visible={isQuickLogOpen} onClose={() => setQuickLogOpen(false)} />

      <LogDetailModal
        visible={!!selectedLog}
        entry={selectedLog!}
        onClose={() => setSelectedLog(null)}
        onDelete={handleDeleteLog}
      />
    </CareLayout>
  )
}

export default CareScreen

const styles = StyleSheet.create({
  screen: { flex: 1 },
  // Transparent container allowing its children to float above the tracker
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  // The shared rounded box background
  overlayBox: {
    position: 'absolute',
    top: 16,                // adjust as needed so it sits over tracker
    alignSelf: 'center',
    backgroundColor: '#E9DAFA',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 3,
  },
  row: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcAbsolute: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fillButton: {
    backgroundColor: '#50E3C2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 8,
  },
  fillButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  shareBox: {
    alignSelf: 'center',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 150,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  // Buttons section (flex:1)
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  // Tracker section (flex:4)
  trackerContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Time‐of‐day label styling (position: absolute within trackerContainer)
  timeLabel: {
    position: 'absolute',
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    width: 32,
    textAlign: 'center',
  },
  iconWrapper: {
    marginHorizontal: 12,
  },
  ringWrapper: {
    width: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    height: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
  },
      // absolute-positioned overlay for labels, matching ringWrapper dimensions
      labelsWrapper: {
        position: 'absolute',
        width: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
        height: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
        justifyContent: 'center',
        alignItems: 'center',
      },
  // Filter section (flex:1)
  filterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#D0021B',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 14,
  }
})