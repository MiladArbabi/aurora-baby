// src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { onAuthStateChanged, auth, checkAuthState } from '../services/firebase'
import { User } from 'firebase/auth'
import { initRemoteConfig } from '../services/RemoteConfigService';

import LoadingSpinner from '../components/common/Spinner'
import AuthScreen from '../screens/auth/AuthScreen'
import OnboardingNavigator from './OnboardingNavigator'
import HomeScreen from '../screens/home/HomeScreen'
import { StaticGlobeScreen } from '../screens/harmony/StaticGlobeScreen'
import CareScreen from '../screens/care/CareScreen'
import PastLogsView from '../screens/care/PastLogsView'
import InsightsScreen from '../screens/care/InsightsView'
import { WonderScreen } from '../screens/wonder/WonderScreen'
import ProfileSettingScreen from '../screens/ProfileSettingScreen'
import WhisprScreen from '../screens/whispr/WhisprScreen'

import LogDetailScreen from '../screens/care/LogDetailScreen'
import PlayStoryScreen from '../screens/harmony/PlayStoryScreen'
import CreateStoryScreen from '../screens/harmony/CreateStoryScreen'
import TextStoryScreen from '../screens/harmony/TextStoryScreen'
import VoiceStorytellingScreen from '../screens/harmony/VoiceStorytellingScreen';
import AnimatedStoryScreen from '../screens/harmony/AnimatedStoryScreen';

import { getChildProfile } from '../services/ChildProfileAccess'
import { ChildProfile } from '../models/ChildProfile'

export type RootStackParamList = {
  Auth: undefined
  Home: undefined
  Harmony: undefined
  StoryWorld: { regionKey: string } 
  StoryPlayer: { storyId: string }
  StoryViewer: { storyId: string; mode: 'soothing' | 'choice' | 'daily' }
  Care: undefined
  PastLogs: undefined
  Insights: undefined
  Wonder: undefined
  ProfileSettings: undefined
  ForestMap: undefined
  Whispr: undefined
  LogDetail: { id: string; type: 'sleep'|'feeding'|'diaper'|'mood'|'health'|'note' }
  PlayStory: { 
    storyId: string; 
    title?:    string;
    fullStory?: string;
    fromPreview?: boolean; 
   }
  CreateStory: undefined;
  TextStory: { storyId: string; fullStory?: string };
  VoiceStorytelling: { storyId: string; fullStory: string; title: string };
  AnimatedStory: { storyId: string; animationAsset: any; fullStory: string };
}

const Stack = createStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ChildProfile | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initRemoteConfig();
  }, []);

  // 1) Initialize auth
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const persisted = await checkAuthState()
      if (mounted) {
        setUser(persisted)
        setLoading(false)
      }
    })()
    const unsub = onAuthStateChanged(auth, u => {
      if (mounted) setUser(u)
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  // 2) Load child profile once we know the user
  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      const stored = await getChildProfile() // returns ChildProfile | null
      if (mounted) setProfile(stored)
    })()
    return () => { mounted = false }
  }, [user])

  // 3) Show spinner while resolving auth/profile
  if (loading || (user !== null && profile === undefined)) {
    return <LoadingSpinner />
  }

  return (
    <NavigationContainer>
      {!user ? (
        // not signed in
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      ) : profile === null ? (
        // signed in but no profile → onboarding
        <OnboardingNavigator />
      ) : (
        // fully onboarded → main app
        <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName="Home"
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Harmony" component={StaticGlobeScreen} />
          <Stack.Screen name="Care" component={CareScreen} />
          <Stack.Screen name="PastLogs" component={PastLogsView} />
          <Stack.Screen name="Insights" component={InsightsScreen} />
          <Stack.Screen name="Wonder" component={WonderScreen} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingScreen} />
          <Stack.Screen name="Whispr" component={WhisprScreen} />
          <Stack.Screen name="LogDetail" component={LogDetailScreen} />
          <Stack.Screen name="PlayStory" component={PlayStoryScreen} />
          <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
          <Stack.Screen name="TextStory" component={TextStoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VoiceStorytelling" component={VoiceStorytellingScreen} options={{ headerShown: false, title: 'Listen' }} />
          <Stack.Screen name="AnimatedStory" component={AnimatedStoryScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}
