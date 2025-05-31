// src/components/globe/Globe.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { RegionButton } from '../common/RegionButton';
import type { RegionDef, GlobeOnRegionPress } from '../../types/globeTypes.ts';

interface GlobeProps {
  regions: RegionDef[];
  diameter: number;                 // desired pixel diameter
  showLand?: boolean;               // if true, (in future) render D3 land features
  onRegionPress: GlobeOnRegionPress;
}

export const Globe: React.FC<GlobeProps> = ({
  regions,
  diameter,
  showLand = false,
  onRegionPress,
}) => {
  return (
    <View style={styles.centerContainer}>
      <View
        style={[
          styles.globe,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
          },
        ]}
      >
        {/* Blue ocean circle with white stroke (3px max). */}
        <Svg
          width={diameter}
          height={diameter}
          style={StyleSheet.absoluteFill}
        >
          <Circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={diameter / 2}
            fill="#2C79F0"
            stroke="#FFF"
            strokeWidth={3}
          />
        </Svg>

        {/*
          1) If you ever want to show actual `LandLayer` (via d3-geo),
             you could render <LandLayer projection=… /> here.
             For now, we just rely on the blue circle + region buttons.
        */}

        {/* Region buttons go on top of the globe */}
        {regions.map((r) => (
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
    backgroundColor: 'transparent', // actual fill is in <Svg>
    borderWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
});
