// src/navigation/OnboardingNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack'
import WelcomeScreen from '../screens/onboarding/WelcomeScreen'
import ChildProfileScreen from '../screens/onboarding/ChildProfileScreen'
import ParentInfoScreen from 'screens/onboarding/ParentInfoScreen'
import OnboardingFinished from '../screens/onboarding/OnboardingFinished'
import ThemePreferencesScreen from 'screens/onboarding/ThemePreferencesScreen'

// <— The param list that drives type-safety for this flow:
export type OnboardingParamList = {
    Welcome: undefined
    Parent: undefined
    Child: undefined
    Themes: undefined
    Done: undefined
  }

const Onboarding = createStackNavigator<OnboardingParamList>()
export default function OnboardingNavigator() {
  return (
    <Onboarding.Navigator screenOptions={{ headerShown: false }}>
      <Onboarding.Screen name="Welcome" component={WelcomeScreen} />
      <Onboarding.Screen name="Parent"  component={ParentInfoScreen} />
      <Onboarding.Screen name="Child" component={ChildProfileScreen} />
      <Onboarding.Screen name="Themes" component={ThemePreferencesScreen} />
      <Onboarding.Screen name="Done" component={OnboardingFinished} />
    </Onboarding.Navigator>
  )
}
