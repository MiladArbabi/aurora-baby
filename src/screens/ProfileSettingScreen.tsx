import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const Header = styled.Text`
  font-size: 24px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const FieldContainer = styled.View`
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`;

const Label = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
`;

const Input = styled.TextInput`
  border-width: 1px;
  border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: 5px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
  font-size: 16px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.muted};
`;

const AvatarContainer = styled.TouchableOpacity`
  align-items: center;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`;

const AvatarImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const ColorModeContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const ColorModeText = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
`;

const ColorModeSwitch = styled.View`
  flex-direction: row;
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
`;

const SwitchButton = styled.TouchableOpacity<{ active: boolean }>`
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
  background-color: ${({ active, theme }: { active: boolean; theme: DefaultTheme }) =>
    active ? theme.colors.secondaryBackground : theme.colors.muted};
  border-radius: 5px;
`;

const SwitchButtonText = styled.Text`
  font-size: 14px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

type ProfileSettingScreenProps = StackScreenProps<RootStackParamList, 'ProfileSettings'>;

const ProfileSettingScreen: React.FC<ProfileSettingScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('User Name');
  const [avatar, setAvatar] = useState(require('../assets/png/icons/avatar.png'));
  const [childName, setChildName] = useState('Child Name');
  const [childBirthdate, setChildBirthdate] = useState('YYYY-MM-DD');
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');

  const handleAvatarPress = () => {
    // Mock avatar change
    console.log('Change avatar');
  };

  return (
    <Container>
      <Header>Profile Settings</Header>
      <AvatarContainer onPress={handleAvatarPress}>
        <AvatarImage source={avatar} />
      </AvatarContainer>
      <FieldContainer>
        <Label>Name</Label>
        <Input value={name} onChangeText={setName} />
      </FieldContainer>
      <FieldContainer>
        <Label>Child's Name</Label>
        <Input value={childName} onChangeText={setChildName} />
      </FieldContainer>
      <FieldContainer>
        <Label>Child's Birthdate</Label>
        <Input value={childBirthdate} onChangeText={setChildBirthdate} />
      </FieldContainer>
      <ColorModeContainer>
        <ColorModeText>Color Mode</ColorModeText>
        <ColorModeSwitch>
          <SwitchButton active={colorMode === 'light'} onPress={() => setColorMode('light')}>
            <SwitchButtonText>Light</SwitchButtonText>
          </SwitchButton>
          <SwitchButton active={colorMode === 'dark'} onPress={() => setColorMode('dark')}>
            <SwitchButtonText>Dark</SwitchButtonText>
          </SwitchButton>
        </ColorModeSwitch>
      </ColorModeContainer>
    </Container>
  );
};

export default ProfileSettingScreen;