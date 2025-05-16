// src/data/home.ts
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../styles/theme';

type HomeNavProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const mainCarouselItems = (navigation: HomeNavProp) => [
  {
    id: 'care',
    image: require('../assets/png/care/carecardbackground1.png'),
    onPress: () => navigation.navigate('Care'),
  },
  {
    id: 'harmony',
    image: require('../assets/png/harmony/harmonycardbackground1.png'),
    onPress: () => navigation.navigate('Harmony'),
  },
  {
    id: 'wonder',
    image: require('../assets/png/wonder/wondercardbackground1.png'),
    onPress: () => navigation.navigate('Wonder'),
  },
];

export const featureItems = (navigation: HomeNavProp) => {
    const bg = [colors.primary, colors.accent, colors.highlight];
    return Array.from({ length: 5 }, (_, idx) => ({
        id: `feature-${idx}`,
        title: `Feature ${idx + 1}`,
        backgroundColor: bg[idx % bg.length],
        onPress: () => {
          /* TODO: handle feature-${idx} press */
        },
      }));
    };

export const categoryItems = (navigation: HomeNavProp) => {
const bg = [colors.primary, colors.accent, colors.highlight];
  return Array.from({ length: 6 }, (_, idx) => ({
    id: `category-${idx}`,
    title: `Category ${idx + 1}`,
    backgroundColor: bg[idx % bg.length],
    onPress: () => {
      /* TODO: handle category-${idx} press */
    },
  }));
};

export const gameItems = (navigation: HomeNavProp) => {
    const bg = [colors.primary, colors.accent, colors.highlight];
      return Array.from({ length: 4 }, (_, idx) => ({
        id: `game-${idx}`,
        title: `Game ${idx + 1}`,
        backgroundColor: bg[idx % bg.length],
        onPress: () => {
          /* TODO: handle game-${idx} press */
        },
      }));
    };
