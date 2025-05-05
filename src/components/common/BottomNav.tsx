// src/components/common/BottomNav.tsx
import React from 'react';
import { useWindowDimensions, Text } from 'react-native';
import styled, { DefaultTheme, useTheme } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import HomeIcon from '../../assets/bottomnavicons/HomeIcon';
import HarmonyIcon from '../../assets/bottomnavicons/HarmonyIcon';
import CareIcon from '../../assets/bottomnavicons/CareIcon';
import WonderIcon from '../../assets/bottomnavicons/WonderIcon';

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
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
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

const FloatingButton = styled.TouchableOpacity<FloatingButtonProps>`
  position: absolute;
  bottom: ${({ size }: FloatingButtonProps) => size * 0.7}px;
  width: ${({ size }: FloatingButtonProps) => size}px;
  height: ${({ size }: FloatingButtonProps) => size}px;
  border-radius: ${({ size }: FloatingButtonProps) => size / 2}px;
  background-color: ${({ bgColor }: FloatingButtonProps) => bgColor};
  justify-content: center;
  align-items: center;
  z-index: 10;

  /* iOS shadow */
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 6px;
  /* Android elevation */
  elevation: 8;
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

  const activeColor = theme.colors.secondaryBackground;
  const inactiveColor = theme.colors.background;

  // pick your floating-button color here:
  const whisprBg = activeScreen === 'Whispr'
    ? activeColor
    : '#E6E1F4';  // gold when inactive

  return (
    <Wrapper>
      {/* the main nav */}
      <Container style={{ width: screenWidth }}>
        <NavButton testID="bottom-nav-home" onPress={() => navigation.navigate('Home')}>
          <HomeIcon fill={activeScreen === 'Home' ? activeColor : inactiveColor} />
        </NavButton>
        <NavButton testID="bottom-nav-harmony" onPress={() => navigation.navigate('Harmony')}>
          <HarmonyIcon fill={activeScreen === 'Harmony' ? activeColor : inactiveColor} />
        </NavButton>
        <NavButton testID="bottom-nav-care" onPress={() => navigation.navigate('Care')}>
          <CareIcon fill={activeScreen === 'Care' ? activeColor : inactiveColor} />
        </NavButton>
        <NavButton testID="bottom-nav-wonder" onPress={() => navigation.navigate('Wonder')}>
          <WonderIcon fill={activeScreen === 'Wonder' ? activeColor : inactiveColor} />
        </NavButton>
      </Container>

      {/* floating “Whispr” button on top */}
      <FloatingButton
        testID="bottom-nav-whispr"
        size={floatSize}
        bgColor={whisprBg}
        onPress={() => navigation.navigate('Whispr')}
      >
        <Text>Whispr</Text>
      </FloatingButton>
    </Wrapper>
  );
};

export default BottomNav;
