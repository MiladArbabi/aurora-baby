import React from 'react';
import styled from 'styled-components/native';
import { DefaultTheme } from 'styled-components/native';

const Card = styled.View`
  width: 125px;
  height: 125px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.tertiaryAccent};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`;

const CardText = styled.Text`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.sizes.body}px;
  text-align: center;
`;

type SuggestionCardProps = {
  text: string;
  testID: string;
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({ text, testID }) => {
  return (
    <Card testID={testID}>
      <CardText>{text}</CardText>
    </Card>
  );
};

export default SuggestionCard;