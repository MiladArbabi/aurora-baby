// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useFonts } from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import { rneThemeBase, theme } from './src/styles/theme';
import LoadingSpinner from './src/components/common/LoadingSpinner';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WhisprScreen from 'screens/WhisperScreen';

LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component',
]);

const App = () => {
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
          <WhisprScreen />
          <StatusBar style="auto" />
        </StyledThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;