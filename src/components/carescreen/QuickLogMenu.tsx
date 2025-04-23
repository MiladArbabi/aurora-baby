import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native'
import { saveQuickLogEntry } from '../../storage/QuickLogStorage'
import { QuickLogEntry } from '../../models/QuickLogSchema'
import HandleBar from '../../assets/carescreen/QuickLogMenu/HandleBar'
import { generateId } from '../../utils/generateId'      // ← our new util

import SleepButton from '../../assets/carescreen/QuickLogMenu/AsleepButton'
import NotesButton from '../../assets/carescreen/QuickLogMenu/NotesButton'
import FeedButton from '../../assets/carescreen/QuickLogMenu/FeedingButton'
import DiaperButton from '../../assets/carescreen/QuickLogMenu/DiaperButton'
import MoodButton from '../../assets/carescreen/QuickLogMenu/MoodButton'
import HealthButton from '../../assets/carescreen/QuickLogMenu/HealthButton'

interface Props {
  onClose: () => void
  onLogged?: (entry: QuickLogEntry) => void
}

type LogType =
  | 'sleep'
  | 'feeding'
  | 'diaper'
  | 'mood'
  | 'health'
  | 'note'

const QuickLogMenu: React.FC<Props> = ({ onClose, onLogged }) => {
  const handleQuickLog = (type: LogType) => {
    console.log('[QuickLogMenu] handleQuickLog →', type)

    const entry: QuickLogEntry = {
      id: generateId(),       // ← pure-JS, no crypto
      babyId: 'baby-001',
      timestamp: new Date().toISOString(),
      type,
      version: 1,
      data: {} as any,
    }

    switch (type) {
      case 'sleep':
        entry.data = {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          duration: 60,
        }
        break
      case 'feeding':
        entry.data = {
          method: 'bottle',
          quantity: 100,
          notes: 'Quick log bottle feed',
        }
        break
      case 'diaper':
        entry.data = { status: 'wet', notes: 'Quick log wet diaper' }
        break
      case 'mood':
        entry.data = { emoji: '🙂', tags: ['calm'] }
        break
      case 'health':
        entry.data = {
          temperature: undefined,
          symptoms: [],
          notes: 'Quick health check',
        }
        break
      case 'note':
        entry.data = { text: 'Quick note added' }
        break
    }

    // 1) immediately show dot
    onLogged?.(entry)
    // 2) close sheet
    onClose()
    // 3) save in background
    saveQuickLogEntry(entry).catch(err =>
      console.error('[QuickLog] Failed to save entry:', err)
    )
  }

  const renderButton = (
    testID: string,
    onPress: (e: GestureResponderEvent) => void,
    Icon: React.FC<any>
  ) => (
    <TouchableOpacity
      key={testID}
      testID={testID}
      onPress={onPress}
      style={styles.cell}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon />
    </TouchableOpacity>
  )

  return (
    <View testID="quick-log-menu" style={styles.overlay}>
      <View style={styles.sheet}>
        <TouchableOpacity
        testID="menu-handle"
        onPress={onClose}
        style={styles.handleContainer}
        >
          <HandleBar />
        </TouchableOpacity>

        <View style={styles.row}>
          {renderButton('log-feed', () => handleQuickLog('feeding'), FeedButton)}
          {renderButton('log-sleep', () => handleQuickLog('sleep'), SleepButton)}
        </View>
        <View style={styles.row}>
          {renderButton('log-mood', () => handleQuickLog('mood'), MoodButton)}
          {renderButton('log-diaper', () => handleQuickLog('diaper'), DiaperButton)}
        </View>
        <View style={styles.row}>
          {renderButton('log-note', () => handleQuickLog('note'), NotesButton)}
          {renderButton(
            'log-health',
            () => handleQuickLog('health'),
            HealthButton
          )}
        </View>
      </View>
    </View>
  )
}

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
  },
  handleContainer: {
    alignSelf: 'center',
    marginBottom: 16,  
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
})

export default QuickLogMenu