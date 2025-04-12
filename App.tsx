import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { rneThemeBase, theme } from './src/styles/theme';
import LoadingSpinner from './src/components/common/LoadingSpinner';
import { LogBox } from 'react-native';
import { PortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



LogBox.ignoreLogs([
  'Warning: findDOMNode is deprecated',
]);

export default function App() {
  const [fontsLoaded] = useFonts({
    'Edrosa': require('./src/assets/fonts/Edrosa.otf'),
  });

  if (!fontsLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={rneThemeBase as any}>
        <StyledThemeProvider theme={theme}>
          <PortalProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </PortalProvider>
        </StyledThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}