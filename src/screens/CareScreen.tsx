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
import { RootStackParamList } from '../navigation/AppNavigator'
import CareLayout from '../components/carescreen/CareLayout'
import MiniNavBar, { MiniTab } from '../components/carescreen/MiniNavBar'

import Tracker, { QuickMarker } from '../components/carescreen/Tracker'
import TrackerFilter from '../components/carescreen/TrackerFilter'
import QuickLogMenu from '../components/carescreen/QuickLogMenu'
import LogDetailModal from '../components/carescreen/LogDetailModal'

import { getLogsBetween } from '../services/QuickLogAccess'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { useActionMenuLogic } from '../hooks/useActionMenuLogic'
import { quickLogEmitter } from '../storage/QuickLogEvents';

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const theme = useTheme()
  const {
    quickLogMenuVisible,
    openQuickLog,
    closeQuickLog,
    activeTab,
    setActiveTab,
  } = useActionMenuLogic()

  const [quickLogMarkers, setQuickLogMarkers] = useState<QuickMarker[]>([])
  const [quickLogEntries, setQuickLogEntries] = useState<QuickLogEntry[]>([])
  const [selectedLog, setSelectedLog] = useState<QuickLogEntry | null>(null)
  const [showLast24h, setShowLast24h] = useState(false)

  // fetch logs when filter changes
  useEffect(() => {
    const now = new Date()
    const start = showLast24h
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
      : new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            0,
            0,
            0,
            0
          )
        )
    getLogsBetween(start.toISOString(), now.toISOString())
      .then(setQuickLogEntries)
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
          : [
              ...existing,
              { id: entry.id, fraction, color: entry.type, type: entry.type },
            ]
      )
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

  const handleSegmentPress = useCallback((id: string) => {}, [])
  const handleToggleFilter = useCallback(
    () => setShowLast24h(v => !v),
    []
  )

  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'cards') navigation.navigate('PastLogs')
    else if (tab === 'graph') navigation.navigate('Insights')
    else setActiveTab('tracker')
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
        {activeTab === 'tracker' && (
          <TrackerFilter
            showLast24h={showLast24h}
            onToggle={handleToggleFilter}
          />
        )}
      </View>

      {/* Content */}
      <View style={[
        styles.row, { flex: 5 }]} 
        onLayout={logLayout('Content')}
        >
        {activeTab === 'tracker' && (
          <Tracker
            onSegmentPress={handleSegmentPress}
            onMarkerPress={handleMarkerPress}
            quickMarkers={quickLogMarkers}
            showLast24h={showLast24h}
          />
        )}
        </View>
      {/* Overlays */}
      {quickLogMenuVisible && (
        <QuickLogMenu onClose={closeQuickLog} onLogged={handleLogged} />
      )}
      <LogDetailModal
        visible={!!selectedLog}
        entry={selectedLog!}
        onClose={() => setSelectedLog(null)}
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
