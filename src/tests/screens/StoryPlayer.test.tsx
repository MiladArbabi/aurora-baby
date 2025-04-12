import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import StoryPlayer from '../../screens/StoryPlayer';
import { rneThemeBase, theme } from '../../styles/theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';

describe('StoryPlayer', () => {
  const mockNavigation: StackNavigationProp<RootStackParamList, 'StoryPlayer'> = {
    navigate: jest.fn(),
    getState: jest.fn(),
    dispatch: jest.fn(),
    addListener: jest.fn(() => () => {}),
    canGoBack: jest.fn(),
    getId: jest.fn(),
    getParent: jest.fn(),
    goBack: jest.fn(),
    isFocused: jest.fn(),
    removeListener: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    setParams: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    pop: jest.fn(),
    popTo: jest.fn(),
    popToTop: jest.fn(),
    navigateDeprecated: jest.fn(),
    preload: jest.fn(),
    setStateForNextRouteNamesChange: jest.fn(),
  };

  const mockRoute: RouteProp<RootStackParamList, 'StoryPlayer'> = {
    key: 'StoryPlayer-123',
    name: 'StoryPlayer',
    params: { storyId: 'birk-freya-vanished-star' },
  };

  const renderWithNavigation = () =>
    render(
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <NavigationContainer>
            <StoryPlayer navigation={mockNavigation} route={mockRoute} />
          </NavigationContainer>
        </StyledThemeProvider>
      </ThemeProvider>
    );

    it('renders top nav with logo, text, and avatar', async () => {
      const { getByTestId } = renderWithNavigation();
      await waitFor(() => {
        expect(getByTestId('top-nav-logo')).toBeTruthy();
        expect(getByTestId('top-nav-text')).toBeTruthy();
        expect(getByTestId('top-nav-avatar')).toBeTruthy();
      }, { timeout: 10000 }); 
    }, 10000);

  it('renders three storytelling cards', async () => {
    const { getByTestId, getByText } = renderWithNavigation();
    await waitFor(() => {
      expect(getByTestId('story-card-soothing')).toBeTruthy();
      expect(getByText('Soothing Storytime')).toBeTruthy();

      expect(getByTestId('story-card-choice')).toBeTruthy();
      expect(getByText('Make a Choice')).toBeTruthy();

      expect(getByTestId('story-card-daily')).toBeTruthy(); // Updated testID
      expect(getByText('Story of the Day')).toBeTruthy(); // Updated title
    });
  });

  it('navigates to StoryViewer with soothing mode when Soothing card is pressed', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      fireEvent.press(getByTestId('story-card-soothing'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('StoryViewer', {
        storyId: 'birk-freya-vanished-star',
        mode: 'soothing',
      });
    });
  });

  it('navigates to StoryViewer with choice mode when Choice card is pressed', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      fireEvent.press(getByTestId('story-card-choice'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('StoryViewer', {
        storyId: 'birk-freya-vanished-star',
        mode: 'choice',
      });
    });
  });

  it('navigates to StoryViewer with daily mode when Daily card is pressed', async () => { // Updated test
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      fireEvent.press(getByTestId('story-card-daily'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('StoryViewer', {
        storyId: 'birk-freya-vanished-star',
        mode: 'daily', // Updated mode
      });
    });
  });

  it('renders bottom nav with all icons', async () => {
    const { getByTestId } = renderWithNavigation();
    await waitFor(() => {
      expect(getByTestId('bottom-nav-home')).toBeTruthy();
      expect(getByTestId('bottom-nav-harmony')).toBeTruthy();
      expect(getByTestId('bottom-nav-care')).toBeTruthy();
      expect(getByTestId('bottom-nav-wonder')).toBeTruthy();
    });
  });
});