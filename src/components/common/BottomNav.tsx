import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';

const BottomNavWrapper = styled.View`
  position: absolute;
  bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xlarge}px; /* ~32px */
  width: 100%;
  align-items: center;
`;

const BottomNavContainer = styled.View`
  height: 50px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px 15px;
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xlarge}px; /* ~32px */
  border-radius: 50px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
`;

const NavIcon = styled.TouchableOpacity``;

type BottomNavProps = {
  navigation: StackNavigationProp<RootStackParamList>;
  activeScreen: keyof RootStackParamList;
};

const BottomNav: React.FC<BottomNavProps> = ({ navigation, activeScreen }) => {
  const theme = useTheme();
  const iconSize = 48; // Standard touch target size

  return (
    <BottomNavWrapper>
      <BottomNavContainer>
        <NavIcon
          testID="bottom-nav-home"
          onPress={() => navigation.navigate('Home')}
        >
          <Image
            source={require('../../assets/png/bottomnav/homeicon.png')}
            style={{
              width: iconSize,
              height: iconSize,
              tintColor: activeScreen === 'Home' ? theme.colors.secondaryBackground : theme.colors.background,
            }}
          />
        </NavIcon>
        <NavIcon
          testID="bottom-nav-harmony"
          onPress={() => navigation.navigate('Harmony')}
        >
          <Image
            source={require('../../assets/png/bottomnav/harmonyicon.png')}
            style={{
              width: iconSize,
              height: iconSize,
              tintColor: activeScreen === 'Harmony' ? theme.colors.secondaryBackground : theme.colors.background,
            }}
          />
        </NavIcon>
        <NavIcon
          testID="bottom-nav-care"
          onPress={() => navigation.navigate('Care')}
        >
          <Image
            source={require('../../assets/png/bottomnav/careicon.png')}
            style={{
              width: iconSize,
              height: iconSize,
              tintColor: activeScreen === 'Care' ? theme.colors.secondaryBackground : theme.colors.background,
            }}
          />
        </NavIcon>
        <NavIcon
          testID="bottom-nav-wonder"
          onPress={() => navigation.navigate('Wonder')}
        >
          <Image
            source={require('../../assets/png/bottomnav/wondericon.png')}
            style={{
              width: iconSize,
              height: iconSize,
              tintColor: activeScreen === 'Wonder' ? theme.colors.secondaryBackground : theme.colors.background,
            }}
          />
        </NavIcon>
      </BottomNavContainer>
    </BottomNavWrapper>
  );
};

export default BottomNav;