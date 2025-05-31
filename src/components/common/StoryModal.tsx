// src/components/common/StoryModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import type { Story } from '../../data/Stories';
import HarmonyIcon from '../../assets/bottomnavicons/HarmonyIcon';

interface StoryModalProps {
  visible: boolean;
  story: Story | null;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  visible,
  story,
  onClose,
}) => {
  if (!story) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconCircle,
                story.color.startsWith('bg-') ? {} : { backgroundColor: story.color },
              ]}
            >
              <HarmonyIcon fill="#4B5563" color="#4B5563" />
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText} testID="close-modal-button">
                ×
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.regionName}>{story.region}</Text>
          <Text style={styles.preview}>{story.preview}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.readButton}>
              <Text style={styles.readButtonText}>Read Story</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listenButton}>
              <Text style={styles.listenButtonText}>Listen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  regionName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  preview: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  readButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listenButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  listenButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
