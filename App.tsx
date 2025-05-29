// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { rneThemeBase, theme } from './src/styles/theme';
import LoadingSpinner from './src/components/common/Spinner';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-get-random-values';
import 'react-native-url-polyfill';

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Edrosa: require('./src/assets/fonts/Edrosa.otf'),
  });

  if (!fontsLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={rneThemeBase as any}>
        <StyledThemeProvider theme={theme}>
          <AppNavigator />
          <StatusBar style="auto" />
        </StyledThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;