//src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged, auth, checkAuthState } from '../services/firebase';
import { User } from 'firebase/auth';

import HomeScreen from '../screens/HomeScreen';
import HarmonyHomeScreen from '../screens/HarmonyHomeScreen';
import StoryPlayer from '../screens/StoryPlayer';
import CareScreen from '../screens/CareScreen';
import WonderScreen from '../screens/WonderScreen';
import AuthScreen from '../screens/AuthScreen';
import ProfileSettingScreen from '../screens/ProfileSettingScreen';
import LoadingSpinner from '../components/common/LoadingSpinner';
import WhisprScreen from '../screens/WhisprScreen';
import LogDetailScreen from '../screens/LogDetailScreen'
import PastLogsView from '../screens/PastLogsView';
import InsightsScreen from '../screens/InsightsView';

import { QuickLogType } from '../models/QuickLogSchema';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Harmony: undefined;
  StoryPlayer: { storyId: string };
  StoryViewer: { storyId: string; mode: 'soothing' | 'choice' | 'daily' }; // Updated mode
  Care: undefined;
  PastLogs: undefined;
  Insights: undefined;
  Wonder: undefined;
  ProfileSettings: undefined;
  ForestMap: undefined;
  Whispr: undefined;
  LogDetail:   { id: string; type: 'sleep' | 'feeding' | 'diaper' | 'mood' | 'health' | 'note' }
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const persistedUser = await checkAuthState();
      setUser(persistedUser);
      setLoading(false);
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Harmony" component={HarmonyHomeScreen} />
            <Stack.Screen name="StoryPlayer" component={StoryPlayer} />
            <Stack.Screen name="Care" component={CareScreen} />
            <Stack.Screen name="PastLogs" component={PastLogsView} options={{ headerShown: false }} />
            <Stack.Screen name="Insights" component={InsightsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Wonder" component={WonderScreen} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettingScreen} />
            <Stack.Screen name="Whispr" component={WhisprScreen} />
            <Stack.Screen
              name="LogDetail"
              component={LogDetailScreen}
              options={{ title: 'Log Details' }}
             />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};