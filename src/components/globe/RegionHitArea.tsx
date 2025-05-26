// src/components/globe/RegionHitArea.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import type { RegionMeta } from '../../data/RegionMapSchema';

interface Props {
  region: RegionMeta;
  onPress: (key: string) => void;
  // For now: simple bounding box. Later: use precise SVG hit-testing.
  style?: ViewStyle;
}

export const RegionHitArea: React.FC<Props> = ({ region, onPress, style }) => {
  // In a real SVG globe we'd map region.svgPaths → hit regions.
  return (
    <TouchableOpacity
      style={[styles.hitArea, style]}
      onPress={() => onPress(region.key)}
      activeOpacity={0.6}
      accessibilityLabel={`Go to ${region.displayName}`}
    />
  );
};

const styles = StyleSheet.create({
  hitArea: {
    position: 'absolute',
    // Temporary placeholder size/position
    top: 100,
    left: 100,
    width: 80,
    height: 80,
    // uncomment to debug
    // backgroundColor: 'rgba(255,0,0,0.2)',
  },
});
