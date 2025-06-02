// src/screens/ProfileSettingScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Image, TouchableOpacity, Button } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'

import { getChildProfile } from '../../storage/ChildProfileStorage'
import { getParentProfile } from '../../storage/ParentProfileStorage'
import { PrivacySettings, getPrivacySettings, savePrivacySettings } from '../../services/PrivacySettingsStorage';

import BackButton from '../../assets/icons/common/BackButton';

const Container = styled.ScrollView`
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
  margin-vertical: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px 0  ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px 0;
  overflow: visible;
  
`;

const AvatarImage = styled.Image`
  width: 75px;
  height: 75px;
  border-radius: 10px;
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

const SwitchRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`;

const SwitchLabel = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
`;

const HeaderRow = styled.View`
   flex-direction: row;
   align-items: center;
   justify-content: space-between;
   margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
   overflow: visible;
 `;

const ProfileSettingScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('User Name');
  const [avatar, setAvatar] = useState(require('../../assets/png/icons/avatar.png'));
  const [childName, setChildName] = useState('Child Name');
  const [childBirthdate, setChildBirthdate] = useState('YYYY-MM-DD');
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [parentName,    setParentName]    = useState('')

  // privacy‐toggle states
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [shareWithPediatrician, setShareWithPediatrician] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(true);

  useEffect(() => {
    // Load existing parent/child info
    (async () => {
      const p = await getParentProfile();
      if (p) setName(p.name);

      const c = await getChildProfile();
      if (c) {
        setChildName(c.name);
        // Only keep “YYYY-MM-DD” (drop the “T00:00:00.000Z”)
        const justDate = c.dob.split('T')[0];
        setChildBirthdate(justDate);
      }

      // Load privacy settings
      const priv = await getPrivacySettings();
      setShareAnalytics(priv.shareAnalytics);
      setShareWithPediatrician(priv.shareWithPediatrician);
      setAllowNotifications(priv.allowNotifications);
    })();
  }, []);

  const handleAvatarPress = () => {
    // Mock avatar change
    console.log('Change avatar');
  };

  const handleReset = async () => {
    await AsyncStorage.removeItem('@child_profile')
    await AsyncStorage.removeItem('@parent_profile')
    // (Also clear lastScreen, etc.)
    await AsyncStorage.removeItem('@last_screen')

    // Now force‐restart the navigation tree by sending everyone to Auth (so they sign in again)
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      })
    )
  }

  const toggleShareAnalytics = async (val: boolean) => {
    setShareAnalytics(val);
    await savePrivacySettings({
      shareAnalytics: val,
      shareWithPediatrician,
      allowNotifications,
    });
    // If you have an analytics SDK, call something like:
    // Analytics.setEnabled(val);
  };

  const toggleShareWithPediatrician = async (val: boolean) => {
    setShareWithPediatrician(val);
    await savePrivacySettings({
      shareAnalytics,
      shareWithPediatrician: val,
      allowNotifications,
    });
  };

  const toggleAllowNotifications = async (val: boolean) => {
    setAllowNotifications(val);
    await savePrivacySettings({
      shareAnalytics,
      shareWithPediatrician,
      allowNotifications: val,
    });
    // e.g. register/unregister for push if needed
  };

  return (
    <Container>     
      <Header>Profile Settings</Header>

      <HeaderRow>
        <BackButton fill={''} onPress={() => navigation.goBack()} />
        <AvatarContainer onPress={handleAvatarPress}>
          <AvatarImage source={avatar} />
        </AvatarContainer>
      </HeaderRow>
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
      
      {/* PRIVACY SWITCHES */}
      <SwitchRow>
        <SwitchLabel>Share Anonymous Analytics</SwitchLabel>
        <Switch value={shareAnalytics} onValueChange={toggleShareAnalytics} />
      </SwitchRow>

      <SwitchRow>
        <SwitchLabel>Share Data with Pediatrician</SwitchLabel>
        <Switch value={shareWithPediatrician} onValueChange={toggleShareWithPediatrician} />
      </SwitchRow>

      <SwitchRow style={{ marginBottom: theme.spacing.large }}>
        <SwitchLabel>Allow Notifications</SwitchLabel>
        <Switch value={allowNotifications} onValueChange={toggleAllowNotifications} />
      </SwitchRow>
      
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
      <Button title="Reset Onboarding" onPress={handleReset} />
      {/* LINK TO “WHAT WE’VE COLLECTED” DASHBOARD */}
      <TouchableOpacity
        onPress={() => navigation.navigate('PrivacyDashboard')}
        style={{
          marginTop: theme.spacing.medium,
          marginBottom: theme.spacing.large,
          backgroundColor: theme.colors.secondaryBackground,
          padding: theme.spacing.medium,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.colors.background, fontSize: 16 }}>
          What We’ve Collected
        </Text>
      </TouchableOpacity>
      {/* LINK TO “ADJUST GAP THRESHOLDS” */}
     <TouchableOpacity
       onPress={() => navigation.navigate('GapSettings')}
       style={{
         marginTop: theme.spacing.medium,
         marginBottom: theme.spacing.medium,
         backgroundColor: theme.colors.secondaryBackground,
         padding: theme.spacing.medium,
         borderRadius: 8,
         alignItems: 'center',
       }}
     >
       <Text style={{ color: theme.colors.background, fontSize: 16 }}>
         Adjust Gap Thresholds
       </Text>
     </TouchableOpacity>
    </Container>
  );
};

export default ProfileSettingScreen;