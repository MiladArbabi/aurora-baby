// src/screens/PlayStoryScreen.tsx
import React, { useEffect } from 'react'
import { Dimensions, View, TouchableOpacity, Text, Alert } from 'react-native'
import styled, { useTheme, DefaultTheme } from 'styled-components/native'
import { StackScreenProps } from '@react-navigation/stack'

import TopNav from '../../components/common/TopNav'
import BottomNav from '../../components/common/BottomNav'
import { RootStackParamList } from '../../navigation/AppNavigator'
import { harmonySections } from '../../data/harmonySections'
import { getUserStories, deleteUserStory } from '../../services/UserStoriesService'
import { StoryCardData } from '../../types/HarmonyFlatList'
import { logEvent } from '../../utils/analytics'

import BackButton from '../../assets/icons/common/BackButton'
import VoiceIcon from '../../assets/harmonyscreen/playstoryscreen/VoiceIcon'
import TextIcon from '../../assets/harmonyscreen/playstoryscreen/TextIcon'
import AnimationIcon from '../../assets/harmonyscreen/playstoryscreen/AnimationIcon'
import DeleteButton from '../../assets/icons/common/DeleteButton'

type Props = StackScreenProps<RootStackParamList, 'PlayStory'>
const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// styled components
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

const DeleteWrapper = styled(TouchableOpacity)`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
`;
const BackWrapper = styled(TouchableOpacity)`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
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

export const PlayStoryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { 
    storyId, 
    fullStory: routeFullStory,
    title:      routeTitle = ''
   } = route.params;
  const theme = useTheme();

   // (1) Load all user stories
  const [userStories, setUserStories] = React.useState<StoryCardData[]>([])
  useEffect(() => {
    getUserStories().then(setUserStories)
  }, [])

  // (2) Figure out which story to show
  const userStory = React.useMemo(
    () => userStories.find(s => s.id === storyId) ?? null,
    [userStories, storyId]
  )
  const builtIn = React.useMemo<StoryCardData | null>(() => {
    for (const sec of harmonySections) {
      const found = sec.data.find(i => i.id === storyId)
      if (found) return found
    }
    return null
  }, [storyId])
  const story = userStory ?? builtIn
  const storyText = routeFullStory ?? userStory?.fullStory ?? ''
  const storyTitle = routeTitle || story?.title || '';

  // (3) Track “story_played” *before* any early return, always called
  useEffect(() => {
    if (!story) return
    logEvent('story_played', {
      storyId,
      source: route.params.fromPreview ? 'preview' : 'library',
    })
  }, [storyId, route.params.fromPreview, story])

  // (4) If no story at all, show placeholder
  if (!story) {
    return (
      <Container>
        <TopNav navigation={navigation} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text, fontSize: 16 }}>
            Story not found
          </Text>
        </View>
        <BottomNav navigation={navigation} activeScreen="Harmony" />
      </Container>
    )
  }

  // deletion handler (safe to use fromPreview here)
  const onDelete = () => {
    Alert.alert(
      'Delete Story',
      'Permanently delete this story?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteUserStory(storyId)
            logEvent('story_deleted', {
              storyId,
              source: route.params.fromPreview ? 'preview' : 'library',
            })
            navigation.goBack()
          },
        },
      ]
    )
  }

  return (
    <Container>
      <TopNav navigation={navigation} />
      <Card>
        <DeleteWrapper onPress={onDelete}>
          <DeleteButton fill={theme.colors.error} />
        </DeleteWrapper>
        <BackWrapper onPress={() => navigation.goBack()}>
          <BackButton fill={theme.colors.primary} />
        </BackWrapper>
        <CardTitle>{storyTitle}</CardTitle>
        <Text style={{ color: 'white', marginTop: 12 }}>{storyText}</Text>
      </Card>

      <IconRow>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('VoiceStorytelling', {
              storyId,
              title: storyTitle,
              fullStory: storyText,
            })
          }
        >
          <VoiceIcon fill={theme.colors.muted} />
          <Label>Voice</Label>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!story.fullStory}
          onPress={() =>
            navigation.navigate('TextStory', {
              storyId,
              fullStory: story.fullStory!,
            })
          }
        >
          <TextIcon fill={theme.colors.muted} />
          <Label style={{ opacity: story.fullStory ? 1 : 0.3 }}>Text</Label>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!story.animationAsset}
          onPress={() =>
            navigation.navigate('AnimatedStory', {
              storyId,
              fullStory: storyText,
              animationAsset:
                story.animationAsset ||
                require('../../assets/videos/logo-animation.mp4'),
            })
          }
        >
          <AnimationIcon fill={theme.colors.muted} />
          <Label style={{ opacity: story.animationAsset ? 1 : 0.3 }}>
            Animation
          </Label>
        </TouchableOpacity>
      </IconRow>

      <BottomNav navigation={navigation} activeScreen="Harmony" />
    </Container>
  )
}

export default PlayStoryScreen