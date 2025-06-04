// src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Text as NativeText,
  Text,
  TouchableOpacity
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
import Tracker, { QuickMarker } from '../../components/carescreen/Tracker'
import { saveQuickLogEntry } from '../../storage/QuickLogStorage'; // for real logs

import { colorMap } from '../../hooks/useTrackerData'
import TrackerFilter from '../../components/carescreen/TrackerFilter'
import QuickLogMenu from '../../components/carescreen/QuickLogMenu'
import LogDetailModal from '../../components/carescreen/LogDetailModal'
import QuickLogButton from '../../components/carescreen/QuickLogButton'
import WhisprVoiceButton from '../../components/whispr/WhisprVoiceButton'

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
        (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440;
      setQuickLogMarkers(existing =>
        existing.some(m => m.id === entry.id)
          ? existing
          : [...existing, { id: entry.id, fraction, color: colorMap[entry.type], type: entry.type }]
      );
    }
      setQuickLogEntries(existing => [entry, ...existing]);
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

  const handleSegmentPress = useCallback((id: string) => {}, [])
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

  return (
    <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
      
      <Tracker
        quickMarkers={[...quickLogMarkers, ...futureMarkers]}
        onMarkerPress={handleMarkerPress}
        showLast24h={showLast24h}
        onLayout={logLayout('Tracker')}
      />
      <View style={[styles.row, { flex: 1 }]} onLayout={logLayout('Filter')}>
        <TrackerFilter showLast24h={showLast24h} onToggle={handleToggleFilter} />
      </View>

      {/* ── new: Fill next-day logs button on Tracker screen ── */}
      <TouchableOpacity
        style={[styles.fillButton]}
        onPress={handleFillNextDay}
        disabled={isGenerating}
      >
        <Text style={styles.fillButtonText}>{isGenerating ? 'Generating…' : 'Fill next-day logs'}</Text>
      </TouchableOpacity>
      
      <View style={{ borderRadius: 25}}>
       <ShareButton onPress={() => navigation.navigate('EndOfDayExport')}>
        <ShareLabel>
          Share Today’s Logs
        </ShareLabel>
       </ShareButton>
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
  row: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  fillButton: {
        backgroundColor: '#50E3C2',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: 'center',
        marginTop: 16,
      },
      fillButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
      },
    
})
