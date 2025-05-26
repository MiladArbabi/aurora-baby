// src/components/globe/GlobeRenderer.tsx

import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { RegionMap } from '../../data/RegionMapSchema';
import { useRegionState } from '../../context/RegionContext';
import { RegionHitArea } from './RegionHitArea';

interface Props {
  onRegionPress: (key: string) => void;
}

export const GlobeRenderer: React.FC<Props> = ({ onRegionPress }) => {
  const regionState = useRegionState();

  return (
    <View style={styles.container}>
      {/* Placeholder globe background */}
      <View style={styles.globe}>
        <Text style={styles.globeText}>🌐</Text>
      </View>

      {/* Render a hit area for each region */}
      {Object.values(RegionMap).map(region => {
        // cast styles so TS knows we’re indexing dynamically
        const hitStyles = (styles as { [key: string]: ViewStyle })[
          `hit_${region.key}`
        ];
        return (
          <RegionHitArea
            key={region.key}
            region={region}
            onPress={onRegionPress}
            style={hitStyles}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  globe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeText: {
    fontSize: 120,
  },
  // Temporary dummy hit-area placements for our stub 'dreamSky'
  hit_dreamSky: {
    top: 120,
    left: 140,
    width: 60,
    height: 60,
  },
  // add more 'hit_<regionKey>' entries as we add regions
});
