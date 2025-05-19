// src/screens/HarmonyHomeScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity, Alert } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import BottomNav from '../components/common/BottomNav';
import TopNav from '../components/common/TopNav';
import { harmonySections } from '../data/harmonySections';
import { StoryCardData, HarmonySection } from '../types/HarmonyFlatList';
import { Dimensions } from 'react-native';
import { getUserStories, deleteUserStory } from '../services/UserStoriesService';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.38;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 0.5625;
const CARD_MARGIN_HORIZONTAL = screenWidth * 0.025;

type PlaceholderCard = {
  id: string;
  title: '';
  thumbnail: '';
  type: 'prebuilt';
  cardColor?: undefined;
  isPlaceholder: true;
};

type Props = StackScreenProps<RootStackParamList, 'Harmony'>;
type CardWithPlaceholder = StoryCardData | PlaceholderCard;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  margin-left: ${CARD_MARGIN_HORIZONTAL * 2}px;
  margin-top: 30px;
`;

const SectionSubtitle = styled.Text`
  font-size: 14px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
  margin-left: ${CARD_MARGIN_HORIZONTAL * 2}px;
  margin-bottom: 10px;
`;

const StoryCard = styled.TouchableOpacity<{ cardColor?: 'lavender' | 'teal' | 'peach' }>`
  width: ${CARD_WIDTH}px;
  margin-horizontal: ${CARD_MARGIN_HORIZONTAL}px;
  background-color: ${({ theme, cardColor }: { theme: DefaultTheme; cardColor?: 'lavender' | 'teal' | 'peach' }) =>
    cardColor === 'lavender' ? theme.colors.primary :
    cardColor === 'teal' ? theme.colors.accent :
    cardColor === 'peach' ? theme.colors.darkAccent :
    theme.colors.tertiaryAccent};
  border-radius: 16px;
  padding: 8px;
  border: 1px solid white;
`;

const StoryImage = styled.Image`
  width: ${CARD_WIDTH}px;
  height: ${CARD_IMAGE_HEIGHT}px;
  border-radius: 16px;
  margin-bottom: 8px;
`;

const StoryTitle = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  text-align: center;
  margin-top: 4px;
`;

function useUserStoriesSection(): HarmonySection | null {
  const [userStories, setUserStories] = useState<StoryCardData[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const stories = await getUserStories();
        setUserStories(stories);
      })();
    }, [])
  );

  if (userStories.length === 0) return null;

  return {
    id: 'user-stories',
    title: '🧡 Your Created Stories',
    subtitle: 'Stories made by you',
    type: 'personalized',
    data: userStories,
  };
}

const HarmonyHomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [userStories, setUserStories] = useState<StoryCardData[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const stories = await getUserStories();
        setUserStories(stories);
      })();
    }, [])
  );

  const renderStoryCard = (item: StoryCardData, sectionId: string) => (
    <StoryCard
      key={item.id}
      cardColor={item.cardColor}
      onLongPress={
        sectionId === 'user-created'
          ? () => {
              Alert.alert('Delete Story?', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await deleteUserStory(item.id);
                    const stories = await getUserStories();
                    setUserStories(stories);
                  },
                },
              ]);
            }
          : undefined
      }
      onPress={
        item.action
          ? item.action
          : () => {
              if (sectionId === 'play-a-story' || sectionId === 'user-created') {
                navigation.navigate('PlayStory', { storyId: item.id });
              } else if (sectionId === 'create-a-story') {
                navigation.navigate('CreateStory');
              } else {
                navigation.navigate('StoryPlayer', { storyId: item.id });
              }
            }
      }
    >
      <StoryImage source={{ uri: item.thumbnail }} resizeMode="cover" />
      <View style={{ alignItems: 'center' }}>
        <StoryTitle>{item.title}</StoryTitle>
      </View>
    </StoryCard>
  );

  const ensureMinimumCards = (cards: StoryCardData[], sectionId: string): CardWithPlaceholder[] => {
    const placeholdersNeeded = Math.max(0, 3 - cards.length);
    const placeholders: PlaceholderCard[] = Array.from({ length: placeholdersNeeded }).map((_, i) => ({
      id: `placeholder-${sectionId}-${i}`,
      title: '',
      thumbnail: '',
      type: 'prebuilt',
      cardColor: undefined,
      isPlaceholder: true,
    }));
    return [...cards, ...placeholders];
  };

  const userStoriesSection = useUserStoriesSection();
  const sectionsToRender = userStoriesSection
  ? [...harmonySections, userStoriesSection] // put it at the bottom
  : harmonySections;

  return (
    <View style={styles.screen}>
      <Container>
        <TopNav navigation={navigation} /> 
        <FlatList
          data={sectionsToRender}
          keyExtractor={(section) => section.id}
          contentContainerStyle={{ paddingBottom: theme.sizes.bottomNavHeight + 75 }}
          renderItem={({ item: section }) => (
            <View>
              <SectionTitle>{section.title}</SectionTitle>
              {section.subtitle && <SectionSubtitle>{section.subtitle}</SectionSubtitle>}
              <FlatList
                data={ensureMinimumCards(section.data, section.id)}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                renderItem={({ item }) =>
                  'isPlaceholder' in item && item.isPlaceholder ? (
                    <View style={{ width: 160, marginHorizontal: 10, opacity: 0 }} />
                  ) : (
                    renderStoryCard(item as StoryCardData, section.id)
                  )
                }
              />
            </View>
          )}
        />
        <BottomNav navigation={navigation} activeScreen="Harmony" />
      </Container>
    </View>
  );
};

export default HarmonyHomeScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
