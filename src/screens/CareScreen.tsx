// src/screens/CareScreen.tsx
import React, { useState, useEffect } from 'react';
import { Text, Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getLogsGroupedByDate } from '../services/QuickLogAccess';
import { saveLastScreen } from '../services/LastScreenTracker';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

import TopNav from '../components/common/TopNav';
import MiniNavBar from '../components/carescreen/MiniNavBar';
import BottomNav from '../components/common/BottomNav';
import Tracker from '../components/carescreen/Tracker';
import QuickLogMenu from '../components/carescreen/QuickLogMenu';
import QuickLogButton from '../components/common/QuickLogButton';
import MicIcon from '../components/common/MicButton';
import WhisprVoiceButton from '../components/common/WhisprVoiceButton';

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>;

const NAV_HEIGHT = 110;

const CareScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<CareNavProp>();
  const [visible, setVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracker' | 'graph' | 'cards'>('tracker');
  const { transcript, isListening, error, start, stop } = useVoiceRecorder();

  useEffect(() => {
    saveLastScreen('Home');
  }, []);

  useEffect(() => {
    (async () => {
      const logs = await getLogsGroupedByDate();
      console.log('[DEBUG] Grouped Logs:', logs);
    })();
  }, []);

  const handleOpenMenu = () => setMenuVisible(true);
  const handleCloseMenu = () => setMenuVisible(false);

  const startSpeechRecognition = async (): Promise<string> => {
    await start();
    await stop();
    return transcript;
  };

  const handleVoiceCommand = async () => {
    setMenuVisible(false);
    try {
      const spokenText = await startSpeechRecognition();
      console.log('Heard:', spokenText);
      // TODO: match intent or open note view
    } catch (e) {
      console.warn('Voice command failed:', e);
    }
  };

  const openModal = () => setVisible(true);
  const closeModal = () => setVisible(false);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.rootWrapper}>
        <SafeAreaView testID="carescreen-gradient" style={styles.safeArea}>
          <View style={styles.container}>
            <TopNav navigation={navigation} />
            <View style={styles.miniNavWrapper}>
              <MiniNavBar onNavigate={(tab) => setActiveTab(tab.toLowerCase() as any)} />
            </View>
            <Text testID="active-tab-indicator" style={styles.tabIndicator}>
              Active Tab: {activeTab}
            </Text>
            <Tracker onPlusPress={openModal} activeTab={activeTab} />
            <Modal
              animationType="slide"
              visible={visible}
              transparent
              onRequestClose={closeModal}
            >
              <QuickLogMenu onClose={closeModal} />
            </Modal>
          </View>
          <BottomNav navigation={navigation} activeScreen="Care" />
        </SafeAreaView>
      </View>
      <View style={styles.quickLogContainer}>
        <TouchableOpacity onPress={handleOpenMenu} testID="quick-log-open-button">
          <QuickLogButton width={50} height={50} />
        </TouchableOpacity>
        <View style={{ height: 20 }} />
        <TouchableOpacity
          onPress={() => navigation.navigate('Whispr')}
          testID="whispr-voice-button"
        >
          <WhisprVoiceButton />
        </TouchableOpacity>
        <View style={{ height: 20 }} />
        <TouchableOpacity onPress={handleVoiceCommand} testID="tracker-mic-button">
          <MicIcon width={50} height={50} />
        </TouchableOpacity>
      </View>
      {menuVisible && <QuickLogMenu onClose={handleCloseMenu} />}
    </View>
  );
};

export default CareScreen;

const styles = StyleSheet.create({
  rootWrapper: { flex: 1, backgroundColor: '#A3FFF6' },
  safeArea: { flex: 1, backgroundColor: '#A3FFF6' },
  container: { flex: 1, paddingTop: 20, paddingHorizontal: 20 },
  miniNavWrapper: { marginTop: 30, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start' },
  tabIndicator: { marginTop: 20, fontSize: 16, textAlign: 'right' },
  quickLogContainer: {
    position: 'absolute',
    right: 20,
    bottom: NAV_HEIGHT + 20,
    alignItems: 'center',
  },
});