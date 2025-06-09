// App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { syncPendingLogs } from './src/services/logService'; // adjust if path differs
import { rneThemeBase, theme } from './src/styles/theme';
import LoadingSpinner from './src/components/common/Spinner';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-get-random-values';
import 'react-native-url-polyfill';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/localization';
import CareScreen from './src/screens/care/CareScreen';
import { NavigationContainer } from '@react-navigation/native';
import { bootstrapTemplates } from './src/services/TemplateService'
import { getBabyProfile } from './src/storage/BabyProfileStorage';
import { clearAllSchedules } from './src/storage/ScheduleStorage';

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Edrosa: require('./src/assets/fonts/Edrosa.otf'),
  });

  useEffect(() => {
    (async () => {
      // either use the saved profile…
      const profile = await getBabyProfile()
      const babyId = profile?.id ?? 'defaultBabyId'
  
      console.log('[App] resetting schedules for babyId=', babyId)
      /* await clearAllSchedules(babyId) */
      await bootstrapTemplates(babyId)
      console.log('[App] cleared old schedules & bootstrapped templates')
    })()
  }, [])

  // Run syncPendingLogs on app launch and when regaining connectivity
  useEffect(() => {
    // On launch:
    (async () => {
      try {
        await syncPendingLogs();
      } catch (e) {
        console.warn('Initial syncPendingLogs failed:', e);
      }
    })();
    return () => {};
  }, []);

  if (!fontsLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={rneThemeBase as any}>
        <StyledThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>

              <AppNavigator />
              <StatusBar style="auto" />

          </I18nextProvider>
        </StyledThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;
