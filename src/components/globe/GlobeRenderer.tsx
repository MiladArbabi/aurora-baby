// …imports…
import React from 'react';
import { StyleSheet } from 'react-native';
import Svg from 'react-native-svg';
import Animated, {
  withDecay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Globe2DProps } from '../../types/globe';
import { useGlobe }    from '../../hooks/useGlobe';
import { OceanCircle } from './OceanCircle';
import { LandLayer }   from './LandLayer';
import { PinsLayer }   from './PinsLayer';

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
    animatedStyle,
  } = useGlobe(props);

  // We'll keep our little snapshot context in a closure instead of
  // via Gesture<> generics, so we don't fight the TS defs.
  let ctxLon0 = 0;
  let ctxLat0 = 0;

  const pan = Gesture.Pan()
    .minDistance(10)
    .activeOffsetY([-10, 10])
    .onBegin(() => {
      startLon.value = rotLon.value;
      startLat.value = rotLat.value
      runOnJS(setDragging)(true);
    })
    .onUpdate(e => {
      // e.translationX/Y are correctly typed here
      rotLon.value = startLon.value + e.translationX * 0.3;
      rotLat.value = startLat.value - e.translationY * 0.3;
    })
    .onEnd(e => {
      runOnJS(setDragging)(false);
      rotLon.value = withDecay({
        velocity: e.velocityX * 0.3,
        deceleration: 0.995,
      });
      rotLon.value = withSpring(
        Math.round(rotLon.value / 30) * 30,
        { stiffness: 60, damping: 10 }
      );
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => runOnJS(setDragging)(true))
    .onUpdate(e => {
      scale.value *= e.scale;
    })
    .onEnd(() => {
      runOnJS(setDragging)(false);
      scale.value = withDecay({ velocity: scale.value, deceleration: 0.99 });
    });

  const gesture = Gesture.Race(pan, pinch);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg
          viewBox={`0 0 ${props.viewBoxSize} ${props.viewBoxSize}`}
          width="100%"
          height="100%"
        >
          <OceanCircle size={props.viewBoxSize} />
          <LandLayer   pathGen={pathGen} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
});
