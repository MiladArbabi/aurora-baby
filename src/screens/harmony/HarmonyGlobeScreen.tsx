// src/screens/harmony/HarmonyGlobeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import TopNav from '../../components/common/TopNav';
import BottomNav from '../../components/common/BottomNav';
import GlobeRenderer2D from '../../components/globe/GlobeRenderer';
import { regions } from '../../data/RegionMapSchema';

type Props = StackScreenProps<RootStackParamList, 'Harmony'>;

const HarmonyGlobeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.screen}>
      <TopNav navigation={navigation}/>
      <GlobeRenderer2D
        regions={regions}
        viewBoxSize={200}
        onRegionPress={regionKey =>
          navigation.navigate('StoryWorld', { regionKey })
        }
        initialRotation={[0, -25]}
        initialScale={1}
        autoRotateSpeed={20}
      />
      <BottomNav navigation={navigation} activeScreen="Harmony" />
    </View>
  );
};



export default HarmonyGlobeScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
});