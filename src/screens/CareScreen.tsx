//src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../navigation/AppNavigator'

import TopNav from '../components/common/TopNav'
import MiniNavBar, { MiniTab } from '../components/carescreen/MiniNavBar'
import BottomNav from '../components/common/BottomNav'
import Tracker, { QuickMarker } from '../components/carescreen/Tracker'
import QuickLogMenu from '../components/carescreen/QuickLogMenu'
import ActionMenu   from '../components/common/ActionMenu'
import LogDetailModal from '../components/carescreen/LogDetailModal'
import { getLogsBetween } from '../services/QuickLogAccess'

import { QuickLogEntry } from '../models/QuickLogSchema'
import { useActionMenuLogic } from '../hooks/useActionMenuLogic'

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

  useEffect(() => {
    // build ISO strings for midnight–11:59:59 today
    const today = new Date().toISOString().slice(0, 10)
    getLogsBetween(`${today}T00:00:00Z`, `${today}T23:59:59Z`)
    .then(setQuickLogEntries)
    .catch(console.error)
  }, [])

  const handleLogged = useCallback((entry: QuickLogEntry) => {
    const t = new Date(entry.timestamp);
    const fraction =
      (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440;
    const color = colorMap[entry.type];

    setQuickLogMarkers((existing) =>
      existing.some((m) => m.id === entry.id)
        ? existing
        : [
            ...existing,
            {
              id: entry.id,
              fraction,
              color,
              type: entry.type,
            },
          ]
    );
  }, []);

  // only the markers are clickable
  const handleMarkerPress = useCallback((id: string) => {
    const entry = quickLogEntries.find(e => e.id === id)
    if (entry) setSelectedLog(entry)
    },
    [quickLogEntries]
  );

  const closeDetail = () => setSelectedLog(null)

  const handleNavigate = useCallback(
    (tab: MiniTab) => setActiveTab(tab),
    [setActiveTab]
  )
  const handleSegmentPress = useCallback((id: string) => {
    /* no-op for now */
  }, [])

  return (
    <View style={styles.screen}>
      <SafeAreaView testID="carescreen-gradient" style={styles.screen}>
        <TopNav navigation={navigation} />
        <MiniNavBar onNavigate={handleNavigate} />

        <Text testID="active-tab-indicator" style={styles.tabIndicator}>
          Active Tab: {activeTab}
        </Text>

        <Tracker
          onPlusPress={openQuickLog}
          onSegmentPress={handleSegmentPress}
          onMarkerPress={handleMarkerPress}
          quickMarkers={quickLogMarkers}
        />

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

      <ActionMenu
        style={styles.quickLogContainer}
        onQuickLogPress={openQuickLog}
        onWhisprPress={() => navigation.navigate('Whispr')}
        onMicPress={handleVoiceCommand}
      />
    </View>
  )
}

export default CareScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  tabIndicator: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'right',
  },
  quickLogContainer: {
    position: 'absolute',
    right: 20,
    bottom: NAV_HEIGHT + 20,
    alignItems: 'center',
  },
})