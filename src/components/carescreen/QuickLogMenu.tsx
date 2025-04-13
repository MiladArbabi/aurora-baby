// src/components/carescreen/QuickLogMenu.tsx
import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import MenuHandleBar from '../common/MenuHandleBar';
import SleepIcon from '../../assets/icons/carescreen/quick-log-menu/SleepIcon';
import AwakeIcon from '../../assets/icons/carescreen/quick-log-menu/AwakeIcon';
import FeedIcon from '../../assets/icons/carescreen/quick-log-menu/FeedIcon';
import DiaperIcon from '../../assets/icons/carescreen/quick-log-menu/DiaperIcon';
import MoodIcon from '../../assets/icons/carescreen/quick-log-menu/MoodIcon';
import CardsIcon from '../../assets/icons/carescreen/quick-log-menu/CardsIcon';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const QuickLogMenu: React.FC<Props> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity testID="menu-handle" onPress={onClose}>
            <MenuHandleBar />
          </TouchableOpacity>
          <View style={styles.buttonGrid}>
            <TouchableOpacity testID="log-sleep">
              <SleepIcon />
            </TouchableOpacity>
            <TouchableOpacity testID="log-awake">
              <AwakeIcon />
            </TouchableOpacity>
            <TouchableOpacity testID="log-feed">
              <FeedIcon />
            </TouchableOpacity>
            <TouchableOpacity testID="log-diaper">
              <DiaperIcon />
            </TouchableOpacity>
            <TouchableOpacity testID="log-mood">
              <MoodIcon />
            </TouchableOpacity>
            <TouchableOpacity testID="log-voice">
              <CardsIcon />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  sheet: {
    backgroundColor: '#000',
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
    gap: 25 // Use margin if gap isn't supported yet
  }
});

export default QuickLogMenu;