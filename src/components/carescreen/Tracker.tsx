// src/components/carescreen/Tracker.tsx
import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import PlusIcon from '../../assets/icons/carescreen/mini-navbar/PlusIcon'
import MainArc from '../../assets/carescreen/tracker-rings/MainArc'
import ClockArc from '../../assets/carescreen/tracker-rings/ClockArc'

const { width } = Dimensions.get('window')
const TRACKER_SIZE = width * 0.8

interface Props {
  onPlusPress: () => void
  activeTab?: 'tracker' | 'graph' | 'cards'
}

const Tracker: React.FC<Props> = ({ onPlusPress }) => {
  const [progress, setProgress] = useState(0.8) // 50% of the day

  

  return (
    <View style={[styles.container, { width: TRACKER_SIZE, height: TRACKER_SIZE }]}>
      <View style={styles.arcContainer} testID="arc-container">
        <View style={styles.arcAbsolute}>
          <MainArc size={TRACKER_SIZE} strokeWidth={35} color="#E9DAFA" />
        </View>
        <View style={styles.arcAbsolute}>
          <ClockArc size={TRACKER_SIZE} strokeWidth={35} color="#836AF6" progress={progress} />
        </View>
      </View>
      <TouchableOpacity
        onPress={onPlusPress}
        testID="tracker-plus-button"
        style={styles.plusIconWrapper}
      />
    </View>
  )
}

export default Tracker

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arcAbsolute: {
    ...StyleSheet.absoluteFillObject,
  },
  plusIconWrapper: {
    zIndex: 10,
  },
});