import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../components/common/Button';
import { colors, fonts, spacing } from '../../styles/theme';

describe('Button', () => {
  it('renders with provided text and themed styles', () => {
    const { getByText, getByTestId } = render(<Button text="Click Me" onPress={() => {}} />);
    const buttonText = getByText('Click Me');
    const button = getByTestId('styled-button');

    expect(buttonText).toBeTruthy();
    expect(buttonText.props.style).toMatchObject({
      color: colors.background, // #E9DAFA
      fontFamily: fonts.regular, // Edrosa
      textAlign: 'center',
    });

    expect(button.props.style).toMatchObject({
      backgroundColor: colors.primary, // #B3A5C4
      paddingTop: spacing.small, // 8
      paddingRight: spacing.medium, // 16
      paddingBottom: spacing.small, // 8
      paddingLeft: spacing.medium, // 16
      borderTopLeftRadius: spacing.small, // 8
      borderTopRightRadius: spacing.small, // 8
      borderBottomRightRadius: spacing.small, // 8
      borderBottomLeftRadius: spacing.small, // 8
    });
  });

  it('calls onPress when clicked', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button text="Click Me" onPress={mockOnPress} />);
    fireEvent.press(getByText('Click Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});