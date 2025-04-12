import React from 'react';
import { ImageSourcePropType, TouchableOpacity } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { DefaultTheme } from 'styled-components/native';

const CardWrapper = styled(TouchableOpacity)`
  width: ${({ theme }: { theme: DefaultTheme }) => theme.sizes.cardWidth}px;
  height: ${({ theme }: { theme: DefaultTheme }) => theme.sizes.cardHeight}px;
  margin-vertical: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  border-radius: 25px;
  overflow: hidden;
`;

const BackgroundImage = styled.ImageBackground`
  flex: 1;
  justify-content: space-between;
  width: 100%;
  height: 100%;
`;

const ContentContainer = styled.View`
  flex: 1;
  justify-content: space-between;
`;

const TextContainer = styled.View`
  margin: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.sizes.title}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  text-align: left;
`;

const Subtext = styled.Text`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.sizes.body}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  text-align: left;
`;

const BadgeContainer = styled.View`
  align-self: flex-end;
  margin-right: 10px;
`;

const Badge = styled.Text`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.sizes.small}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.muted};
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xsmall}px ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  border-radius: 12px;
  margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xsmall}px;
  text-align: center;
`;

const IconContainer = styled.View`
  align-self: flex-end;
  margin-right: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
`;

const Icon = styled.Image`
  width: 24px;
  height: 24px;
`;

interface CardProps {
  testID: string;
  backgroundImage: ImageSourcePropType;
  title: string;
  subtext?: string;
  badges?: string[];
  icon?: ImageSourcePropType;
  onPress: () => void;
}

const Card: React.FC<CardProps> = ({
  testID,
  backgroundImage,
  title,
  subtext,
  badges,
  icon,
  onPress,
}) => {
  const theme = useTheme();

  return (
    <CardWrapper testID={testID} onPress={onPress}>
      <BackgroundImage source={backgroundImage} resizeMode="cover" testID={`${testID}-background`}>
        <ContentContainer>
          <BadgeContainer>
            {badges && badges.map((badge, index) => (
              <Badge key={index}>{badge}</Badge>
            ))}
            {icon && (
              <IconContainer>
                <Icon source={icon} testID={`${testID}-icon`} />
              </IconContainer>
            )}
          </BadgeContainer>
          <TextContainer>
            <Title>{title}</Title>
            {subtext && <Subtext>{subtext}</Subtext>}
          </TextContainer>
        </ContentContainer>
      </BackgroundImage>
    </CardWrapper>
  );
};

export default Card;