// src/navigation/AppNavigator.tsx

import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { auth, checkAuthState } from '../services/firebase'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { initRemoteConfig } from '../services/RemoteConfigService'

import LoadingSpinner from '../components/common/Spinner'
import AuthScreen from '../screens/auth/AuthScreen'
import OnboardingNavigator from './OnboardingNavigator'
import HomeScreen from '../screens/home/HomeScreen'
import { HarmonyStatScreen } from '../screens/harmony/HarmonyStatScreen'
import CareScreen from '../screens/care/CareScreen'
import PastLogsView from '../screens/care/PastLogsView'
import InsightsScreen from '../screens/care/InsightsView'
import { WonderScreen } from '../screens/wonder/WonderScreen'
import ProfileSettingScreen from '../screens/profile/ProfileSettingScreen'
import PrivacyDashboardScreen from '../screens/profile/PrivacyDashboardScreen'
import GapSettingsScreen from '../screens/profile/GapSettingsScreen'
import TTSSettingsScreen from 'screens/profile/TTSSettingsScreen'
import EndOfDayExportScreen from 'screens/care/EndOfDayExportScreen'
import WhisprScreen from '../screens/whispr/WhisprScreen'
import LogDetailScreen from '../screens/care/LogDetailScreen'
import PlayStoryScreen from '../screens/harmony/PlayStoryScreen'
import CreateStoryScreen from '../screens/harmony/CreateStoryScreen'
import TextStoryScreen from '../screens/harmony/TextStoryScreen'
import VoiceStorytellingScreen from '../screens/harmony/VoiceStorytellingScreen'
import AnimatedStoryScreen from '../screens/harmony/AnimatedStoryScreen'

import { getChildProfile } from '../services/ChildProfileAccess'
import { ChildProfile } from '../models/ChildProfile'

export type RootStackParamList = {
  Auth: undefined
  Onboarding: undefined
  Home: undefined
  Harmony: undefined
  Care: undefined
  PastLogs: undefined
  Insights: undefined
  Wonder: undefined
  ProfileSettings: undefined
  GapSettings: undefined
  PrivacyDashboard: undefined
  EndOfDayExport: undefined
  TTSSettings: undefined
  Whispr: undefined
  LogDetail: { id: string; type: string }
  PlayStory: { storyId: string; title?: string; fullStory?: string; fromPreview?: boolean }
  CreateStory: undefined
  TextStory: { storyId: string; fullStory?: string }
  VoiceStorytelling: { storyId: string; fullStory: string; title: string }
  AnimatedStory: { storyId: string; animationAsset: any; fullStory: string }
}

const Stack = createStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<ChildProfile | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  // 0) Initialize any remote config if you have it
  useEffect(() => {
    initRemoteConfig()
  }, [])

  // 1) Rehydrate auth
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const persisted = await checkAuthState() // returns FirebaseUser | null
      if (mounted) {
        setUser(persisted)
        setLoading(false)
      }
    })()
    const unsub = onAuthStateChanged(auth, (u) => mounted && setUser(u))
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  // 2) Load child profile once we know the user
  useEffect(() => {
    if (!user) {
      setProfile(undefined)
      return
    }
    let mounted = true
    ;(async () => {
      const stored = await getChildProfile() // ChildProfile | null
      if (mounted) {
        setProfile(stored)
      }
    })()
    return () => {
      mounted = false
    }
  }, [user])

   // 3) Show spinner until both user and profile are resolved
   if (loading || (user !== null && profile === undefined)) {
    return <LoadingSpinner />
  }

  return (
    <NavigationContainer>
      {!user ? (
        // ── A) NOT SIGNED IN: only Auth
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>

      ) : profile === null ? (
        // ── B) SIGNED IN but no child profile: run Onboarding flow
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        </Stack.Navigator>
      ) : (
        // ── C) SIGNED IN + child profile ≠ null: show main app 
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Care" component={CareScreen} />
          <Stack.Screen name="PastLogs" component={PastLogsView} />
          <Stack.Screen name="Insights" component={InsightsScreen} />
          <Stack.Screen name="Wonder" component={WonderScreen} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingScreen} />
          <Stack.Screen name="PrivacyDashboard" component={PrivacyDashboardScreen} />
          <Stack.Screen name="EndOfDayExport" component={EndOfDayExportScreen} />
          <Stack.Screen name="GapSettings" component={GapSettingsScreen}/>
          <Stack.Screen name="TTSSettings" component={TTSSettingsScreen}/>          
          <Stack.Screen name="Harmony" component={HarmonyStatScreen} />
          <Stack.Screen name="Whispr" component={WhisprScreen} />
          <Stack.Screen name="LogDetail" component={LogDetailScreen} />
          <Stack.Screen name="PlayStory" component={PlayStoryScreen} />
          <Stack.Screen name="CreateStory" component={CreateStoryScreen} />
          <Stack.Screen name="TextStory" component={TextStoryScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="VoiceStorytelling"
            component={VoiceStorytellingScreen}
            options={{ headerShown: false, title: 'Listen' }}
          />
          <Stack.Screen
            name="AnimatedStory"
            component={AnimatedStoryScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}
