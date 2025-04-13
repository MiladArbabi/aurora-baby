// src/components/carescreen/QuickLogMenu.tsx
import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
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
  return (
    <View testID="quick-log-menu" style={styles.overlay}>
    <View style={styles.sheet}>
      <TouchableOpacity testID="menu-handle" onPress={onClose}>
        <MenuHandleBar />
      </TouchableOpacity>
      <View style={styles.buttonGrid}>
        <TouchableOpacity testID="log-sleep">
          <IconWrapper>
           <SleepIcon />
          </IconWrapper>
        </TouchableOpacity>
        <TouchableOpacity testID="log-awake">
          <IconWrapper>
           <AwakeIcon />
          </IconWrapper>
        </TouchableOpacity>
        <TouchableOpacity testID="log-feed">
          <IconWrapper>
            <FeedIcon />
          </IconWrapper>
        </TouchableOpacity>
        <TouchableOpacity testID="log-diaper">
        <IconWrapper>
          <DiaperIcon />
        </IconWrapper>
        </TouchableOpacity>
        <TouchableOpacity testID="log-voice">
         <IconWrapper>
            <VoiceIcon />
          </IconWrapper>
        </TouchableOpacity>
        <TouchableOpacity testID="log-mood">
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