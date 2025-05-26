import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RegionHitArea } from '../../../src/components/globe/RegionHitArea';
import type { RegionMeta } from '../../../src/data/RegionMapSchema';

const dummyRegion: RegionMeta = {
  key: 'foo',
  displayName: 'Foo Region',
  spectTags: ['SLEEP'],
  iconName: 'StarIcon',
  baseColor: '#fff',
};

describe('RegionHitArea', () => {
  it('renders touchable and calls onPress with correct key', () => {
    const onPress = jest.fn();
    const { getByA11yLabel } = render(
      <RegionHitArea region={dummyRegion} onPress={onPress} />
    );

    const touchable = getByA11yLabel('Go to Foo Region');
    fireEvent.press(touchable);
    expect(onPress).toHaveBeenCalledWith('foo');
  });
});
