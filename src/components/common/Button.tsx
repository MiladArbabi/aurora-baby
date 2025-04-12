import React from 'react';
import styled from 'styled-components/native';
import { colors, fonts, spacing } from '../../styles/theme';

interface ButtonProps {
  text?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
  style?: any; // Allow styled props to override
}

const StyledButton = styled.TouchableOpacity`
  padding: ${spacing.small}px ${spacing.medium}px;
  background-color: ${colors.primary};
  border-radius: ${spacing.small}px;
`;

const StyledText = styled.Text`
  color: ${colors.background};
  font-family: ${fonts.regular};
  text-align: center;
`;

const Button: React.FC<ButtonProps> = ({ text, children, onPress, testID, style }) => {
  return (
    <StyledButton testID={testID || 'styled-button'} onPress={onPress} style={style}>
      {text ? <StyledText>{text}</StyledText> : children}
    </StyledButton>
  );
};

export default Button;