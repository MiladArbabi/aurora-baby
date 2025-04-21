//src/components/common/BottomNav.tsx
import React from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
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

const NAV_W = 373;
const NAV_H = 98;

const Container = styled.View`
  width: ${NAV_W}px;
  height: ${NAV_H}px;
  background-color: ${(props: { theme: DefaultTheme }) => props.theme.colors.primary};
  border-top-left-radius: 50px;
  border-top-right-radius: 50px;
  border-top-wodth: 1px;
  border-top-color: ${(props: { theme: DefaultTheme }) => props.theme.colors.border};
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

type BottomNavProps = {
  navigation: any;
  activeScreen: 'Home' | 'Harmony' | 'Care' | 'Wonder';
};

const BottomNav: React.FC<BottomNavProps> = ({ navigation, activeScreen }) => {  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const navHeight = screenHeight * 0.10;     // e.g. 10% of device height
  const buttonWidth = screenWidth * 0.20;

  const activeColor = theme.colors.secondaryBackground;
  const inactiveColor = theme.colors.background;

  return (
    <Wrapper>
      <Container style={{ width: screenWidth, height: navHeight }}>
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
    </Wrapper>
  );
};

export default BottomNav;