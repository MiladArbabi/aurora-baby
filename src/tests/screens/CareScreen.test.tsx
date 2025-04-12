import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CareScreen from '../../screens/Carescreen';
import { PortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


jest.mock('@gorhom/bottom-sheet', () => {
    const React = require('react');
    const { forwardRef, useImperativeHandle } = React;
    const { View, Text } = require('react-native');
  
    type Props = {
      children: React.ReactNode;
    };
  
    type RefType = {
      snapToIndex: (index: number) => void;
    };
  
    const MockBottomSheet = forwardRef(function MockBottomSheet(
      props: Props,
      ref: React.Ref<RefType>
    ) {
      useImperativeHandle(ref, () => ({
        snapToIndex: jest.fn(),
      }));
      return <View testID="mock-bottom-sheet">{props.children}</View>;
    });
  
    return MockBottomSheet;
  });
  

  describe('CareScreen', () => {
    it('renders placeholder and opens bottom sheet', async () => {
      const { getByTestId, queryByTestId } = render(
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PortalProvider>
            <CareScreen />
          </PortalProvider>
        </GestureHandlerRootView>
      );
  
      expect(getByTestId('care-placeholder')).toBeTruthy();
  
      const openButton = getByTestId('open-sheet');
      fireEvent.press(openButton);
  
      await waitFor(() => {
        expect(queryByTestId('mock-bottom-sheet')).toBeTruthy();
      });
    });
  });
