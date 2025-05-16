// src/tests/components/BottomNav.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';
import BottomNav from '../../components/common/BottomNav';
import HomeIcon from '../../assets/bottomnavicons/HomeIcon';
import HarmonyIcon from '../../assets/bottomnavicons/HarmonyIcon';
import CareIcon from '../../assets/bottomnavicons/CareIcon';
import WonderIcon from '../../assets/bottomnavicons/WonderIcon';
import { theme } from '../../styles/theme';

describe('BottomNav', () => {
  let mockNav: { navigate: jest.Mock };
  beforeEach(() => {
    mockNav = { navigate: jest.fn() };
  });

  it('renders all four nav buttons plus the Whispr button', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <BottomNav navigation={mockNav as any} activeScreen="Home" />
      </ThemeProvider>
    );

    ['home', 'harmony', 'care', 'wonder', 'whispr'].forEach(id => {
      expect(getByTestId(`bottom-nav-${id}`)).toBeTruthy();
    });
  });

  it('navigates to the correct screen when tapped', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <BottomNav navigation={mockNav as any} activeScreen="Home" />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId('bottom-nav-care'));
    expect(mockNav.navigate).toHaveBeenCalledWith('Care');

    fireEvent.press(getByTestId('bottom-nav-whispr'));
    expect(mockNav.navigate).toHaveBeenCalledWith('Whispr');
  });

  it('applies theme.colors.iconActive to the active icon and iconInactive to the others', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <BottomNav navigation={mockNav as any} activeScreen="Harmony" />
      </ThemeProvider>
    );

    // active = Harmony
    const harmonyNav = getByTestId('bottom-nav-harmony');
    const harmonyIconInstance = harmonyNav.findByType(HarmonyIcon);
    expect(harmonyIconInstance.props.fill).toBe(theme.colors.iconActive);

    // inactive = Home
    const homeNav = getByTestId('bottom-nav-home');
    const homeIconInstance = homeNav.findByType(HomeIcon);
    expect(homeIconInstance.props.fill).toBe(theme.colors.iconInactive);
  });
});
