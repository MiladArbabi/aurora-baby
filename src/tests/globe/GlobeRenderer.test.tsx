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
});
