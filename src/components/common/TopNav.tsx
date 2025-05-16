import React from 'react';
import { Image } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';

const TopNavContainer = styled.View`
  height: ${({ theme }: { theme: DefaultTheme }) => theme.sizes.topNavHeight}px;
  width: 100%;
  margin-top: 25px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const LogoContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Logo = styled.Image`
  width: 40px;
  height: 40px;
`;

const LogoText = styled.Text`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.sizes.body}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.secondaryBackground};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  margin-left: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
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
      <LogoContainer>
        <Logo source={require('../../assets/png/system/colorlogo.png')} testID="top-nav-logo" />
        <LogoText testID="top-nav-text">Aurora Baby</LogoText>
      </LogoContainer>
      <Avatar testID="top-nav-avatar" onPress={() => navigation.navigate('ProfileSettings')}>
        <Image source={require('../../assets/png/icons/avatar.png')} style={{ width: 40, height: 50 }} />
      </Avatar>
    </TopNavContainer>
  );
};

export default TopNav;