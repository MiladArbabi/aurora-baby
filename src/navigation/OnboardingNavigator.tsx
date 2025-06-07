// ── OnboardingNavigator.tsx ──
import { createStackNavigator } from '@react-navigation/stack'
import WelcomeScreen from '../screens/onboarding/WelcomeScreen'
import ParentInfoScreen from '../screens/onboarding/ParentInfoScreen'
import BabyProfileScreen from '../screens/onboarding/BabyProfileScreen'
import ThemePreferencesScreen from '../screens/onboarding/ThemePreferencesScreen'
import OnboardingFinished from '../screens/onboarding/OnboardingFinished'

export type OnboardingParamList = {
  Welcome: undefined
  Parent: undefined
  Baby: undefined
  Themes: undefined
  Done: undefined
}

const Onboarding = createStackNavigator<OnboardingParamList>()

export default function OnboardingNavigator() {
  return (
    <Onboarding.Navigator screenOptions={{ headerShown: false }}>
      <Onboarding.Screen name="Welcome" component={WelcomeScreen} />
      <Onboarding.Screen name="Parent" component={ParentInfoScreen} />
      <Onboarding.Screen name="Baby" component={BabyProfileScreen} />
      <Onboarding.Screen name="Themes" component={ThemePreferencesScreen} />
      <Onboarding.Screen name="Done" component={OnboardingFinished} />
    </Onboarding.Navigator>
  )
}
