// src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../../navigation/AppNavigator'
import CareLayout from '../../components/carescreen/CareLayout'
import MiniNavBar, { MiniTab } from '../../components/carescreen/MiniNavBar'

import Tracker, { QuickMarker } from '../../components/carescreen/Tracker'
import { colorMap } from '../../hooks/useTrackerData'
import TrackerFilter from '../../components/carescreen/TrackerFilter'
import QuickLogMenu from '../../components/carescreen/QuickLogMenu'
import LogDetailModal from '../../components/carescreen/LogDetailModal'
import FutureLogsGenerator from '../../components/carescreen/FutureLogsGenerator';
import { 
  getLogsBetween, 
  getFutureEntries, 
  saveFutureEntries, 
  deleteLogEntry
} from '../../services/QuickLogAccess'
import { QuickLogEntry } from '../../models/QuickLogSchema'
import { quickLogEmitter } from '../../storage/QuickLogEvents';
import { generateAIQuickLogs } from '../../services/LlamaLogGenerator'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const theme = useTheme()

  const [quickLogMarkers, setQuickLogMarkers] = useState<QuickMarker[]>([])
  const [quickLogEntries, setQuickLogEntries] = useState<QuickLogEntry[]>([])
  const [selectedLog, setSelectedLog] = useState<QuickLogEntry | null>(null)
  const [futureEntries, setFutureEntries] = useState<QuickLogEntry[]>([])
  const [showLast24h, setShowLast24h] = useState(false)

  // fetch logs when filter changes
  useEffect(() => {
    const now = new Date()
    const start = showLast24h
      ? new Date(now.getTime() - 24*60*60*1000)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate())
    getLogsBetween(start.toISOString(), now.toISOString())
      .then(entries => {
        setQuickLogEntries(entries)
      // seed the markers array so even already‐saved entries show up
      const seededMarkers = entries.map(e => {
        const t = new Date(e.type === 'sleep' ? e.data.start : e.timestamp)
        const fraction = (t.getHours()*60 + t.getMinutes() + t.getSeconds()/60) / 1440
        return { id: e.id, fraction, color: colorMap[e.type], type: e.type }
      })
      setQuickLogMarkers(seededMarkers)
    })
      .catch(err => console.error('[CareScreen] fetch logs:', err))
  }, [showLast24h])

  const handleLogged = useCallback((entry: QuickLogEntry) => {
    try {
      const t = new Date(entry.timestamp)
      const fraction =
        (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440
      setQuickLogMarkers(existing =>
        existing.some(m => m.id === entry.id)
          ? existing
          : [...existing, { id: entry.id, fraction, color: colorMap[entry.type], type: entry.type }]
          );
            // and also put it into the entries list so the PastLogsView (if visible)
            // or any other consumer can pick it up immediately:
            setQuickLogEntries(existing => [entry, ...existing]);
    } catch (err) {
      console.error('[CareScreen] handleLogged error:', err)
    }
  }, [])

  // whenever anything is saved to storage, turn it into a marker:
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
    getFutureEntries().then(setFutureEntries).catch(console.error);
    const handler = (entry: QuickLogEntry) =>
      setFutureEntries((f) => [...f, entry]);
    quickLogEmitter.on('future-saved', handler);
    return () => {
      quickLogEmitter.off('future-saved', handler);
    };
  }, []);

  const handleSegmentPress = useCallback((id: string) => {}, [])
  const handleToggleFilter = useCallback(
    () => setShowLast24h(v => !v),
    []
  )

  // Remove a log permanently
  const handleDeleteLog = useCallback(async (id: string) => {
    try {
      // 1) delete from storage + emit 'deleted'
      await deleteLogEntry(id);
      // 2) remove from our local state so tracker & list update
      setQuickLogEntries(prev => prev.filter(e => e.id !== id));
      setQuickLogMarkers(prev => prev.filter(m => m.id !== id));
      // 3) close the modal
      setSelectedLog(null);
      } catch (err) {
        console.error('[CareScreen] deleteLog error:', err);
      }
    }, []);

  function handleGenerateFuture(hoursAhead: number) {
    const now = new Date()
    const start = new Date(now.getTime() - (showLast24h ? 24 : now.getHours() * 60 + now.getMinutes()) * 60 * 1000)
    
    // 1) load recent logs
    getLogsBetween(start.toISOString(), now.toISOString())
    // 2) ask AI
    .then((recent) => generateAIQuickLogs(recent, hoursAhead))  
    // 3) persist them
    .then((suggestions: QuickLogEntry[]) => saveFutureEntries(suggestions))
    // 4) update UI
    .then(() => navigation.navigate('Care'))
    .catch(err => console.error('[CareScreen] future-logs generation error:', err)
  )
  }

  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'cards') navigation.navigate('PastLogs')
    else if (tab === 'graph') navigation.navigate('Insights')
  }

  const logLayout = (name: string) => (e: LayoutChangeEvent) => {
    console.log(`${name} row height:`, e.nativeEvent.layout.height)
  }

  return (
    <CareLayout 
    activeTab="tracker" 
    onNavigate={handleNavigate}
    bgColor={theme.colors.accent}
    >
        {/* Filter (tracker only) */}
      <View style={[styles.row, { flex: 1 }]} onLayout={logLayout('Filter')}>
          <TrackerFilter
            showLast24h={showLast24h}
            onToggle={handleToggleFilter}
          />
      </View>

      {/* Content */}
      <View style={[
        styles.row, { flex: 5 }]} 
        onLayout={logLayout('Content')}
        >
        </View>


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
})
