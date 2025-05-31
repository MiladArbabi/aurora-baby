// src/components/harmony/LayerPicker.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { RegionLayerDef } from '../../data/StaticRegions';

interface LayerPickerProps {
  regionName: string;
  layers: RegionLayerDef[];
  onLayerSelect: (layer: RegionLayerDef['layer']) => void;
  onBack: () => void;
}

export const LayerPicker: React.FC<LayerPickerProps> = ({
  regionName,
  layers,
  onLayerSelect,
  onBack,
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>You tapped {regionName}. Choose a layer:</Text>
    {layers.map((layerDef) => {
      const count = layerDef.storyIds.length;
      return (
        <TouchableOpacity
          key={layerDef.layer}
          style={[
            styles.button,
            count === 0 && { backgroundColor: '#DDD' },
          ]}
          disabled={count === 0}
          onPress={() => onLayerSelect(layerDef.layer)}
        >
          <Text
            style={[
              styles.buttonText,
              count === 0 && { color: '#888' },
            ]}
          >
            {layerDef.layer} ({count} stories)
          </Text>
        </TouchableOpacity>
      );
    })}
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backText}>&larr; Back to globe</Text>
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
  button: {
    width: '80%',
    paddingVertical: 12,
    marginVertical: 6,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  backButton: {
    marginTop: 12,
  },
  backText: {
    color: '#4B5563',
    textDecorationLine: 'underline',
  },
});
