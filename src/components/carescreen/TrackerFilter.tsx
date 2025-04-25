// src/components/carescreen/TrackerFilter.tsx
import React from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity, 
  ViewStyle
} from 'react-native'
import TwentyFourHourFilter from '../../assets/icons/common/TwentyFourHourFilter'
import TodayFilter from 'assets/icons/common/TodayFilter'

interface Props {
  /** true ⇒ showing “Last 24 h”, false ⇒ “Today” */
  showLast24h: boolean
  onToggle: () => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')
// based on your Figma px → percent
const CONTAINER_WIDTH = 188
const ITEM_WIDTH      = 75
const ITEM_HEIGHT     = 79


const TrackerFilter: React.FC<Props> = ({ showLast24h, onToggle }) => (
  <View style={styles.container}>
    {/* Last 24 h */}
    <TouchableOpacity
    style={styles.item}
    onPress={() => !showLast24h && onToggle()}
    activeOpacity={0.7}
    testID="filter-24h-button"
    >
        <TwentyFourHourFilter 
        width={ITEM_WIDTH} height={ITEM_HEIGHT} 
        style={!showLast24h ? styles.inactive : undefined}
        />    
    </TouchableOpacity>
    <TouchableOpacity
    style={styles.item}
    onPress={() => showLast24h && onToggle()}
    activeOpacity={0.7}
    testID="filter-today-button"
    >
        <TodayFilter 
        width={ITEM_WIDTH} height={ITEM_HEIGHT} 
        style={showLast24h ? styles.inactive : undefined} 
        />
    </TouchableOpacity>
    {/* Today */}
  </View>
)

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: CONTAINER_WIDTH,
    height: ITEM_HEIGHT,
    bottom: 215,
    left: (SCREEN_WIDTH - CONTAINER_WIDTH) / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center'
  },
  label24: {
    marginTop: 8,       // small gap under circle
    fontFamily: 'Futura',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 50,
    color: '#000',
  },
  labelToday: {
    marginTop: 8,
    fontFamily: 'Futura',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 50,
    color: '#000',
  },
  inactive: {
    opacity: 0.5,       // dim the label when inactive
  },
})

export default TrackerFilter