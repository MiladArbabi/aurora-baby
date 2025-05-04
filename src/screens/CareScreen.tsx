// src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  LayoutChangeEvent,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../navigation/AppNavigator'

import TopNav from '../components/common/TopNav'
import MiniNavBar, { MiniTab } from '../components/carescreen/MiniNavBar'
import BottomNav from '../components/common/BottomNav'
import Tracker, { QuickMarker } from '../components/carescreen/Tracker'
import TrackerFilter from '../components/carescreen/TrackerFilter'
import QuickLogMenu from '../components/carescreen/QuickLogMenu'
import LogDetailModal from '../components/carescreen/LogDetailModal'
import InsightsView from './InsightsView'
import PastLogsView from '../screens/PastLogsView'
import ActionButtons from '../components/common/ActionButtons'

import { getLogsBetween } from '../services/QuickLogAccess'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { useActionMenuLogic } from '../hooks/useActionMenuLogic'

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

  // fetch logs whenever the filter changes
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

  const handleMarkerPress = useCallback(
    (id: string) => {
      const entry = quickLogEntries.find(e => e.id === id)
      if (entry) setSelectedLog(entry)
    },
    [quickLogEntries]
  )

  const handleNavigate = useCallback(
    (tab: MiniTab) => setActiveTab(tab),
    [setActiveTab]
  )
  const handleSegmentPress = useCallback((id: string) => {}, [])
  const handleToggleFilter = useCallback(
    () => setShowLast24h(v => !v),
    []
  )
  const handleNewAiLog = useCallback(
    (raw: string) => {
      try {
        const entries = JSON.parse(raw) as QuickLogEntry[]
        entries.forEach(handleLogged)
      } catch (err) {
        console.error('[CareScreen] invalid AI JSON:', err)
      }
    },
    [handleLogged]
  )

  const logLayout = (name: string) => (e: LayoutChangeEvent) => {
    console.log(`${name} row height:`, e.nativeEvent.layout.height)
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.accent }]}
      testID="carescreen-gradient"
    >
      {/* Row 1a: TopNav */}
      <View
        style={[styles.row, { flex: 1 }]}
        onLayout={logLayout('Row1a - TopNav')}
      >
        <TopNav navigation={navigation} />
      </View>

      {/* Row 1b: MiniNavBar */}
      <View
        style={[styles.row, { flex: 1 }]}
        onLayout={logLayout('Row1b - MiniNavBar')}
      >
        <MiniNavBar activeTab={activeTab} onNavigate={handleNavigate} />
      </View>

      {/* Row 2: FILTER */}
      <View
        style={[styles.row, { flex: 1 }]}
        onLayout={logLayout('Row2 - Filter')}
      >
        {activeTab === 'tracker' && (
          <TrackerFilter
            showLast24h={showLast24h}
            onToggle={handleToggleFilter}
          />
        )}
      </View>

      {/* Row 3&4: CONTENT (now flex:5) */}
      <View
        style={[styles.row, { flex: 5 }]}
        onLayout={logLayout('Row3&4 - Content')}
      >
        {activeTab === 'tracker' && (
          <Tracker
            onSegmentPress={handleSegmentPress}
            onMarkerPress={handleMarkerPress}
            quickMarkers={quickLogMarkers}
            showLast24h={showLast24h}
          />
        )}
        <View style={[styles.row, { flex: 5, justifyContent: 'flex-start', alignItems: 'stretch' }]}>
          {activeTab === 'cards' && <PastLogsView />}
        </View>
        {activeTab === 'graph' && (
          <>
            <InsightsView showLast24h={showLast24h} />
          </>
        )}
      </View>

      {/* Row 5: ACTION BUTTONS */}
      <View
        style={[styles.row, { flex: 1 }]}
        onLayout={logLayout('Row5 - ActionButtons')}
      >
        {!quickLogMenuVisible && (
          <ActionButtons
            onQuickLogPress={openQuickLog}
            recentLogs={quickLogEntries}
            onNewAiLog={handleNewAiLog}
          />
        )}
      </View>

      {/* Row 6: FOOTER */}
      <View
        style={[styles.row, { flex: 1 }]}
        onLayout={logLayout('Row6 - Footer')}
      >
        <BottomNav navigation={navigation} activeScreen="Care" />
      </View>

      {/* QuickLogMenu overlay */}
      {quickLogMenuVisible && (
        <QuickLogMenu onClose={closeQuickLog} onLogged={handleLogged} />
      )}

      {/* Log detail modal */}
      <LogDetailModal
        visible={!!selectedLog}
        entry={selectedLog!}
        onClose={() => setSelectedLog(null)}
      />
    </SafeAreaView>
  )
}

export default CareScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  row: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
})
