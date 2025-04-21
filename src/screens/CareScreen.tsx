// src/screens/CareScreen.tsx
import React, { useCallback } from 'react';
import { Text, Modal, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useActionMenuLogic } from '../hooks/useActionMenuLogic';
import TopNav from '../components/common/TopNav';
import MiniNavBar from '../components/carescreen/MiniNavBar';
import BottomNav from '../components/common/BottomNav';
import Tracker from '../components/carescreen/Tracker';
import QuickLogMenu from '../components/carescreen/QuickLogMenu';
import ActionMenu from '../components/common/ActionMenu';
import QuickLogModal from "../components/common/QuickLogModal";
import type { MiniTab } from '../components/carescreen/MiniNavBar';

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>;

const NAV_HEIGHT = 110;

const CareScreen: React.FC = () => {
  const {
    modalVisible, quickLogMenuVisible, activeTab, setActiveTab,
    openModal, closeModal, openQuickLog, closeQuickLog, handleVoiceCommand,
  } = useActionMenuLogic();
  const navigation = useNavigation<CareNavProp>();

  const onNavigate = useCallback((screen: MiniTab) => {
    setActiveTab(screen);
  }, [setActiveTab]);

  return (
    <View style={styles.screen}>
      <View style={styles.rootWrapper}>
        <SafeAreaView testID="carescreen-gradient" style={styles.safeArea}>
          <View style={styles.container}>
            <TopNav navigation={navigation} />
            <View style={styles.miniNavWrapper}>
            <MiniNavBar onNavigate={onNavigate} />
            </View>
            <Text testID="active-tab-indicator" style={styles.tabIndicator}>
              Active Tab: {activeTab}
            </Text>
            <Tracker onPlusPress={openModal} activeTab={activeTab} />
            <QuickLogModal visible={modalVisible} onClose={closeModal} />
          </View>
          <BottomNav navigation={navigation} activeScreen="Care" />
        </SafeAreaView>
      </View>
       <ActionMenu
        style={styles.quickLogContainer}
        onQuickLogPress={openQuickLog}
        onWhisprPress={() => navigation.navigate('Whispr')}
        onMicPress={handleVoiceCommand}
      />
      {quickLogMenuVisible && <QuickLogMenu onClose={closeQuickLog} />}
      </View>
  );
};

export default CareScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  rootWrapper: {
    flex: 1,
    backgroundColor: '#A3FFF6',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#A3FFF6',
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  miniNavWrapper: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  tabIndicator: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'right',
  },
  quickLogContainer: {
    position: 'absolute',
    right: 20,
    bottom: NAV_HEIGHT + 20,
    alignItems: 'center',
  },
});