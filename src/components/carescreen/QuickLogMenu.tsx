import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { saveQuickLogEntry } from '../../storage/QuickLogStorage';
import { QuickLogEntry } from '../../models/QuickLogSchema';
import MenuHandleBar from '../common/MenuHandleBar';
import SleepIcon from '../../assets/icons/carescreen/quick-log-menu/SleepIcon';
import AwakeIcon from '../../assets/icons/carescreen/quick-log-menu/AwakeIcon';
import FeedIcon from '../../assets/icons/carescreen/quick-log-menu/FeedIcon';
import DiaperIcon from '../../assets/icons/carescreen/quick-log-menu/DiaperIcon';
import MoodIcon from '../../assets/icons/carescreen/quick-log-menu/MoodIcon';
import VoiceIcon from '../../assets/icons/carescreen/quick-log-menu/VoiceIcon';

interface Props {
  onClose: () => void;
}

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}>
    {children}
  </View>
);

const QuickLogMenu: React.FC<Props> = ({ onClose }) => {
  const handleQuickLog = async (type: 'sleep' | 'feeding' | 'diaper' | 'mood' | 'note') => {
    const entry: QuickLogEntry = {
      id: uuidv4(),
      babyId: 'baby-001', // TODO: Replace with actual baby ID from context/store
      timestamp: new Date().toISOString(),
      type,
      version: 1,
      data: {} as any,
    };

    switch (type) {
      case 'sleep':
        entry.data = {
          start: new Date().toISOString(),
          end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
          duration: 60,
        };
        break;
      case 'feeding':
        entry.data = {
          method: 'bottle',
          quantity: 100,
          notes: 'Quick log bottle feed',
        };
        break;
      case 'diaper':
        entry.data = {
          status: 'wet',
          notes: 'Quick log wet diaper',
        };
        break;
      case 'mood':
        entry.data = {
          emoji: '🙂',
          tags: ['calm'],
        };
        break;
      case 'note':
        entry.data = {
          text: 'Quick note added',
        };
        break;
    }

    try {
      await saveQuickLogEntry(entry);
      console.log('[QuickLog] Entry saved:', entry);
    } catch (err) {
      console.error('[QuickLog] Failed to save entry:', err);
    }
  };

  return (
    <View testID="quick-log-menu" style={styles.overlay}>
      <View style={styles.sheet}>
        <TouchableOpacity testID="menu-handle" onPress={onClose}>
          <MenuHandleBar />
        </TouchableOpacity>

        <View style={styles.buttonGrid}>
          <TouchableOpacity testID="log-sleep" onPress={() => handleQuickLog('sleep')}>
            <IconWrapper>
              <SleepIcon />
            </IconWrapper>
          </TouchableOpacity>

          <TouchableOpacity testID="log-awake" onPress={() => handleQuickLog('note')}>
            <IconWrapper>
              <AwakeIcon />
            </IconWrapper>
          </TouchableOpacity>

          <TouchableOpacity testID="log-feed" onPress={() => handleQuickLog('feeding')}>
            <IconWrapper>
              <FeedIcon />
            </IconWrapper>
          </TouchableOpacity>

          <TouchableOpacity testID="log-diaper" onPress={() => handleQuickLog('diaper')}>
            <IconWrapper>
              <DiaperIcon />
            </IconWrapper>
          </TouchableOpacity>

          <TouchableOpacity testID="log-voice" onPress={() => handleQuickLog('note')}>
            <IconWrapper>
              <VoiceIcon />
            </IconWrapper>
          </TouchableOpacity>

          <TouchableOpacity testID="log-mood" onPress={() => handleQuickLog('mood')}>
            <IconWrapper>
              <MoodIcon />
            </IconWrapper>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#453F4E'
  },
  sheet: {
    backgroundColor: '#E6E1F4',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center'
  },
  buttonGrid: {
    width: 310,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-end',
    gap: 50 
  }
});

export default QuickLogMenu;