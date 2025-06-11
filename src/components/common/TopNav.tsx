// src/components/common/TopNav.tsx
import React from 'react';
import { Image } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import WhisprVoiceLogo from 'assets/whispr/WhisprVoiceLogo';
import BlackFilledLogo from 'assets/png/system/BlackFilledLogo';
import AvatarIcon from 'assets/png/icons/Avatar';

const TopNavContainer = styled.View`
  height: ${({ theme }: { theme: DefaultTheme }) => theme.sizes.topNavHeight}px;
  width: 100%;
  margin-top: 25px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const SideContainer = styled.View`
   width: 40px;
   align-items: center;
   justify-content: center;
 `;

 const CenterContainer = styled.View`
   flex: 1;
   align-items: center;
   justify-content: center;
 `;

 // Touchable wrapper for the Whispr icon
 const WhisprButton = styled.TouchableOpacity`
   width: 40px;
   height: 40px;
   align-items: center;
   justify-content: center;
 `;

const LogoContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Logo = styled.Image`
  width: 40px;
  height: 40px;
`;

const Avatar = styled.TouchableOpacity`
  width: 40px;
  height: 50px;
`;

type TopNavProps = {
  navigation: StackNavigationProp<RootStackParamList, any>;
};

const TopNav: React.FC<TopNavProps> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <TopNavContainer>
      {/* Left: Profile settings */}
      <SideContainer>
        <AvatarIcon
          testID="top-nav-avatar"
          onPress={() => navigation.navigate('ProfileSettings')}
        >
        </AvatarIcon>
      </SideContainer>

      {/* Center: Aurora logo (no text) */}
      <CenterContainer>
        <BlackFilledLogo
         
        >

        </BlackFilledLogo>
      </CenterContainer>

      {/* Right: Whispr voice button */}
      <SideContainer>
        <WhisprButton
          testID="top-nav-whispr"
          onPress={() => navigation.navigate('Whispr')}
        >
          <WhisprVoiceLogo
          fill='black'
            width={40}
            height={40}
            testID="whispr-voice-logo"
          />
        </WhisprButton>
      </SideContainer>
    </TopNavContainer>
  );
};

export default TopNav;