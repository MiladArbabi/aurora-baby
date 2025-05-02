//src/tests/components/BottomNav.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';
import { theme } from '../../styles/theme';
import BottomNav from '../../components/common/BottomNav';
import HomeIcon from '../../assets/bottomnavicons/HomeIcon';
import HarmonyIcon from '../../assets/bottomnavicons/HarmonyIcon';
import WhisprButton from '../../assets/whispr/WhisprButton';
import CareIcon from '../../assets/bottomnavicons/CareIcon';
import WonderIcon from '../../assets/bottomnavicons/WonderIcon';

describe('BottomNav', () => {
  let mockNav: { navigate: jest.Mock };
  beforeEach(() => {
    mockNav = { navigate: jest.fn() };
  });

  it('renders all four buttons', () => {
        const { getByTestId } = render(
          <ThemeProvider theme={theme}>
            <BottomNav navigation={mockNav as any} activeScreen="Home" />
          </ThemeProvider>
        );
        ['home', 'harmony', 'care', 'wonder'].forEach((id) => {
        expect(getByTestId(`bottom-nav-${id}`)).toBeTruthy();
    });
  });

  it('calls navigate with correct screen on press', () => {
    const { getByTestId } = render(
    <ThemeProvider theme={theme}>
        <BottomNav navigation={mockNav as any} activeScreen="Home" />
    </ThemeProvider>    
    );
    fireEvent.press(getByTestId('bottom-nav-care'));
    expect(mockNav.navigate).toHaveBeenCalledWith('Care');
  });

  it('highlights the active icon with the active color', async () => {
    const { getByTestId } = render(
    <ThemeProvider theme={theme}>
        <BottomNav navigation={mockNav as any} activeScreen="Harmony" />
    </ThemeProvider>    
);

    // findByType returns a Promise, so await it
    const harmonyIconInstance = await getByTestId('bottom-nav-harmony').findByType(HarmonyIcon);
    expect(harmonyIconInstance.props.fill).toBe(theme.colors.secondaryBackground);

    const homeIconInstance = await getByTestId('bottom-nav-home').findByType(HomeIcon);
    expect(homeIconInstance.props.fill).toBe(theme.colors.background);
    });
});