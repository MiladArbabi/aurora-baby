// src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../navigation/AppNavigator'

import TopNav from '../components/common/TopNav'
import MiniNavBar, { MiniTab } from '../components/carescreen/MiniNavBar'
import BottomNav from '../components/common/BottomNav'
import Tracker, { QuickMarker } from '../components/carescreen/Tracker'
import TrackerFilter from '../components/carescreen/TrackerFilter'
import QuickLogMenu from '../components/carescreen/QuickLogMenu'
import ActionMenu   from '../components/common/ActionMenu'
import LogDetailModal from '../components/carescreen/LogDetailModal'
import PastLogsView   from './PastLogsView'
import SuggestionsView from './SuggestionsView'

import { getLogsBetween } from '../services/QuickLogAccess'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { useActionMenuLogic } from '../hooks/useActionMenuLogic'
import { useTrackerData } from '../hooks/useTrackerData'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const NAV_HEIGHT = 110

const colorMap: Record<QuickLogEntry['type'], string> = {
  sleep:   '#4A90E2',
  feeding: '#50E3C2',
  diaper:  '#F5A623',
  mood:    '#F8E71C',
  health:  '#D0021B',
  note:    '#9013FE',
}

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const {
    quickLogMenuVisible,
    openQuickLog,
    closeQuickLog,
    handleVoiceCommand,
    activeTab,
    setActiveTab,
  } = useActionMenuLogic()

  const [quickLogMarkers, setQuickLogMarkers] = useState<QuickMarker[]>([])
  const [quickLogEntries, setQuickLogEntries] = useState<QuickLogEntry[]>([])
  const [selectedLog, setSelectedLog] = useState<QuickLogEntry | null>(null)
  const [showLast24h, setShowLast24h] = useState(false)
  const { sleepSegments, eventMarkers } = useTrackerData(showLast24h)

  // fetch logs whenever the filter changes
  useEffect(() => {
    const now   = new Date()
    const start = showLast24h
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
      : new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,0,0,0
        ))
    const end      = now
    const startISO = start.toISOString()
    const endISO   = end.toISOString()

    getLogsBetween(startISO, endISO)
      .then(setQuickLogEntries)
      .catch(console.error)
  }, [showLast24h])

  const handleLogged = useCallback((entry: QuickLogEntry) => {
    const t = new Date(entry.timestamp)
    const fraction =
      (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440
    const color = colorMap[entry.type]

    setQuickLogMarkers((existing) =>
      existing.some((m) => m.id === entry.id)
        ? existing
        : [
            ...existing,
            { id: entry.id, fraction, color, type: entry.type },
          ]
    )
  }, [])

  const handleMarkerPress = useCallback((id: string) => {
    const entry = quickLogEntries.find((e) => e.id === id)
    if (entry) setSelectedLog(entry)
  }, [quickLogEntries])

  const closeDetail = () => setSelectedLog(null)
  const handleNavigate = useCallback((tab: MiniTab) => setActiveTab(tab), [setActiveTab])
  const handleSegmentPress = useCallback((id: string) => {}, [])

  return (
    <View style={styles.screen}>
      <SafeAreaView testID="carescreen-gradient" style={styles.screen}>
        <TopNav navigation={navigation} />
        <MiniNavBar activeTab={activeTab} onNavigate={handleNavigate} />

        {activeTab === 'tracker' && (
          <>
            {/* filter toggle */}
            <TrackerFilter
              showLast24h={showLast24h}
              onToggle={() => setShowLast24h((v) => !v)}
            />

            {/* main clock */}
            <Tracker
              onPlusPress={openQuickLog}
              onSegmentPress={handleSegmentPress}
              onMarkerPress={handleMarkerPress}
              quickMarkers={quickLogMarkers}
              showLast24h={showLast24h}
            />
          </>
        )}

        {activeTab === 'cards' && <PastLogsView />}
        {activeTab === 'graph' && <SuggestionsView />}

        <LogDetailModal
          visible={!!selectedLog}
          entry={selectedLog!}
          onClose={closeDetail}
        />

        <BottomNav navigation={navigation} activeScreen="Care" />

        {quickLogMenuVisible && (
          <QuickLogMenu onClose={closeQuickLog} onLogged={handleLogged} />
        )}
      </SafeAreaView>

      {!quickLogMenuVisible && (
        <ActionMenu
          testID="action-menu"
          style={styles.quickLogContainer}
          onQuickLogPress={openQuickLog}
          onWhisprPress={() => navigation.navigate('Whispr')}
          onMicPress={handleVoiceCommand}
        />
      )}
    </View>
  )
}

export default CareScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  quickLogContainer: {
    position: 'absolute',
    right: 20,
    bottom: NAV_HEIGHT + 20,
    alignItems: 'center',
  },
})
