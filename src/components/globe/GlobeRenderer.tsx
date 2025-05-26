import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { PanGestureHandler, PinchGestureHandler } from 'react-native-gesture-handler';
import type {
  PanGestureHandlerGestureEvent,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { RegionMap } from '../../data/RegionMapSchema';
import { useRegionState } from '../../context/RegionContext';
import { RegionHitArea } from './RegionHitArea';

interface Props {
  onRegionPress: (key: string) => void;
}

export const GlobeRenderer: React.FC<Props> = ({ onRegionPress }) => {
  const regionState = useRegionState();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scaleValue.value },
    ],
  }));

  const onPanGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY } = event.nativeEvent;
    translateX.value = translationX;
    translateY.value = translationY;
  };

  const onPinchGestureEvent = (event: PinchGestureHandlerGestureEvent) => {
    scaleValue.value = event.nativeEvent.scale;
  };

  return (
    <PanGestureHandler onGestureEvent={onPanGestureEvent}>
      <Animated.View testID="pan-view" style={[styles.container, animatedStyle]}>
    <PinchGestureHandler onGestureEvent={onPinchGestureEvent}>
        <Animated.View testID="pinch-view" style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%" viewBox="0 0 200 200">
              <Circle cx="100" cy="100" r="80" fill="#E0F7FA" />
            </Svg>
            {Object.values(RegionMap).map(region => {
              const hitStyles = (styles as Record<string, ViewStyle>)[
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
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Temporary dummy hit-area for 'dreamSky'
  hit_dreamSky: { top: 120, left: 140, width: 60, height: 60 },
});

export default GlobeRenderer;
