// src/hooks/useGlobe.ts
import { useEffect, useMemo, useCallback, useState } from 'react';
import { geoOrthographic, geoPath } from 'd3-geo';
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  runOnJS,
  withDecay,
} from 'react-native-reanimated';
import type { Globe2DProps } from '../types/globe';

export function useGlobe({
  viewBoxSize,
  initialRotation = [0, 0],
  initialScale = 1,
  autoRotateSpeed = 0,
}: Pick<Globe2DProps, 'viewBoxSize' | 'initialRotation' | 'initialScale' | 'autoRotateSpeed'>) {
  // React state & setters
  const [tick, setTick] = useState(0);
  const [rotation, setRotation] = useState<[number, number]>(initialRotation);
  const [dragging, setDragging] = useState(false);

  // shared values
  const rotLon = useSharedValue(initialRotation[0]);
  const rotLat = useSharedValue(initialRotation[1]);
  const scale  = useSharedValue(initialScale);
  const startLon = useSharedValue(initialRotation[0]);
  const startLat = useSharedValue(initialRotation[1]);

  const TILT_DEG = 20; 
  
  // build projection + path
  const projection = useMemo(
    () => geoOrthographic()
          .scale(viewBoxSize * 0.4)
          .translate([viewBoxSize / 2, viewBoxSize / 2])
          .clipAngle(90)
          .rotate(initialRotation),
    [viewBoxSize, initialRotation]
  );
  const pathGen = useMemo(() => geoPath().projection(projection as any), [projection]);

  // push shared values → state + projection
  const rotateJS = useCallback((lon: number, lat: number) => {
    projection.rotate([lon, lat]);
    setRotation([lon, lat]);
    setTick(t => t + 1);
  }, [projection]);
  useAnimatedReaction(
    () => [rotLon.value, rotLat.value],
    ([lon, lat]) => runOnJS(rotateJS)(lon, lat)
  );

  // auto-rotate if requested
  useEffect(() => {
    if (!dragging && autoRotateSpeed > 0) {
      const handle = setInterval(() => {
        // bump longitude by (deg/sec) / (frames/sec)
        rotLon.value += autoRotateSpeed / 60;
      }, 1000 / 60); // 60fps
      return () => clearInterval(handle);
    }
  }, [autoRotateSpeed, dragging, rotLon]);

  // a dummy animatedStyle for zoom. You can expand this if you want pinch-to-zoom.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: dragging ? 0.97 : scale.value },
      // you could also tilt it slightly on the x-axis:
      { rotateX: `${rotLat.value / 4}deg` }
    ]
  }));

  return {
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
  };
}
