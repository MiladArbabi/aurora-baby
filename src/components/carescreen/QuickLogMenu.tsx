// src/components/carescreen/QuickLogMenu.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { saveQuickLogEntry } from '../../storage/QuickLogStorage';
import { QuickLogEntry } from '../../models/QuickLogSchema';
import MenuHandleBar from '../common/MenuHandleBar';

import SleepButton from '../../assets/carescreen/QuickLogMenu/AsleepButton';
import NotesButton from '../../assets/carescreen/QuickLogMenu/NotesButton';
import FeedButton from '../../assets/carescreen/QuickLogMenu/FeedingButton';
import DiaperButton from '../../assets/carescreen/QuickLogMenu/DiaperButton';
import MoodButton from '../../assets/carescreen/QuickLogMenu/MoodButton';
import HealthButton from '../../assets/carescreen/QuickLogMenu/HealthButton';

interface Props {
  onClose: () => void;
}

type LogType = 'sleep' | 'feeding' | 'diaper' | 'mood' | 'health' | 'note';

const QuickLogMenu: React.FC<Props> = ({ onClose }) => {
  const handleQuickLog = async (type: LogType) => {
    const entry: QuickLogEntry = {
      id: uuidv4(),
      babyId: 'baby-001',
      timestamp: new Date().toISOString(),
      type,
      version: 1,
      data: {} as any,
    };

    switch (type) {
      case 'sleep':
        entry.data = {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 60*60*1000).toISOString(),
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
      case 'health':
        entry.data = {
          // you can choose sensible defaults or leave blank
          temperature: undefined,
          symptoms: [],
          notes: 'Quick health check',
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
          <FeedButton    testID="log-feed"   onPress={() => handleQuickLog('feeding')} />
          <SleepButton   testID="log-sleep"  onPress={() => handleQuickLog('sleep')}  />
          <MoodButton    testID="log-mood"   onPress={() => handleQuickLog('mood')}   />
          <DiaperButton  testID="log-diaper" onPress={() => handleQuickLog('diaper')} />
          <NotesButton   testID="log-note"   onPress={() => handleQuickLog('note')}   />
          <HealthButton  testID="log-health" onPress={() => handleQuickLog('health')} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#453F4E',
  },
  sheet: {
    backgroundColor: '#453F4E',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
  },
  buttonGrid: {
    width: 310,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'flex-end',
    gap: 50,
  },
});

export default QuickLogMenu;