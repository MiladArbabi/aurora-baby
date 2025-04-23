import React, { useCallback, useState } from 'react'
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
import ActionMenu from '../components/common/ActionMenu'

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
    handleVoiceCommand,
    activeTab,
    setActiveTab,
  } = useActionMenuLogic()

  const [quickLogMarkers, setQuickLogMarkers] = useState<QuickMarker[]>([])

  const handleLogged = useCallback((entry: QuickLogEntry) => {
    const t = new Date(entry.timestamp)
    const frac =
      (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440

    setQuickLogMarkers(existing => {
      // ⬅️ avoid duplicate keys
      if (existing.some(m => m.id === entry.id)) return existing
      return [...existing, { id: entry.id, fraction: frac, color: '#000000' }]
    })
  }, [])

  const handleNavigate = useCallback(
    (tab: MiniTab) => setActiveTab(tab),
    [setActiveTab]
  )
  const handleSegmentPress = useCallback((id: string) => {}, [])

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
          quickMarkers={quickLogMarkers}
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