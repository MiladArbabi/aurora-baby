// src/components/globe/GlobeRenderer.tsx

import React, { useCallback, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withDecay,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { geoOrthographic, geoPath } from 'd3-geo';
import { landFeatures } from '../../data/world-110m';
import { RegionMap } from '../../data/RegionMapSchema';
import { RegionHitArea } from './RegionHitArea';

// ————— Projection & path generator —————
const PROJECTION = geoOrthographic()
  .scale(80)             // radius of our globe circle
  .translate([100, 100]) // center in 200×200 viewBox
  .clipAngle(90);        // only front hemisphere

const PATH = geoPath().projection(PROJECTION);

interface Props {
  onRegionPress: (key: string) => void;
}

const GlobeRenderer: React.FC<Props> = ({ onRegionPress }) => {
  // 1) shared values for rotation & zoom
  const [tick, setTick] = useState(0);
  const rotLon = useSharedValue(0);
  const rotLat = useSharedValue(0);
  const startLon = useSharedValue(0);
  const startLat = useSharedValue(0);
  const scale  = useSharedValue(1);

  // 2) a JS‐thread function that actually calls projection.rotate
  const rotateJS = useCallback((lon: number, lat: number) => {
    PROJECTION.rotate([lon, lat]);
    setTick(t => t + 1);        // force React to re-render
  }, []);

  // 3) Whenever our shared values change, run rotateJS on JS thread
  useAnimatedReaction(
    () => [rotLon.value, rotLat.value],
    ([lon, lat]) => {
      runOnJS(rotateJS)(lon, lat);
    }
  );

  // 4) animated style only for scale (zoom)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 5) Pan gesture → rotation + decay
  const panGesture = Gesture.Pan()
  .onBegin(() => {
          // remember where we started dragging
          startLon.value = rotLon.value;
          startLat.value = rotLat.value;
        })
    .onUpdate(e => {
      // map gesture delta to absolute rotation
      rotLon.value = startLon.value + e.translationX * 0.2;
      rotLat.value = startLat.value - e.translationY * 0.2;   
    })
    .onEnd(e => {
      rotLon.value = withDecay({ velocity: e.velocityX * 0.2, deceleration: 0.99 });
      rotLat.value = withDecay({ velocity: -e.velocityY * 0.2, deceleration: 0.99 });
    });

  // 6) Pinch gesture → zoom + decay
  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      scale.value *= e.scale;
    })
    .onEnd(e => {
      scale.value = withDecay({ velocity: e.velocity, deceleration: 0.99 });
    });

  // 7) Allow pan *or* pinch
  const gesture = Gesture.Race(panGesture, pinchGesture);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 200 200">
          {/* Ocean */}
          <Circle cx={100} cy={100} r={80} fill="#a3d5f7" stroke="#45632e" />

          {/* Landmasses */}
          <G>
            {(landFeatures as any).features.map((feat: any, i: number) => (
              <Path
                key={i}
                d={PATH(feat)!}
                fill="#8bc34a"
                stroke="#45632e"
                strokeWidth={0.3}
              />
            ))}
          </G>
        </Svg>

        {/* Hit‐areas for your harmony keys */}
        {Object.values(RegionMap).map(region => {
          const hitStyles = (styles as Record<string, ViewStyle>)[`hit_${region.key}`];
          return (
            <RegionHitArea
              key={region.key}
              region={region}
              onPress={onRegionPress}
              style={hitStyles}
            />
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // dummy hit area for 'dreamSky'; add more for each region
  hit_dreamSky: { top: 120, left: 140, width: 60, height: 60 },
});

export default GlobeRenderer;
