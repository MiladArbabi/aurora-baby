//src/components/carescreen/QuickLogMenu.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  Animated,
  Pressable,
  Dimensions
} from 'react-native';
import { saveQuickLogEntry } from '../../storage/LogRepository';
import { QuickLogEntry } from '../../models/LogSchema';
import HandleBar from '../../assets/carescreen/QuickLogMenu/HandleBar';
import { generateId } from '../../utils/generateId';
import { SvgProps } from 'react-native-svg';

import SleepButton from '../../assets/carescreen/QuickLogMenu/SleepButton';
import NotesButton from '../../assets/carescreen/QuickLogMenu/NotesButton';
import FeedButton from '../../assets/carescreen/QuickLogMenu/FeedingButton';
import DiaperButton from '../../assets/carescreen/QuickLogMenu/DiaperButton';
import MoodButton from '../../assets/carescreen/QuickLogMenu/MoodButton';
import HealthButton from '../../assets/carescreen/QuickLogMenu/HealthButton';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLogged?: (entry: QuickLogEntry) => void;
}

type LogType =
  | 'sleep'
  | 'feeding'
  | 'diaper'
  | 'mood'
  | 'health'
  | 'note';

type IconType = LogType | 'handle';

// Define icon size constant
const ICON_SIZE = 124; // Size for icons in the menu
const BOX_SIZE = ICON_SIZE + 20; // Box size with 10px padding on each side

// Define icon colors to match CardsView
const iconColors: Record<LogType, string> = {
  sleep: '#E6E1F4',
  feeding: '#E6E1F4',
  diaper: '#E6E1F4',
  mood: '#E6E1F4',
  health: '#E6E1F4',
  note: '#E6E1F4',
};

// Centralized icon configuration
const iconConfig: Record<
  IconType,
  { defaultWidth: number; defaultHeight: number; defaultFill: string }
> = {
  sleep: { defaultWidth: ICON_SIZE, defaultHeight: ICON_SIZE, defaultFill: '#E6E1F4' },
  feeding: { defaultWidth: ICON_SIZE, defaultHeight: ICON_SIZE, defaultFill: '#E6E1F4' },
  diaper: { defaultWidth: ICON_SIZE, defaultHeight: ICON_SIZE, defaultFill: '#E6E1F4' },
  mood: { defaultWidth: ICON_SIZE, defaultHeight: ICON_SIZE, defaultFill: '#E6E1F4' },
  health: { defaultWidth: ICON_SIZE, defaultHeight: ICON_SIZE, defaultFill: '#E6E1F4' },
  note: { defaultWidth: ICON_SIZE, defaultHeight: ICON_SIZE, defaultFill: '#E6E1F4' },
  handle: { defaultWidth: ICON_SIZE, defaultHeight: ICON_SIZE, defaultFill: '#E6E1F4' }, // Added for HandleBar
};

// Icon wrapper component
interface IconWrapperProps {
  IconComponent: React.FC<SvgProps>;
  type: IconType;
  width?: number;
  height?: number;
  fill?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({
  IconComponent,
  type,
  width,
  height,
  fill,
}) => {
  const config = iconConfig[type]; // TypeScript now knows 'handle' is valid
  return (
    <View style={[styles.iconBox, { borderColor: fill ?? config.defaultFill }]}>
      <IconComponent
        width={width ?? config.defaultWidth}
        height={height ?? config.defaultHeight}
        fill={fill ?? config.defaultFill}
      />
    </View>
  );
};

const screenHeight = Dimensions.get('window').height;

const QuickLogMenu: React.FC<Props> = ({ visible, onClose, onLogged }) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleQuickLog = (type: LogType) => {
    console.log('[QuickLogMenu] handleQuickLog →', type);

    const entry: QuickLogEntry = {
      id: generateId(),
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
          end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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
        entry.data = { status: 'wet', notes: 'Quick log wet diaper' };
        break;
      case 'mood':
        entry.data = { emoji: '🙂', tags: ['calm'] };
        break;
      case 'health':
        entry.data = {
          temperature: undefined,
          symptoms: [],
          notes: 'Quick health check',
        };
        break;
      case 'note':
        entry.data = { text: 'Quick note added' };
        break;
    }

    onLogged?.(entry);
    onClose();
    saveQuickLogEntry(entry).catch(err =>
      console.error('[QuickLog] Failed to save entry:', err)
    );
  };

  const renderButton = (
    testID: string,
    onPress: (e: GestureResponderEvent) => void,
    Icon: React.FC<any>,
    type: LogType
  ) => (
    <TouchableOpacity
      key={testID}
      testID={testID}
      onPress={onPress}
      style={styles.cell}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <IconWrapper IconComponent={Icon} type={type} />
    </TouchableOpacity>
  );

  return (
    visible ? (
      <Pressable
        testID="quick-log-overlay"
        onPress={onClose}
        style={styles.overlay}
      >
        <Pressable onPress={() => {}} style={{ flex: 1 }}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          <TouchableOpacity
            testID="menu-handle"
            onPress={onClose}
            style={styles.handleContainer}
          >
            <HandleBar />
          </TouchableOpacity>

          <View style={styles.row}>
            {renderButton('log-feed', () => handleQuickLog('feeding'), FeedButton, 'feeding')}
            {renderButton('log-sleep', () => handleQuickLog('sleep'), SleepButton, 'sleep')}
          </View>
          <View style={styles.row}>
            {renderButton('log-mood', () => handleQuickLog('mood'), MoodButton, 'mood')}
            {renderButton('log-diaper', () => handleQuickLog('diaper'), DiaperButton, 'diaper')}
          </View>
          <View style={styles.row}>
            {renderButton('log-note', () => handleQuickLog('note'), NotesButton, 'note')}
            {renderButton('log-health', () => handleQuickLog('health'), HealthButton, 'health')}
          </View>
        </Animated.View>
        </Pressable>
      </Pressable>
    ) : null
  );
};


const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,   // top:0,left:0,right:0,bottom:0
    zIndex: 100,
    elevation: 100,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',  // dim the background
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
    paddingHorizontal: 10,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  iconBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 2,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default QuickLogMenu;