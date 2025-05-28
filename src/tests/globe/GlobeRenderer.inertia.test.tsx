// src/tests/globe/GlobeRenderer.inertia.test.tsx
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import GlobeRenderer from '../../../src/components/globe/GlobeRenderer';
import { RegionProvider } from '../../../src/context/RegionContext';

describe('GlobeRenderer inertia/decay behavior', () => {
    const Wrapped: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {children}
    </GestureHandlerRootView>
  );

  it('handles pan release (inertia) without crashing', async () => {
    const { getByTestId } = render(
      <Wrapped>
        <GlobeRenderer onRegionPress={() => {}} />
      </Wrapped>
    );
    const globe = getByTestId('globe-view');
    await act(async () => {
      fireEvent(globe, 'onGestureHandlerStateChange', {
        nativeEvent: { state: 'END', velocityX: 250, velocityY: -120 },
      });
    });
  });

  it('handles pinch release (zoom decay) without crashing', async () => {
    const { getByTestId } = render(
      <Wrapped>
        <GlobeRenderer onRegionPress={() => {}} />
      </Wrapped>
    );
    const globe = getByTestId('globe-view');
    await act(async () => {
      fireEvent(globe, 'onGestureHandlerStateChange', {
        nativeEvent: { state: 'END', velocity: 2.0 },
      });
    });
  });

  it('spins idle without crashing', async () => {
        jest.useFakeTimers();
        const { getByTestId } = render(
          <Wrapped>
            <GlobeRenderer onRegionPress={() => {}} />
          </Wrapped>
        );
        // advance past one idle tick
        act(() => { jest.advanceTimersByTime(150); });
      });
});
