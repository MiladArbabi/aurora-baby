// src/components/globe/RegionHitArea.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import type { RegionMeta } from '../../data/RegionMapSchema';

interface Props {
  region: RegionMeta;
  onPress: (key: string) => void;
  /**
   * For now: simple bounding box. Later: use precise SVG hit-testing.
   * style can position/size the hit area.
   */
  style?: ViewStyle;
}

/**
 * Invisible (or debug-mode colored) touch target for a globe region.
 * Exposes both testID for testing and accessibilityLabel for a11y.
 */
export const RegionHitArea: React.FC<Props> = ({ region, onPress, style }) => {
  return (
    <TouchableOpacity
      testID={`region-hit-${region.key}`}
      accessibilityLabel={`Go to ${region.displayName}`}
      accessible={true}
      style={[styles.hitArea, style]}
      onPress={() => onPress(region.key)}
      activeOpacity={0.6}
    />
  );
};

const styles = StyleSheet.create({
  hitArea: {
    position: 'absolute',
    // Temporary placeholder size/position; overridden by style prop
    top: 100,
    left: 100,
    width: 80,
    height: 80,
    // uncomment for debug boundaries
    // backgroundColor: 'rgba(255,0,0,0.2)',
  },
});
