export interface CardData {
  id: string;
  testID: string;
  title: string;
  backgroundImage: string;
  subtext?: string;
  badges?: string[];
  icon?: string;
  mode?: 'soothing' | 'choice' | 'daily';
  screen: 'Harmony' | 'Home' | 'StoryPlayer';
  onPress: (navigation: any, storyId?: string) => void;
}

export const cards: CardData[] = [
  // HarmonyHomeScreen Cards
  {
    id: 'harmony-play',
    testID: 'harmony-card-play',
    title: 'Play a Story',
    backgroundImage: 'characters/birkandfreya.png',
    subtext: 'Birk and Freya: The Vanished Star',
    badges: ['Science', 'Teamwork'],
    screen: 'Harmony',
    onPress: (navigation, storyId) => navigation.navigate('StoryPlayer', { storyId: 'birk-freya-vanished-star' }),
  },
  {
    id: 'harmony-create',
    testID: 'harmony-card-create',
    title: 'Create Your Own Story',
    backgroundImage: 'harmony/auroraforest.png',
    icon: 'icons/generative-ai.png',
    screen: 'Harmony',
    onPress: (navigation) => navigation.navigate('StoryPlayer', { storyId: 'mock-custom-story' }),
  },
  {
    id: 'harmony-explore',
    testID: 'harmony-card-explore',
    title: 'Explore the Forest',
    backgroundImage: 'harmony/auroraforestmap.png',
    subtext: 'Discover the Aurora Forest',
    icon: 'icons/magnifying-glass.png',
    screen: 'Harmony',
    onPress: (navigation) => navigation.navigate('ForestMap'),
  },
  // StoryPlayer Cards
  {
    id: 'story-soothing',
    testID: 'story-card-soothing',
    title: 'Soothing Storytime',
    backgroundImage: 'characters/birkandfreya.png',
    screen: 'StoryPlayer',
    mode: 'soothing',
    onPress: (navigation, storyId) => navigation.navigate('StoryViewer', { storyId, mode: 'soothing' }),
  },
  {
    id: 'story-choice',
    testID: 'story-card-choice',
    title: 'Make a Choice',
    backgroundImage: 'harmony/harmonycardbackground1.png',
    screen: 'StoryPlayer',
    mode: 'choice',
    onPress: (navigation, storyId) => navigation.navigate('StoryViewer', { storyId, mode: 'choice' }),
  },
  {
    id: 'story-daily',
    testID: 'story-card-daily',
    title: 'Story of the Day',
    backgroundImage: 'harmony/auroraforest.png',
    screen: 'StoryPlayer',
    mode: 'daily',
    onPress: (navigation, storyId) => navigation.navigate('StoryViewer', { storyId, mode: 'daily' }),
  },
  // HomeScreen Cards
  {
    id: 'home-harmony',
    testID: 'home-card-harmony',
    title: 'Harmony',
    backgroundImage: 'harmony/harmonycardbackground1.png',
    screen: 'Home',
    onPress: (navigation) => navigation.navigate('Harmony'),
  },
  {
    id: 'home-care',
    testID: 'home-card-care',
    title: 'Care',
    backgroundImage: 'care/carecardbackground1.png',
    screen: 'Home',
    onPress: (navigation) => navigation.navigate('Care'),
  },
  {
    id: 'home-wonder',
    testID: 'home-card-wonder',
    title: 'Wonder',
    backgroundImage: 'wonder/wondercardbackground1.png',
    screen: 'Home',
    onPress: (navigation) => navigation.navigate('Wonder'),
  },
];

export const resolveAsset = (path: string): any => {
  const assetMap: { [key: string]: any } = {
    'characters/birkandfreya.png': require('../assets/png/characters/birkandfreya.png'),
    'harmony/auroraforest.png': require('../assets/png/harmony/auroraforest.png'),
    'harmony/auroraforestmap.png': require('../assets/png/harmony/auroraforestmap.png'),
    'harmony/harmonycardbackground1.png': require('../assets/png/harmony/harmonycardbackground1.png'),
    'icons/generative-ai.png': require('../assets/png/icons/generative-ai.png'),
    'icons/magnifying-glass.png': require('../assets/png/icons/magnifying-glass.png'),
    'care/carecardbackground1.png': require('../assets/png/care/carecardbackground1.png'),
    'wonder/wondercardbackground1.png': require('../assets/png/wonder/wondercardbackground1.png'),
  };
  return assetMap[path] || null;
};
