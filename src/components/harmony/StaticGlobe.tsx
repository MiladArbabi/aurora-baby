// src/components/harmony/StaticGlobe.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RegionButton } from '../common/RegionButton';
import type { RegionDef } from '../../data/StaticRegions';

interface StaticGlobeProps {
  regions: RegionDef[];
  globeDiameter?: number;
  onRegionPress: (regionId: string) => void;
}

export const StaticGlobe: React.FC<StaticGlobeProps> = ({
  regions,
  globeDiameter = 280,
  onRegionPress,
}) => {
  return (
    <View style={styles.centerContainer}>
      <View
        style={[
          styles.globe,
          {
            width: globeDiameter,
            height: globeDiameter,
            borderRadius: globeDiameter / 2,
          },
        ]}
      >
        {regions.map(r => (
          <RegionButton
            key={r.id}
            style={{
              ...r.style,
            }}
            color={r.color}
            hoverColor={r.hoverColor}
            onPress={() => onRegionPress(r.id)}
            testID={`region-button-${r.id}`}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  globe: {
    backgroundColor: '#2C79F0', // deep blue
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
    position: 'relative', // must be “relative” for absolute‐positioned children
  },
});
