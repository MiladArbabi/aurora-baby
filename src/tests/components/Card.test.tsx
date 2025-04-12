import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Card from '../../components/common/Card';
import { ThemeProvider } from '@rneui/themed';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { rneThemeBase, theme } from '../../styles/theme';

describe('Card', () => {
  const renderCard = (props = {}) =>
    render(
      <ThemeProvider theme={rneThemeBase}>
        <StyledThemeProvider theme={theme}>
          <Card
            testID="card"
            backgroundImage={require('../../assets/png/harmony/auroraforestmap.png')}
            title="Test Card"
            onPress={jest.fn()}
            {...props}
          />
        </StyledThemeProvider>
      </ThemeProvider>
    );

  it('renders with background image and title', () => {
    const { getByTestId, getByText } = renderCard();
    expect(getByTestId('card-background')).toBeTruthy();
    expect(getByText('Test Card')).toBeTruthy();
  });

  it('calls onPress when clicked', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderCard({ onPress });
    fireEvent.press(getByTestId('card'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders subtext when provided', () => {
    const { getByText } = renderCard({ subtext: 'Test Subtext' });
    expect(getByText('Test Subtext')).toBeTruthy();
  });

  it('renders badges when provided', () => {
    const { getByText } = renderCard({ badges: ['Badge1', 'Badge2'] });
    expect(getByText('Badge1')).toBeTruthy();
    expect(getByText('Badge2')).toBeTruthy();
  });

  it('renders icon when provided', () => {
    const { getByTestId } = renderCard({
      icon: require('../../assets/png/icons/magnifying-glass.png'),
    });
    expect(getByTestId('card-icon')).toBeTruthy();
  });
});