import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import SuggestionCard from '../../components/common/SuggestionCard';
import { rneThemeBase, theme } from '../../styles/theme';
import { DefaultTheme } from 'styled-components/native';

describe('SuggestionCard', () => {
  const renderSuggestionCard = (text: string, testID: string) =>
    render(
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme as DefaultTheme}>
          <SuggestionCard text={text} testID={testID} />
        </StyledThemeProvider>
      </ThemeProvider>
    );

  it('renders with provided text and testID', () => {
    const { getByTestId, getByText } = renderSuggestionCard('Try an earlier nap today', 'optimization-card');
    expect(getByTestId('optimization-card')).toBeTruthy();
    expect(getByText('Try an earlier nap today')).toBeTruthy();
  });

  it('applies correct styles', () => {
    const { getByTestId } = renderSuggestionCard('Take a 5-min break now', 'self-care-card');
    const card = getByTestId('self-care-card');
    expect(card.props.style).toMatchObject({
      width: 125,
      height: 125,
      backgroundColor: theme.colors.tertiaryAccent,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
      borderBottomLeftRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    });
  });
});