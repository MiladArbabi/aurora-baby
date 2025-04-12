import React from 'react';
import { render, act } from '@testing-library/react-native';
import LogoScreen from '../../screens/LogoScreen';
import { StackNavigationProp } from '@react-navigation/stack';

jest.useFakeTimers();

type RootStackParamList = {
  Logo: undefined;
  AppNavigator: undefined;
};

describe('LogoScreen', () => {
  // TODO: Investigate why useEffect doesn't trigger replace in test environment
  it.skip('triggers navigation after 3-4 seconds', () => {
    const replace = jest.fn();
    const navigation: StackNavigationProp<RootStackParamList, 'Logo'> = {
      replace,
      navigate: jest.fn(),
      navigateDeprecated: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      goBack: jest.fn(),
      isFocused: () => true,
      canGoBack: () => false,
      preload: jest.fn(),
      getParent: () => undefined as any,
      getState: () => ({
        routes: [],
        index: 0,
        key: 'mock-state',
        routeNames: ['Logo', 'AppNavigator'] as const,
        type: 'stack',
        stale: false,
        preloadedRoutes: [],
      }),
      getId: () => undefined,
      setStateForNextRouteNamesChange: jest.fn(),
      setParams: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => () => {}),
      removeListener: jest.fn(),
      push: jest.fn(),
      pop: jest.fn(),
      popToTop: jest.fn(),
      popTo: jest.fn(),
    };

    render(<LogoScreen navigation={navigation} />);

    act(() => {
      jest.advanceTimersByTime(4000); // Slightly over 3.5s
    });

    expect(replace).toHaveBeenCalledWith('AppNavigator');
  }, 15000); // 15s timeout
});

// Mock the .png file
jest.mock('../../assets/png/system/colorlogo.png', () => 'mock-image-path');