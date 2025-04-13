// src/components/carescreen/Tracker.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import PlusIcon from '../../assets/icons/carescreen/mini-navbar/PlusIcon';
import AwakeArc from '../../assets/carescreen/tracker-rings/AwakeArc';
import DiaperArc from '../../assets/carescreen/tracker-rings/DiaperArc';
import FeedArc from '../../assets/carescreen/tracker-rings/FeedArc';
import MoodArc from '../../assets/carescreen/tracker-rings/MoodArc';
import SleepArc from '../../assets/carescreen/tracker-rings/SleepArc';

const { width } = Dimensions.get('window');
const TRACKER_SIZE = width * 0.8;

const Tracker = ({ onPlusPress }: { onPlusPress: () => void }) => {
  return (
    <View style={[styles.container, { width: TRACKER_SIZE, height: TRACKER_SIZE }]}>
      <View style={styles.arcContainer}><SleepArc /></View>
      <View style={styles.arcContainer}><MoodArc /></View>
      <View style={styles.arcContainer}><FeedArc /></View>
      <View style={styles.arcContainer}><DiaperArc /></View>
      <View style={styles.arcContainer}><AwakeArc /></View>

      <TouchableOpacity onPress={onPlusPress} style={styles.plusIconWrapper} testID="tracker-plus-button">
        <PlusIcon />
      </TouchableOpacity>
    </View>
  );
};

export default Tracker;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'center',
    marginTop: 40,
  },
  arcContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconWrapper: {
    zIndex: 10,
  },
});
