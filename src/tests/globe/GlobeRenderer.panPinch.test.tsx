/**
 * Mocks for native‐only libraries so Jest can render our GlobeRenderer
 */
jest.mock('react-native-gesture-handler', () => {
    const { View } = require('react-native');
    const MockHandler: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
      <View>{children}</View>
    );
    return {
      GestureHandlerRootView: MockHandler,
      PanGestureHandler: MockHandler,
      PinchGestureHandler: MockHandler,
    };
  });
  
  jest.mock('react-native-reanimated', () => {
    // This uses the built-in Reanimated mock, then we patch in style hooks
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.useSharedValue = (init: number) => ({ value: init });
    Reanimated.useAnimatedStyle = (styler: () => Record<string, any>) => styler();
    return Reanimated;
  });
  
  jest.mock('react-native-svg', () => {
    const { View } = require('react-native');
    // Render <Svg> and <Circle> as plain Views
    return {
      __esModule: true,
      Svg: View,
      Circle: View,
    };
  });
  
  import React from 'react';
  import { render, fireEvent, act } from '@testing-library/react-native';
  import { GestureHandlerRootView } from 'react-native-gesture-handler';
  import { RegionProvider } from '../../../src/context/RegionContext';
  import GlobeRenderer from '../../../src/components/globe/GlobeRenderer';
  
  const Wrapped: React.FC = () => (
    <GestureHandlerRootView>
      <RegionProvider>
        <GlobeRenderer onRegionPress={() => {}} />
      </RegionProvider>
    </GestureHandlerRootView>
  );
  
  describe('GlobeRenderer pan & pinch', () => {
    it('runs pan gesture without crashing', async () => {
      const { getByTestId } = render(<Wrapped />);
      const panView = getByTestId('pan-view');
      await act(async () => {
        fireEvent(panView, 'onGestureEvent', {
          nativeEvent: { translationX: 50, translationY: -20 },
        });
      });
    });
  
    it('runs pinch gesture without crashing', async () => {
      const { getByTestId } = render(<Wrapped />);
      const pinchView = getByTestId('pinch-view');
      await act(async () => {
        fireEvent(pinchView, 'onGestureEvent', {
          nativeEvent: { scale: 1.5 },
        });
      });
    });
  });
  