import React from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import TwentyFourHourFilter from '../../assets/icons/common/TwentyFourHourFilter'
import TodayFilter from '../../assets/icons/common/TodayFilter'

interface Props {
  /** true ⇒ showing “Last 24 h”, false ⇒ “Today” */
  showLast24h: boolean
  onToggle: () => void
}

// based on your Figma px → percent
const CONTAINER_WIDTH = 200
const ITEM_WIDTH      = 50
const ITEM_HEIGHT     = 65

const TrackerFilter: React.FC<Props> = ({ showLast24h, onToggle }) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.item}
      onPress={() => !showLast24h && onToggle()}
      activeOpacity={0.7}
      testID="filter-24h-button"
    >
      <TwentyFourHourFilter
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
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
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
        style={showLast24h ? styles.inactive : undefined}
      />
    </TouchableOpacity>
  </View>
)

export default TrackerFilter

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    alignSelf: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactive: {
    opacity: 0.5,
  },
})
