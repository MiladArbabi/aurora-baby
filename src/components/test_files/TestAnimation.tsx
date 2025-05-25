// src/components/test_files/TestAnimation.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

type Props = {
  type: 'bounce' | 'rotate' | 'pulse';
};

const { width } = Dimensions.get('window');

const TestAnimation: React.FC<Props> = ({ type }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (type === 'bounce') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.spring(anim, { toValue: -50, useNativeDriver: true }),
          Animated.spring(anim, { toValue: 0, useNativeDriver: true }),
        ])
      );
    } else if (type === 'rotate') {
      animation = Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
    } else {
      // pulse
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      );
    }
    animation.start();
    return () => animation.stop();
  }, [anim, type]);

  // map anim value to transforms
  const style =
    type === 'bounce'
      ? { transform: [{ translateY: anim }] }
      : type === 'rotate'
      ? {
          transform: [
            {
              rotate: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }
      : {
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
        };

  return (
    <View style={s.wrapper}>
      <Animated.View style={[s.shape, style]} />
    </View>
  );
};

const s = StyleSheet.create({
  wrapper: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shape: {
    width: 80,
    height: 80,
    backgroundColor: '#FFAB91',
    borderRadius: 12,
  },
});

export default TestAnimation;
