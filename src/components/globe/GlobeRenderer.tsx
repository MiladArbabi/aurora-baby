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

const ICON_SIZE = 20;

const GlobeRenderer2D: React.FC<Globe2DProps> = ({
  regions,
  onRegionPress,
  initialRotation=[0,0],
  initialScale=1,
  autoRotateSpeed=2,
  viewBoxSize
}) => {
  const [tick, setTick] = useState(0);
  const [lastLon, setLastLon] = useState(initialRotation[0]);
  const [lastLat, setLastLat] = useState(initialRotation[1]);
  const [dragging, setDragging] = useState(false);

  const rotLon = useSharedValue(initialRotation[0]);
  const rotLat = useSharedValue(initialRotation[1]);
  const scale  = useSharedValue(initialScale);
  const startLon = useSharedValue(initialRotation[0]);
  const startLat = useSharedValue(initialRotation[1]);

  function makeProjection(viewBoxSize: number, clipAngleDeg = 90) {
    return geoOrthographic()
      .scale(viewBoxSize * 0.4)
      .translate([viewBoxSize/2, viewBoxSize/2])
      .clipAngle(clipAngleDeg);
  }

  // in your component:
  const PROJECTION = useMemo(
    () => makeProjection(viewBoxSize, /* pass clipAngleDeg here */ 90),
    [viewBoxSize]
  );
  
  const PATH = useMemo(() => geoPath().projection(PROJECTION as any), [PROJECTION]);

  // initialize
  useEffect(() => {
    PROJECTION.rotate(initialRotation);
    setTick(t => t+1);
  }, [PROJECTION, initialRotation]);

  // sync D3 projection on rotation change
  const rotateJS = useCallback((lon: number, lat: number) => {
    PROJECTION.rotate([lon, lat]);
    setLastLon(lon);
    setLastLat(lat);          // ← new!
    setTick(t => t + 1);
  }, [PROJECTION]);

  useAnimatedReaction(
    () => [rotLon.value, rotLat.value],
    ([lon, lat]) => runOnJS(rotateJS)(lon, lat)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  // auto-rotate
  useEffect(() => {
    if (!dragging) {
      const id = setInterval(
        () => rotLon.value += autoRotateSpeed/10,
        100
      );
      return () => clearInterval(id);
    }
  }, [dragging, rotLon, autoRotateSpeed]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          {/* Ocean */}
          <Circle
            cx={viewBoxSize/2}
            cy={viewBoxSize/2}
            r={viewBoxSize*0.4}
            fill="#a3d5f7"
            stroke="#45632e"
          />

          {/* Land */}
          <G>
            {landFeatures.features.map((feat:any,i:number)=>(
              <Path
                key={i}
                d={PATH(feat)!}
                fill="#8bc34a"
                stroke="#45632e"
                strokeWidth={0.3}
              />
            ))}
          </G>

          {/* ——— SVG-native Pins ——— */}
          <G>
            {regions.map(region => {
              // use the *exact* projection.clipAngle() for perfect sync:
              const base = (PROJECTION as any).clipAngle();
              const clip = base + (region.clipAngleAdjust || 0);
              if (!isFrontHemisphere(region.center, [lastLon, lastLat], clip)) {
                return null;
              }

              // 3) now project and draw
              const [x,y] = PROJECTION(region.center) as [number,number];
              return (
                <G
                  key={region.key}
                  transform={`translate(${x},${y})`}
                  onPress={() => onRegionPress(region.key)}
                  hitSlop={{ top:10, bottom:10, left:10, right:10 }}
                >
                  <Circle
                    r={ICON_SIZE * 0.4}
                    fill={region.baseColor}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                </G>
              );
            })}
          </G>
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { flex:1 },
  toolTip: {
    fontSize:6,
    color:"#333",
  }
});

export default GlobeRenderer2D;
