// src/components/globe/GlobeRenderer.tsx
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withDecay,
  runOnJS,
} from 'react-native-reanimated';
import { landFeatures } from '../../data/world-110m';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { geoOrthographic, geoPath } from 'd3-geo';
import { Globe2DProps } from '../../types/globe';

//Icon Size
const ICON_SIZE = 20;

// Projection & path generator factory
function makeProjection(viewBoxSize: number) {
  return geoOrthographic()
    .scale(viewBoxSize * 0.4)
    .translate([viewBoxSize / 2, viewBoxSize / 2])
    .clipAngle(90);
}

const GlobeRenderer2D: React.FC<Globe2DProps> = ({
  regions,
  onRegionPress,
  initialRotation = [0, 0],
  initialScale = 1,
  autoRotateSpeed = 2, // degrees per second
  viewBoxSize,
}) => {
  const [tick, setTick] = useState(0);
  const [lastLon, setLastLon] = useState(initialRotation[0]);
  const [dragging, setDragging] = useState(false);

  const rotLon = useSharedValue(initialRotation[0]);
  const rotLat = useSharedValue(initialRotation[1]);
  const scale = useSharedValue(initialScale);
  const startLon = useSharedValue(initialRotation[0]);
  const startLat = useSharedValue(initialRotation[1]);

  //Memoize projection & path so they survive re-renders
  const PROJECTION = useMemo(() => makeProjection(viewBoxSize), [viewBoxSize]);
  const PATH       = useMemo(() => geoPath().projection(PROJECTION as any), [PROJECTION]);

  // On mount, rotate to your initialRotation
  useEffect(() => {
    PROJECTION.rotate(initialRotation);
    // force one render so that first frame shows correctly
    setTick(t => t + 1);
  }, [PROJECTION, initialRotation]);

  // sync projection
  const rotateJS = useCallback((lon: number, lat: number) => {
    PROJECTION.rotate([lon, lat]);
    setLastLon(lon);
    setTick(t => t + 1);
  }, [PROJECTION]);

  useAnimatedReaction(
    () => [rotLon.value, rotLat.value],
    ([lon, lat]) => runOnJS(rotateJS)(lon, lat)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // gestures
  const pan = Gesture.Pan()
    .onBegin(() => runOnJS(setDragging)(true))
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
    .onBegin(() => runOnJS(setDragging)(true))
    .onUpdate(e => (scale.value *= e.scale))
    .onEnd(e => {
      runOnJS(setDragging)(false);
      scale.value = withDecay({ velocity: e.velocity, deceleration: 0.99 });
    });

  const gesture = Gesture.Race(pan, pinch);

  // idle rotation
  useEffect(() => {
    if (!dragging) {
      const interval = setInterval(
        () => (rotLon.value += autoRotateSpeed / 10),
        100
      );
      return () => clearInterval(interval);
    }
  }, [dragging, rotLon, autoRotateSpeed]);
  
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>        
        <Svg width="100%" height="100%" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>          
          <Circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={viewBoxSize * 0.4}
            fill="#a3d5f7"
            stroke="#45632e"
          />
          <G>
            {landFeatures.features.map((feat: any, idx: number) => (
              <Path
                key={idx}
                d={PATH(feat) as string}
                fill="#8bc34a"
                stroke="#45632e"
                strokeWidth={0.3}
              />
            ))}
          </G>
        </Svg>

        {regions.map(region => {
          const [x, y] = PROJECTION(region.center) as [number, number];
          // skip back hemisphere
          const diff = ((region.center[0] - lastLon + 180) % 360) - 180;
          if (Math.abs(diff) > 90) return null;

          const IconComponent = region.icon; 
          const left = (x / viewBoxSize) * 100;
          const top = (y / viewBoxSize) * 100;
          const size = (ICON_SIZE / viewBoxSize) * 100;

          return (
            <TouchableOpacity
              key={region.key}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}%`,
                height: `${size}%`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => onRegionPress(region.key)}
            >
              <IconComponent
              fill={region.baseColor} 
              width="70%" 
              height="70%" 
              />               
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default GlobeRenderer2D;
