// …imports…
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withDecay,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { geoOrthographic, geoPath, geoDistance } from 'd3-geo';
import { landFeatures } from '../../data/world-110m';
import { Globe2DProps } from '../../types/globe';
import { isFrontHemisphere } from '../../utils/globeUtils'
import  { useGlobe }  from '../../hooks/useGlobe';
import { OceanCircle } from './OceanCircle';
import { LandLayer }  from './LandLayer';
import { PinsLayer }  from './PinsLayer';

const GlobeRenderer2D: React.FC<Globe2DProps> = props => {
  const {
    projection,
    pathGen,
    rotation,
    rotLon,
    rotLat,
    scale,
    startLon,
    startLat,
    dragging,
    setDragging,
    animatedStyle
  } = useGlobe(props);

  // pan/pinch…
  const pan = Gesture.Pan()
  .onBegin(() => {
    runOnJS(setDragging)(true);
    startLon.value = rotLon.value;
    startLat.value = rotLat.value;
  })
  .onUpdate(e => {
    rotLon.value = startLon.value + e.translationX * 0.2;
    rotLat.value = startLat.value - e.translationY * 0.2;
  })
  .onEnd(e => {
    runOnJS(setDragging)(false);
    rotLon.value = withDecay({ velocity: e.velocityX * 0.2, deceleration: 0.99 });
    rotLat.value = withDecay({ velocity: -e.velocityY * 0.2, deceleration: 0.99 });
  });

const pinch = Gesture.Pinch()
  .onBegin(() => {
    runOnJS(setDragging)(true);
    // optionally: capture scale → startScale.value = scale.value;
  })
  .onUpdate(e => {
    scale.value *= e.scale;
  })
  .onEnd(e => {
    runOnJS(setDragging)(false);
    scale.value = withDecay({ velocity: e.velocity, deceleration: 0.99 });
  });

  const gesture = Gesture.Race(pan, pinch);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg viewBox={`0 0 ${props.viewBoxSize} ${props.viewBoxSize}`} width="100%" height="100%">
          <OceanCircle size={props.viewBoxSize}/>
          <LandLayer pathGen={pathGen}/>
          <PinsLayer
            regions={props.regions}
            projection={projection}
            rotation={rotation}
            onRegionPress={props.onRegionPress}
          />
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
};

export default GlobeRenderer2D;

const styles = StyleSheet.create({ container: { flex: 1 } });
