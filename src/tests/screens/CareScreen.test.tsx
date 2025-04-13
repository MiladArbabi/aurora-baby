import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CareScreen from '../../screens/CareScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { NavigationContainer } from '@react-navigation/native';
import { rneThemeBase, theme } from '../../styles/theme';

const renderWithProviders = () =>
  render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme}>
          <NavigationContainer>
            <PortalProvider>
              <CareScreen />
            </PortalProvider>
          </NavigationContainer>
        </StyledThemeProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );

describe('CareScreen', () => {
  it('renders MiniNavBar and switches tabs on icon press', async () => {
    const { getByTestId } = renderWithProviders();

    expect(getByTestId('active-tab-indicator').props.children).toContain('tracker');

    fireEvent.press(getByTestId('graph-icon'));
    expect(getByTestId('active-tab-indicator').props.children).toContain('graph');

    fireEvent.press(getByTestId('cards-icon'));
    expect(getByTestId('active-tab-indicator').props.children).toContain('cards');

    fireEvent.press(getByTestId('tracker-icon'));
    expect(getByTestId('active-tab-indicator').props.children).toContain('tracker');
  });

  it('opens and closes QuickLogMenu when plus icon is pressed', async () => {
    const { getByTestId, queryByTestId } = renderWithProviders();

    // Initially not visible
    expect(queryByTestId('quick-log-menu')).toBeNull();

    // Open modal via plus icon
    fireEvent.press(getByTestId('tracker-plus-button'));

    await waitFor(() => {
      expect(getByTestId('quick-log-menu')).toBeTruthy();
    });

    // Close modal using handlebar
    fireEvent.press(getByTestId('menu-handle'));

    await waitFor(() => {
      expect(queryByTestId('quick-log-menu')).toBeNull();
    });
  });
});
