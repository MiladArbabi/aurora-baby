import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
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
      style={[styles.iconContainer, activeTab !== 'future' && styles.inactive]}
    >
      {/* You can optionally force a size: <FutureLogsIcon width={24} height={24} /> */}
      <FutureLogsIcon width={50} height={50} />
    </TouchableOpacity>

    <TouchableOpacity
      testID="cards-icon"
      onPress={() => onNavigate?.('cards')}
      style={[styles.iconContainer, activeTab !== 'cards' && styles.inactive]}
    >
      <CardsIcon width={50} height={50} />
    </TouchableOpacity>

    <TouchableOpacity
      testID="tracker-icon"
      onPress={() => onNavigate?.('tracker')}
      style={[styles.iconContainer, activeTab !== 'tracker' && styles.inactive]}
    >
      <TrackerIcon width={50} height={50} />
    </TouchableOpacity>

    <TouchableOpacity
      testID="graph-icon"
      onPress={() => onNavigate?.('graph')}
      style={[styles.iconContainer, activeTab !== 'graph' && styles.inactive]}
    >
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
  iconContainer: {
    flex: 1,
    marginLeft: 20,
    paddingVertical: 8,
  },
  inactive: {
    opacity: 0.6,
  },
  largeIcon: {
        width: 32,
        height: 32,
    },
})
