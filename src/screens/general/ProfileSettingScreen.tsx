import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import { getAuth, signOut } from 'firebase/auth';

import { getChildProfile } from '../../storage/ChildProfileStorage'
import { getParentProfile } from '../../storage/ParentProfileStorage'

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

const ProfileSettingScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('User Name');
  const [avatar, setAvatar] = useState(require('../assets/png/icons/avatar.png'));
  const [childName, setChildName] = useState('Child Name');
  const [childBirthdate, setChildBirthdate] = useState('YYYY-MM-DD');
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [parentName,    setParentName]    = useState('')


  useEffect(() => {
    ;(async () => {
      const p = await getParentProfile()   // implement this
      if (p) setParentName(p.name)

      const c = await getChildProfile()
      if (c) {
        setChildName(c.name)
        setChildBirthdate(c.dob)
      }
    })()
  }, [])

  const handleAvatarPress = () => {
    // Mock avatar change
    console.log('Change avatar');
  };

  return (
    <Container>     
      <Header marginTop={theme.spacing.xlarge} >Profile Settings</Header>
      <AvatarContainer onPress={handleAvatarPress}>
        <AvatarImage source={avatar} marginTop='25'/>
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
      <TouchableOpacity
        testID="signout-button"
        onPress={async () => {
          try {
            await signOut(getAuth());
            navigation.navigate('Auth');
          } catch (error) {
            console.error('Sign-out failed', error);
          }
        }}
        style={{
          marginTop: theme.spacing.xlarge,
          marginBottom: theme.spacing.xlarge,
          backgroundColor: theme.colors.primary,
          padding: theme.spacing.medium,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.colors.background, fontSize: 16 }}>Sign Out</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="profile-back-button" onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 18, color: theme.colors.text }}>← Back</Text>
      </TouchableOpacity> 
    </Container>
  );
};

export default ProfileSettingScreen;