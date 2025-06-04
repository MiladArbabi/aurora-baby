import React from 'react'
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { SvgProps } from 'react-native-svg'
import TrackerIcon from '../../assets/carescreen/mini-navbar/TrackerIcon'
import GraphIcon   from '../../assets/carescreen/mini-navbar/GraphIcon'
import CardsIcon   from '../../assets/carescreen/mini-navbar/CardsIcon'
import FutureLogsIcon from '../../assets/carescreen/mini-navbar/FutureLogsIcon';

export type MiniTab = 'tracker' | 'graph' | 'cards' | 'future'

interface Props {
  activeTab: MiniTab
  onNavigate?: (screen: MiniTab) => void
}

const MiniNavBar: React.FC<Props> = ({ activeTab, onNavigate }) => (
<View testID="mini-navbar-container" style={styles.container}>
    <TouchableOpacity
      testID="future-icon"
      onPress={() => onNavigate?.('future')}
      style={styles.iconWrapper}
    >
      {activeTab === 'future' && (
        <View style={styles.activeBackground} />
      )}
      <FutureLogsIcon width={50} height={50} />
    </TouchableOpacity>

    <TouchableOpacity
      testID="cards-icon"
      onPress={() => onNavigate?.('cards')}
      style={styles.iconWrapper}
      >
      {activeTab === 'cards' && (
        <View style={styles.activeBackground} />
      )}
      <CardsIcon width={50} height={50} />
    </TouchableOpacity>

    <TouchableOpacity
      testID="tracker-icon"
      onPress={() => onNavigate?.('tracker')}
      style={styles.iconWrapper}
      >
      {activeTab === 'tracker' && (
        <View style={styles.activeBackground} />
      )}
      <TrackerIcon width={50} height={50} />
    </TouchableOpacity>

    <TouchableOpacity
      testID="graph-icon"
      onPress={() => onNavigate?.('graph')}
      style={styles.iconWrapper}
    >
      {activeTab === 'graph' && (
        <View style={styles.activeBackground} />
      )}
      <GraphIcon width={50} height={50}/>
    </TouchableOpacity>
  </View>
)

export default MiniNavBar

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
// each icon gets its own flex box; we layer a background View behind it when active
  iconWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    activeBackground: {
      position: 'absolute',
      width: 75,
      height: 75,
      borderRadius: 12,
      backgroundColor: '#E9DAFA',
      // light shadow (iOS  Android)
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
})
