//src/components/carescreen/Tracker.tsx
import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MainArc from '../../assets/carescreen/tracker-rings/MainArc';
import ClockArc from '../../assets/carescreen/tracker-rings/ClockArc';
import OutterRim from '../../assets/carescreen/tracker-rings/OutterRim';
import InnerRim from '../../assets/carescreen/tracker-rings/InnerRim';
import Core from '../../assets/carescreen/tracker-rings/Core';
import SegmentArc from './SegmentArc';
import EventMarker from './EventMarker';
import { useTrackerData } from '../../hooks/useTrackerData';

const { width } = Dimensions.get('window');
const TRACKER_SIZE = width * 0.8;
const BASE_SIZE = TRACKER_SIZE;
const OUTER_SIZE = BASE_SIZE * (320 / 300);
const INNER_SIZE = BASE_SIZE * (230 / 300);
const CORE_SIZE = BASE_SIZE * (220 / 300);

interface Props {
  onPlusPress: () => void;
  onSegmentPress?: (id: string) => void;
}

const Tracker: React.FC<Props> = ({ onPlusPress, onSegmentPress }) => {
  const { sleepSegments, eventMarkers } = useTrackerData();
  // memoize so its identity is stable
  const handleSegmentPress = React.useCallback(
    (id: string) => onSegmentPress?.(id),
    [onSegmentPress],
  );
  // current time fraction for ClockArc
  const now = new Date();
  const nowFrac = (now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60) / 1440;

  return (
    <View style={[styles.container, { width: TRACKER_SIZE, height: TRACKER_SIZE }]}>
      <View style={styles.arcContainer}>
        <View style={styles.arcAbsolute}>
        <OutterRim
          size={OUTER_SIZE}
          strokeWidth={10}
          color="#FFFFFF"
          progress={nowFrac}
          testID="outter-rim"
        />
        </View>
        <View style={styles.arcAbsolute}>
          <InnerRim size={INNER_SIZE} strokeWidth={10} color="#FFFFFF" testID="inner-rim" />
        </View>
        <View style={styles.arcAbsolute}>
          <Core size={CORE_SIZE} color="#E9DAFA" testId='core' />
        </View>

        <View style={styles.arcAbsolute}>
          <MainArc size={BASE_SIZE} strokeWidth={35} color="#E9DAFA" testID="main-arc" />
        </View>
        {sleepSegments.map((seg) => (
          <TouchableOpacity
          key={seg.id}
          testID={`sleep-seg-${seg.id}`}
          onPress={() => handleSegmentPress(seg.id)}
          style={StyleSheet.absoluteFill}
          >
            <SegmentArc
              size={BASE_SIZE}
              strokeWidth={35}
              startFraction={seg.startFraction}
              endFraction={seg.endFraction}
              color={seg.color}
            />
          </TouchableOpacity>
        ))}
        {/* current-time progress */}
        <View style={styles.arcAbsolute}>
          <ClockArc
            size={BASE_SIZE}
            strokeWidth={35}
            color="#836AF6"
            progress={nowFrac}
            testID="clock-arc"
          />
        </View>

        {/* event markers */}
        {eventMarkers.map((m) => (
          <EventMarker
            key={m.id}
            size={BASE_SIZE}
            fraction={m.fraction}
            color={m.color}
            testID={`${m.type}-marker-${m.id}`}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={onPlusPress}
        testID="tracker-plus-button"
        style={styles.plusIconWrapper}
      />
    </View>
  );
};

export default Tracker;

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconWrapper: {
    zIndex: 10,
  },
});