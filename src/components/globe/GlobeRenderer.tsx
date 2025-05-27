// src/components/globe/GlobeRenderer.tsx
import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { geoOrthographic, geoPath } from 'd3-geo';
import { landFeatures } from '../../data/world-110m';
import { RegionMap } from '../../data/RegionMapSchema';
import { RegionHitArea } from './RegionHitArea';

const PROJECTION = geoOrthographic()
  .scale(80)
  .translate([100, 100])
  .clipAngle(90);

const PATH = geoPath().projection(PROJECTION);

export const GlobeRenderer: React.FC<{ onRegionPress: (k: string) => void }> = ({
  onRegionPress,
}) => {
  // React state for rotation angles
  const [rot, setRot] = useState({ lon: 0, lat: 0 });

  // onPan: update React state (triggers rerender)
  const onPan = (e: any) => {
    setRot(current => ({
      lon: current.lon + e.nativeEvent.translationX * 0.2,
      lat: current.lat - e.nativeEvent.translationY * 0.2,
    }));
  };

  // apply rotation each render
  PROJECTION.rotate([rot.lon, rot.lat]);

  return (
    <PanGestureHandler onGestureEvent={onPan}>
      <View style={styles.container}>
        <Svg width="100%" height="100%" viewBox="0 0 200 200">
          <Circle cx={100} cy={100} r={80} fill="#a3d5f7" stroke="#45632e" />
          <G>
            {(landFeatures as any).features.map((f: any, i: number) => (
              <Path
                key={i}
                d={PATH(f)!}
                fill="#8bc34a"
                stroke="#45632e"
                strokeWidth={0.3}
              />
            ))}
          </G>
        </Svg>
        {Object.values(RegionMap).map(region => {
          const style = (styles as Record<string, ViewStyle>)[
            `hit_${region.key}`
          ];
          return (
            <RegionHitArea
              key={region.key}
              region={region}
              onPress={onRegionPress}
              style={style}
            />
          );
        })}
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  hit_dreamSky: { top: 120, left: 140, width: 60, height: 60 },
});

export default GlobeRenderer;
