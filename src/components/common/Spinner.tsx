// src/components/common/Spinner.tsx
import React from 'react';
import { Animated, Easing } from 'react-native';
import styled from 'styled-components/native';
import SpinnerIcon from '../../assets/icons/common/SpinnerIcon';

const SpinnerWrapper = styled.View`
  justify-content: center;
  align-items: center;
`;

const Spinner: React.FC<{ size?: number }> = ({ size }) => {
  const rotate = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotate]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SpinnerWrapper>
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ rotate: rotateInterpolate }],
        }}
      >
        <SpinnerIcon width={size} height={size} />
      </Animated.View>
    </SpinnerWrapper>
  );
};

export default Spinner;
