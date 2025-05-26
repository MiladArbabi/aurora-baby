// src/screens/harmony/StoryWorldScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { RegionMap } from '../../data/RegionMapSchema';

type StoryWorldProps = StackScreenProps<RootStackParamList, 'StoryWorld'>;

const StoryWorldScreen: React.FC<StoryWorldProps> = ({ route, navigation }) => {
  const { regionKey } = route.params;
  const region = RegionMap[regionKey];

  if (!region) {
    return (
      <View style={styles.center}>
        <Text>Unknown region “{regionKey}”</Text>
      </View>
    );
  }

  // Temporary placeholder sections; we'll replace with real storyMeta in a future issue
  const sections = [
    { id: 'surface', title: `${region.displayName} Surface Tales` },
    { id: 'underwater', title: `${region.displayName} Underwater Dreams` },
    { id: 'sky', title: `${region.displayName} Sky Quests` },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{region.displayName}</Text>
      <FlatList
        data={sections}
        keyExtractor={s => s.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('PlayStory', {
                storyId: `${regionKey}-${item.id}`, // stub ID
              })
            }
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default StoryWorldScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:    { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  card:      { padding: 12, marginVertical: 8, backgroundColor: '#eee', borderRadius: 8 },
  cardTitle:{ fontSize: 16 },
});
