import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import TrackerIcon from '../../assets/carescreen/mini-navbar/TrackerIcon'
import GraphIcon   from '../../assets/carescreen/mini-navbar/GraphIcon'
import CardsIcon   from '../../assets/carescreen/mini-navbar/CardsIcon'

export type MiniTab = 'tracker' | 'graph' | 'cards'

interface Props {
  activeTab: MiniTab
  onNavigate?: (screen: MiniTab) => void
}

const MiniNavBar: React.FC<Props> = ({ activeTab, onNavigate }) => (
  <View testID="mini-navbar-container" style={styles.container}>
    <TouchableOpacity
      testID="cards-icon"
      onPress={() => onNavigate?.('cards')}
      style={[styles.iconContainer, activeTab !== 'cards' && styles.inactive]}
    >
      <CardsIcon />
    </TouchableOpacity>
    <TouchableOpacity
      testID="tracker-icon"
      onPress={() => onNavigate?.('tracker')}
      style={[styles.iconContainer, activeTab !== 'tracker' && styles.inactive]}
    >
      <TrackerIcon />
    </TouchableOpacity>
    <TouchableOpacity
      testID="graph-icon"
      onPress={() => onNavigate?.('graph')}
      style={[styles.iconContainer, activeTab !== 'graph' && styles.inactive]}
    >
      <GraphIcon />
    </TouchableOpacity>
  </View>
)

export default MiniNavBar

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',  // all icons on the right
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginLeft: 20,              // 20px between icons
  },
  inactive: {
    opacity: 0.75,
  },
})
