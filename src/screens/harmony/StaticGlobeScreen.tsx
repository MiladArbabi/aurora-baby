// src/components/harmony/StaticGlobeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Globe } from '../../components/globe/Globe';
import { STATIC_REGIONS, RegionDef, RegionLayerDef } from '../../data/StaticRegions';
import { STORIES, Story } from '../../data/Stories';
import { StoryModal } from '../../components/common/StoryModal';
import { LayerPicker } from '../../components/harmony/LayerPicker';
import { StoryList } from '../../components/harmony/StoryList';
import TopNav from '../../components/common/TopNav';
import BottomNav from '../../components/common/BottomNav';

type Props = {
  navigation: any; 
};

export const StaticGlobeScreen: React.FC<Props> = ({ navigation }) => {
  /****  UI State ****/
  // (1) Which region did the user tap?
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  // (2) Once a region is tapped, which layer did the user pick?
  const [selectedLayer, setSelectedLayer] = useState<
    'Surface' | 'Underwater' | 'Sky' | 'Undersurface' | null
  >(null);

  // (3) Once a layer is chosen, which exact storyId did they pick?
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  // Find the actual Story object (or null if none)
  const selectedStory: Story | null = selectedStoryId
    ? STORIES.find((s) => s.id === selectedStoryId) || null
    : null;

  // Helper: Given selectedRegionId, find its RegionDef
  const regionDef: RegionDef | undefined = selectedRegionId
    ? STATIC_REGIONS.find((r) => r.id === selectedRegionId)
    : undefined;

  // If we have (regionDef && selectedLayer), grab all story IDs in that layer
  const layerStoryIds: string[] =
    regionDef && selectedLayer
      ? regionDef.layers.find((l) => l.layer === selectedLayer)?.storyIds || []
      : [];

  // Map those IDs to actual Story objects
  const layerStories: Story[] = layerStoryIds
    .map((sid) => STORIES.find((s) => s.id === sid))
    .filter((s): s is Story => s !== undefined);

  /****  Callbacks ****/
  // Tapping the globe’s region buttons:
  const onRegionPressed = (regionId: string) => {
    setSelectedRegionId(regionId);
    setSelectedLayer(null);
    setSelectedStoryId(null);
  };

  // Tapping one of the four layer‐buttons:
  const onLayerPressed = (layer: RegionLayerDef['layer']) => {
    setSelectedLayer(layer);
    setSelectedStoryId(null);
  };

  // Tapping an individual story under a layer:
  const onStoryPressed = (storyId: string) => {
    setSelectedStoryId(storyId);
  };

  // Close StoryModal:
  const closeModal = () => {
    setSelectedStoryId(null);
  };

  // “Back” from layer picker to globe:
  const clearRegionSelection = () => {
    setSelectedRegionId(null);
    setSelectedLayer(null);
    setSelectedStoryId(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNav navigation={navigation} />

      <View style={styles.container}>
        <Text style={styles.headerTitle}>Story Globe</Text>
        <Text style={styles.headerSubtitle}>
          Tap a region → pick a layer → pick a story
        </Text>

        {/*
          1) If no region is selected → show the generic <Globe> component.
        */}
        {!selectedRegionId && (
          <Globe
            regions={STATIC_REGIONS}
            diameter={280}
            onRegionPress={onRegionPressed}
          />
        )}

        {/*
          2) If a region is selected but no layer yet → show <LayerPicker>.
        */}
        {selectedRegionId && !selectedLayer && (
          <LayerPicker
            regionName={regionDef?.regionName || ''}
            layers={regionDef?.layers || []}
            onLayerSelect={onLayerPressed}
            onBack={clearRegionSelection}
          />
        )}

        {/*
          3) If a region+layer is chosen but no story yet → show <StoryList>.
        */}
        {selectedRegionId && selectedLayer && !selectedStoryId && (
          <StoryList
            regionName={regionDef?.regionName || ''}
            layerName={selectedLayer}
            stories={layerStories}
            onStorySelect={onStoryPressed}
            onBack={() => setSelectedLayer(null)}
          />
        )}
      </View>

      {/*
        4) When a single story is chosen → show <StoryModal>.
      */}
      <StoryModal visible={!!selectedStory} story={selectedStory} onClose={closeModal} />

      <BottomNav navigation={navigation} activeScreen="Harmony" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    width: '100%',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6B21A8',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
});
