// src/screens/HomeScreen.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView as RNSafeAreaView } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveLastScreen } from '../services/LastScreenTracker';
import BottomNav from '../components/common/BottomNav';
import TopNav from '../components/common/TopNav';
import { ReusableCarousel } from '../components/common/Carousel';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import { mainCarouselItems, featureItems, categoryItems, gameItems } from '../data/homeSections';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  const Section = styled.View`
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`;

const SectionHeader = styled.Text`
    font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.sizes.subtext}px;
    font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.bold};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
    margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
    margin-left: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  `;

  const headerMap: Record<string, string> = {
    feature: 'Features',
    category: 'Categories',
    game: 'Games',
  };

  useEffect(() => {
    saveLastScreen('Home');
  }, []);

  const sections = [
    { id: 'main',     items: mainCarouselItems, config: 'large'  as const },
    { id: 'game',     items: gameItems,         config: 'game'   as const },
    { id: 'feature',  items: featureItems,      config: 'common' as const },
    { id: 'category', items: categoryItems,     config: 'medium' as const },
  ];

  return (
    <View style={styles.screen}>
      <RNSafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Top navigation bar */}
        <TopNav navigation={navigation} />

        {/* Scrollable carousel sections */}
        <ScrollView
          contentContainerStyle={{
            paddingBottom: theme.sizes.bottomNavHeight + 75, // 👈 Prevent overlap
          }}
          showsVerticalScrollIndicator={false}
        >
          {sections.map(({ id, items, config }, idx) => (
            <Section key={`${id}-${idx}`}>
              {id !== 'main' && <SectionHeader>{headerMap[id]}</SectionHeader>}
              <ReusableCarousel data={items(navigation)} config={config} />
            </Section>
          ))}
        </ScrollView>

        {/* Bottom tab navigation */}
        <BottomNav navigation={navigation} activeScreen="Home" />
      </RNSafeAreaView>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
})