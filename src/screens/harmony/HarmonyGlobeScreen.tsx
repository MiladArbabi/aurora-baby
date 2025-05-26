// src/screens/harmony/HarmonyGlobeScreen.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GlobeRenderer } from '../../components/globe/GlobeRenderer';
import BottomNav from '../../components/common/BottomNav';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = StackScreenProps<RootStackParamList, 'Harmony'>;

const HarmonyGlobeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.screen}>
      <GlobeRenderer
        onRegionPress={regionKey =>
          navigation.navigate('StoryWorld', { regionKey })
        }
      />
      <BottomNav navigation={navigation} activeScreen="Harmony" />
    </View>
  );
};

export default HarmonyGlobeScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
});