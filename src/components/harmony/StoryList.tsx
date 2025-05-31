// src/components/harmony/StoryList.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import type { Story } from '../../data/Stories';

interface StoryListProps {
  regionName: string;
  layerName: string;
  stories: Story[];
  onStorySelect: (storyId: string) => void;
  onBack: () => void;
}

export const StoryList: React.FC<StoryListProps> = ({
  regionName,
  layerName,
  stories,
  onStorySelect,
  onBack,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>
      Stories in {layerName} layer of {regionName}:
    </Text>
    <FlatList
      data={stories}
      keyExtractor={(item) => item.id}
      style={{ width: '100%' }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.storyItem}
          onPress={() => onStorySelect(item.id)}
        >
          <View style={[styles.storyCircle, { backgroundColor: item.color }]} />
          <Text style={styles.storyTitle}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backText}>&larr; Back to layers</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
    color: '#334155',
    textAlign: 'center',
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#FFF',
    borderRadius: 8,
    width: '90%',
    elevation: 2,
  },
  storyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  storyTitle: {
    fontSize: 16,
    color: '#111827',
  },
  backButton: {
    marginTop: 12,
  },
  backText: {
    color: '#4B5563',
    textDecorationLine: 'underline',
  },
});
