import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView as RNSafeAreaView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import BottomNav from '../components/common/BottomNav';
import Card from '../components/common/Card';
import TopNav from '../components/common/TopNav';
import { prebuiltStories } from '../data/stories';
import ActionMenu from '../components/common/ActionMenu';
import QuickLogMenu from '../components/carescreen/QuickLogMenu';
import { useActionMenuLogic } from '../hooks/useActionMenuLogic';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => 
    theme.colors.background};
`;

const CardsContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: ${({ theme }: { theme: DefaultTheme }) =>  
    theme.spacing.large}px;
  padding-bottom: ${({ theme }: { theme: DefaultTheme }) => 
    theme.sizes.bottomNavHeight + theme.spacing.xlarge}px;
`;

type Props = StackScreenProps<RootStackParamList, 'Harmony'>;

const NAV_HEIGHT = 110;

const HarmonyHomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { handleVoiceCommand } = useActionMenuLogic();

  // local quick-log state
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const openQuickLog = useCallback(() => setQuickLogVisible(true), []);
  const closeQuickLog = useCallback(() => setQuickLogVisible(false), []);

  const cardData = [
    {
      testID: 'harmony-card-play',
      backgroundImage: require('../assets/png/characters/birkandfreya.png'),
      title: 'Play a Story',
      subtext: prebuiltStories[0].title,
      badges: [prebuiltStories[0].stemFocus, prebuiltStories[0].traitFocus],
      onPress: () =>
        navigation.navigate('StoryPlayer', { storyId: prebuiltStories[0].id }),
    },
    {
      testID: 'harmony-card-create',
      backgroundImage: require('../assets/png/harmony/auroraforest.png'),
      title: 'Create Your Own Story',
      icon: require('../assets/png/icons/generative-ai.png'),
      onPress: () =>
        navigation.navigate('StoryPlayer', { storyId: 'mock-custom-story' }),
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
    <View style={styles.screen}>
      <RNSafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
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
      </RNSafeAreaView>

      <ActionMenu
        style={styles.quickLogContainer}
        onQuickLogPress={openQuickLog}
        onWhisprPress={() => navigation.navigate('Whispr')}
        onMicPress={handleVoiceCommand}
      />

      {quickLogVisible && (
        <QuickLogMenu onClose={closeQuickLog} />
      )}
    </View>
  );
};

export default HarmonyHomeScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  quickLogContainer: {
    position: 'absolute',
    right: 20,
    bottom: NAV_HEIGHT + 20,
    alignItems: 'center',
  },
});