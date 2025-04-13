import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import { StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import BottomNav from '../components/common/BottomNav';
import Card from '../components/common/Card';
import TopNav from '../components/common/TopNav';
import { prebuiltStories } from '../data/stories';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const CardsContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
  padding-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.sizes.bottomNavHeight + theme.spacing.xlarge}px;
`;

type HarmonyHomeScreenProps = StackScreenProps<RootStackParamList, 'Harmony'>;

const HarmonyHomeScreen: React.FC<HarmonyHomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  const cardData = [
    {
      testID: 'harmony-card-play',
      backgroundImage: require('../assets/png/characters/birkandfreya.png'),
      title: 'Play a Story',
      subtext: prebuiltStories[0].title,
      badges: [prebuiltStories[0].stemFocus, prebuiltStories[0].traitFocus],
      onPress: () => navigation.navigate('StoryPlayer', { storyId: prebuiltStories[0].id }),
    },
    {
      testID: 'harmony-card-create',
      backgroundImage: require('../assets/png/harmony/auroraforest.png'),
      title: 'Create Your Own Story',
      icon: require('../assets/png/icons/generative-ai.png'),
      onPress: () => navigation.navigate('StoryPlayer', { storyId: 'mock-custom-story' }),
    },
    {
      testID: 'harmony-card-explore',
      backgroundImage: require('../assets/png/harmony/auroraforestmap.png'),
      title: 'Explore the Forest',
      subtext: 'Discover the Aurora Forest',
      icon: require('../assets/png/icons/magnifying-glass.png'),
      onPress: () => navigation.navigate('ForestMap'),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container>
        <TopNav navigation={navigation} />
        <CardsContainer>
          {cardData.map((card) => (
            <Card
              key={card.testID}
              testID={card.testID}
              backgroundImage={card.backgroundImage}
              title={card.title}
              subtext={card.subtext}
              badges={card.badges}
              icon={card.icon}
              onPress={card.onPress}
            />
          ))}
        </CardsContainer>
        <BottomNav navigation={navigation} activeScreen="Harmony" />
      </Container>
    </SafeAreaView>
  );
};

export default HarmonyHomeScreen;

const styles = StyleSheet.create({
    miniNavWrapper: {
      marginTop: 30, // TopNav height is 50 + margin = ~Y=100
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      gap: 25, // future RN support; we’ll fallback to manual spacing for now
    },
  });  