// src/components/common/BottomNav.tsx
import React, { useRef, useEffect } from 'react';
import { useWindowDimensions, Text, Animated } from 'react-native';
import styled, { DefaultTheme, useTheme } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import HomeIcon from '../../assets/bottomnavicons/HomeIcon';
import HarmonyIcon from '../../assets/bottomnavicons/HarmonyIcon';
import CareIcon from '../../assets/bottomnavicons/CareIcon';
import WonderIcon from '../../assets/bottomnavicons/WonderIcon';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const Wrapper = styled.View`
  position: absolute;
  bottom: 0;
  width: 100%;
  align-items: center;
`;

const NAV_H = 98;

const Container = styled.View`
  width: 100%;
  height: ${NAV_H}px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.navBackground};
  border-top-left-radius: 50px;
  border-top-right-radius: 50px;
  border-top-width: 1px;
  border-top-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  align-items: center;
  justify-content: space-around;
  flex-direction: row;
`;

const NavButton = styled.TouchableOpacity`
  width: 53px;
  height: 72px;
  align-items: center;
  justify-content: center;
`;

interface FloatingButtonProps {
  size: number;
  bgColor: string;
}

// container for our stroked circle gradient
const FloatingButton = styled.TouchableOpacity<FloatingButtonProps>`
  position: absolute;
  bottom: ${({ size }: FloatingButtonProps) => `${size * 0.9}px`};
  width: ${({ size }: FloatingButtonProps) => `${size}px`};
  height: ${({ size }: FloatingButtonProps) => `${size}px`};
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

type BottomNavProps = {
  navigation: StackNavigationProp<RootStackParamList>;
  activeScreen: 'Home' | 'Harmony' | 'Care' | 'Wonder' | 'Whispr' ;
};

const BottomNav: React.FC<BottomNavProps> = ({ navigation, activeScreen }) => {
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const navHeight = screenHeight * 0.10; // 10% of height
  const floatSize = navHeight * 1;     // tweak as needed

  // we’ll bump the active icon to 1.2× scale:
  const scaleValues = {
    Home:    useRef(new Animated.Value(activeScreen === 'Home'    ? 1.2 : 1)).current,
    Harmony: useRef(new Animated.Value(activeScreen === 'Harmony' ? 1.2 : 1)).current,
    Care:    useRef(new Animated.Value(activeScreen === 'Care'    ? 1.2 : 1)).current,
    Wonder:  useRef(new Animated.Value(activeScreen === 'Wonder'  ? 1.2 : 1)).current,
  };

  useEffect(() => {
    // whenever activeScreen changes, spring‐animate each tab
    (['Home','Harmony','Care','Wonder'] as const).forEach(screen => {
      Animated.spring(scaleValues[screen], {
        toValue: activeScreen === screen ? 1.2 : 1,
        useNativeDriver: true,
      }).start();
    });
  }, [activeScreen]);

  const activeColor = theme.colors.iconActive;
  const inactiveColor = theme.colors.iconInactive;

  // pick your floating-button color here:
  const whisprBg = activeScreen === 'Whispr'
    ? activeColor
    : '#E6E1F4';  // gold when inactive

  return (
    <Wrapper>
      {/* the main nav */}
      <Container style={{ width: screenWidth }}>
        <NavButton testID="bottom-nav-home" onPress={() => navigation.navigate('Home')}>
          <Animated.View style={{ transform: [{ scale: scaleValues.Home }] }}>
            <HomeIcon fill={activeScreen === 'Home' ? activeColor : inactiveColor} />
          </Animated.View>
        </NavButton>
        <NavButton testID="bottom-nav-harmony" onPress={() => navigation.navigate('Harmony')}>
          <Animated.View style={{ transform: [{ scale: scaleValues.Harmony }] }}>
            <HarmonyIcon fill={activeScreen === 'Harmony' ? activeColor : inactiveColor} />
          </Animated.View>
        </NavButton>
        <NavButton testID="bottom-nav-care" onPress={() => navigation.navigate('Care')}>
          <Animated.View style={{ transform: [{ scale: scaleValues.Care }] }}>
            <CareIcon fill={activeScreen === 'Care' ? activeColor : inactiveColor} />
          </Animated.View>
        </NavButton>
        <NavButton testID="bottom-nav-wonder" onPress={() => navigation.navigate('Wonder')}>
          <Animated.View style={{ transform: [{ scale: scaleValues.Wonder }] }}>
            <WonderIcon fill={activeScreen === 'Wonder' ? activeColor : inactiveColor} />
          </Animated.View>
        </NavButton>
      </Container>

      {/* floating “Whispr” button on top */}
      <FloatingButton
        testID="bottom-nav-whispr"
        size={floatSize}
        bgColor={whisprBg}
        onPress={() => navigation.navigate('Whispr')}
      >
        {/* use SVG + LinearGradient to draw just the circle stroke */}
        <Svg width={floatSize} height={floatSize}>
          <Defs>
            <LinearGradient id="auroraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#50E3C2" />
              <Stop offset="100%" stopColor="#9013FE" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={floatSize/2}
            cy={floatSize/2}
            r={floatSize/3}          // leave a bit of padding
            stroke="url(#auroraGrad)"
            strokeWidth={15}
            fill="transparent"
          />
        </Svg>
      </FloatingButton>
    </Wrapper>
  );
};

export default BottomNav;
