import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import { harmonySections } from '../data/harmonySections';
import { StoryCardData } from '../types/HarmonyFlatList';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const StoryImage = styled.Image`
  width: 100%;
  height: 200px;
  border-radius: 20px;
  margin-bottom: 20px;
`;

const StoryTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  margin-bottom: 10px;
`;

const StoryDetails = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
  margin-bottom: 20px;
`;

const PlayButton = styled.TouchableOpacity`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  padding: 12px 20px;
  border-radius: 30px;
  align-self: center;
`;

const ButtonText = styled.Text`
  font-size: 16px;
  color: white;
  font-weight: bold;
`;

type Props = StackScreenProps<RootStackParamList, 'StoryPlayer'>;

const StoryPlayer: React.FC<Props> = ({ route }) => {
  const theme = useTheme();
  const { storyId } = route.params;

  // Lookup story from harmonySections
  const story: StoryCardData | undefined = harmonySections
    .flatMap(section => section.data)
    .find(item => item.id === storyId);

  if (!story) {
    return (
      <SafeAreaView style={styles.centered}> 
        <Text style={{ color: theme.colors.text }}>Story not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container>
        <StoryImage source={{ uri: story.thumbnail }} resizeMode="cover" />
        <StoryTitle>{story.title}</StoryTitle>
        <StoryDetails>
          {story.description ?? 'A calm, delightful story for your child.'}
        </StoryDetails>
        <PlayButton onPress={() => console.log(`Playing story: ${story.id}`)}>
          <ButtonText>{story.ctaLabel ?? 'Play'}</ButtonText>
        </PlayButton>
      </Container>
    </SafeAreaView>
  );
};

export default StoryPlayer;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
