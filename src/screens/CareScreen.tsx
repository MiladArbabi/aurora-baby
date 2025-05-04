import React, { useCallback, useState, useEffect } from 'react'
import { View, StyleSheet, SafeAreaView, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../navigation/AppNavigator'

import TopNav from '../components/common/TopNav'
import MiniNavBar, { MiniTab } from '../components/carescreen/MiniNavBar'
import BottomNav from '../components/common/BottomNav'
import Tracker, { QuickMarker } from '../components/carescreen/Tracker'
import TrackerFilter from '../components/carescreen/TrackerFilter'
import QuickLogMenu from '../components/carescreen/QuickLogMenu'
import LogDetailModal from '../components/carescreen/LogDetailModal'
import InsightsView from './InsightsView'
import CardsView from '../components/carescreen/CardsView'
import ActionButtons from '../components/common/ActionButtons'

import { getLogsBetween } from '../services/QuickLogAccess'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { useActionMenuLogic } from '../hooks/useActionMenuLogic'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>
const NAV_HEIGHT = 110

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
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
      : new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0, 0, 0, 0
        ))
    const end = now

    getLogsBetween(start.toISOString(), end.toISOString())
      .then(setQuickLogEntries)
      .catch(err => console.error('[CareScreen] fetch logs:', err))
  }, [showLast24h])

  const handleLogged = useCallback((entry: QuickLogEntry) => {
    try {
      const t = new Date(entry.timestamp)
      const fraction = (t.getHours()*60 + t.getMinutes() + t.getSeconds()/60)/1440
      setQuickLogMarkers(existing =>
        existing.some(m => m.id === entry.id)
          ? existing
          : [...existing, { id: entry.id, fraction, color: entry.type, type: entry.type }]
      )
    } catch (err) {
      console.error('[CareScreen] handleLogged error:', err)
    }
  }, [])

  const handleMarkerPress = useCallback((id: string) => {
    const entry = quickLogEntries.find(e => e.id === id)
    if (entry) setSelectedLog(entry)
  }, [quickLogEntries])

  const handleNavigate = useCallback((tab: MiniTab) => setActiveTab(tab), [setActiveTab])
  const handleSegmentPress = useCallback((id: string) => {}, [])

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.screen} testID="carescreen-gradient">
        <TopNav navigation={navigation} />
        <MiniNavBar activeTab={activeTab} onNavigate={handleNavigate} />

        {/* -- filter goes right under minimavbar -- */}
        {activeTab === 'tracker' && (
          <TrackerFilter
            showLast24h={showLast24h}
            onToggle={() => setShowLast24h(v => !v)}
          />
        )}

        {/* -- main clock, pushed down by 100px -- */}
        {activeTab === 'tracker' && (
          <Tracker
            onPlusPress={openQuickLog}
            onSegmentPress={handleSegmentPress}
            onMarkerPress={handleMarkerPress}
            quickMarkers={quickLogMarkers}
            showLast24h={showLast24h}
            style={{ marginTop: 100 }}
          />
        )}

        {activeTab === 'cards' && <CardsView />}

        {activeTab === 'graph' && (
          <>
            <Text style={styles.graphHeading} testID="graph-heading">
              AI Suggestions
            </Text>
            <InsightsView showLast24h={showLast24h} />
          </>
        )}

        <LogDetailModal
          visible={!!selectedLog}
          entry={selectedLog!}
          onClose={() => setSelectedLog(null)}
        />

        <BottomNav navigation={navigation} activeScreen="Care" />

        {quickLogMenuVisible && (
          <QuickLogMenu onClose={closeQuickLog} onLogged={handleLogged} />
        )}
      </SafeAreaView>

      {!quickLogMenuVisible && (
        <ActionButtons
          onQuickLogPress={openQuickLog}
          recentLogs={quickLogEntries}
          onNewAiLog={raw => {
            try {
              const entries = JSON.parse(raw) as QuickLogEntry[]
              entries.forEach(handleLogged)
            } catch (err) {
              console.error('[CareScreen] invalid AI JSON:', err)
            }
          }}
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
  graphHeading: {
    fontSize: 18,
    fontWeight: '600',
    margin: 16,
  },
})
