<<<<<<< HEAD
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
=======
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GlobeRenderer } from '../../../src/components/globe/GlobeRenderer';
import { RegionMap } from '../../../src/data/RegionMapSchema';
import * as RegionContext from '../../../src/context/RegionContext';

// Stub useRegionState to avoid needing real context
jest.spyOn(RegionContext, 'useRegionState').mockReturnValue(
  Object.keys(RegionMap).reduce((acc, key) => {
    acc[key] = { unlocked: true, bloomLevel: 0 };
    return acc;
  }, {} as RegionContext.RegionState)
);

describe('GlobeRenderer', () => {
  it('renders a hit area for each region and invokes callback', () => {
    const onRegionPress = jest.fn();
    const { getAllByA11yLabel } = render(
      <GlobeRenderer onRegionPress={onRegionPress} />
    );
    // One hit area per region
    const areas = getAllByA11yLabel(/Go to /);
    expect(areas.length).toBe(Object.keys(RegionMap).length);

    // Fire the first one:
    fireEvent.press(areas[0]);
    const firstKey = Object.keys(RegionMap)[0];
    expect(onRegionPress).toHaveBeenCalledWith(firstKey);
  });
>>>>>>> feature/257-globe-testing-baseline
});
