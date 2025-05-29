// src/components/globe/RegionHitArea.tsx
import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import type { Region } from '../../types/globe';

interface Props {
  /** Region metadata for hit area */
  region: Region;
  /** Callback when region is pressed */
  onPress: (key: string) => void;
  /** Override hit area style */
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const RegionHitArea: React.FC<Props> = ({ region, onPress, style, children }) => {
  return (
    <TouchableOpacity
      testID={`region-hit-${region.key}`}
      accessible
      accessibilityLabel={`Go to ${region.displayName}`}
      style={[styles.hitArea, style]}
      onPress={() => onPress(region.key)}
      activeOpacity={0.6}
    >
      {children ?? null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hitArea: {
    position: 'absolute',
    // default placeholder size/position
    top: 0,
    left: 0,
    width: 80,
    height: 80,
  },
});
