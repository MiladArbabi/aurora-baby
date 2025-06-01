// src/screens/wonder/WonderScreen.tsx
import React from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import { Globe } from '../../components/globe/Globe';
import { STATIC_REGIONS } from '../../data/StaticRegions';
import BottomNav from '../../components/common/BottomNav';
import TopNav from '../../components/common/TopNav';

type Props = {
  navigation: any;
};

export const WonderScreen: React.FC<Props> = ({ navigation }) => {
  /**
   * Handler for when a region is tapped on the globe.
   * Right now we just console.log the regionId, but you could
   * navigate to some “WonderDetail” screen, open a modal, etc.
   */
  const onRegionPress = (regionId: string) => {
    console.log('WonderScreen → tapped region:', regionId);
    // e.g. navigation.navigate('SomeWonderDetail', { regionId });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top nav bar (if you have one) */}
      <TopNav navigation={navigation} />

      <View style={styles.container}>
        {/* A heading for your Wonder screen */}
        <Text style={styles.headerTitle}>Welcome to Wonder</Text>
        <Text style={styles.headerSubtitle}>
          Explore the world—tap a region to begin your wonderous journey!
        </Text>

        {/* 
          Here we render our reusable <Globe> component.
          - regions = STATIC_REGIONS (same data as Harmony’s globe)
          - diameter = 250 (adjust to taste)
          - onRegionPress = the callback above
        */}
        <Globe
          regions={STATIC_REGIONS}
          diameter={250}
          onRegionPress={onRegionPress}
        />

        {/* 
          You can put additional “WonderScreen” content below,
          for example buttons, carousels, etc. 
        */}
      </View>

      {/* Bottom nav (same as everywhere else) */}
      <BottomNav navigation={navigation} activeScreen="Wonder" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F9FF', // light sky‐blue background
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E40AF', // deep blue‐800
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4B5563', // gray‐700
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
});
