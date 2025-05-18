// src/screens/PlayStoryScreen.tsx
import React from 'react';
import { Dimensions, View, TouchableOpacity, Text } from 'react-native';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import TopNav from '../components/common/TopNav';
import BottomNav from 'components/common/BottomNav';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { harmonySections } from '../data/harmonySections';
import BackButton from 'assets/icons/common/BackButton';
import VoiceIcon from '../assets/harmonyscreen/VoiceIcon';
import TextIcon from '../assets/harmonyscreen/TextIcon';
import AnimationIcon from '../assets/harmonyscreen/AnimationIcon';

type Props = StackScreenProps<RootStackParamList, 'PlayStory'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const Card = styled.View`
  width: ${screenWidth * 0.9}px;
  height: ${screenHeight * 0.5}px;
  align-self: center;
  margin-top: 16px;
  border-radius: 24px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.darkAccent}; /* peach */
  margin-top: 42px;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary}; /* lavender */
  justify-content: flex-end;
  padding: 20px;
`;

const CardTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
`;

const IconRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
  padding-horizontal: 20px;
`;

const Label = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.secondaryBackground};
`;

const BackWrapper = styled.TouchableOpacity`
  align-self: flex-start;
  margin-left: 20px;
  margin-bottom: 12px;
`;

const PlayStoryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { storyId } = route.params;
  const theme = useTheme();

  const story = React.useMemo(() => {
    for (const section of harmonySections) {
      const match = section.data.find((item) => item.id === storyId);
      if (match) return match;
    }
    return null;
  }, [storyId]);
  
  if (!story) return <Text>Story not found</Text>;

  return (
    <Container>
        <TopNav navigation={navigation} />
        <Card>
            <CardTitle>{story.title}</CardTitle>
        </Card>
        <IconRow>
            <TouchableOpacity onPress={() => console.log('Play Voice')}>
            <VoiceIcon fill={theme.colors.primary} />
            <Label>Voice</Label>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Show Text')}>
            <TextIcon fill={theme.colors.primary} />
            <Label>Text</Label>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('Play Animation')}>
            <AnimationIcon fill={theme.colors.primary} />
            <Label>Animation</Label>
            </TouchableOpacity>
        </IconRow>
        <BackWrapper onPress={() => navigation.goBack()}>
            <BackButton fill={theme.colors.text} />
        </BackWrapper>
        <BottomNav navigation={navigation} activeScreen="Harmony" />
    </Container>
  );
};

export default PlayStoryScreen;
