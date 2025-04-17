// src/screens/CareScreen.tsx
import React, { useState, useEffect } from 'react';
import { Text, Button, Modal, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getLogsGroupedByDate } from '../services/QuickLogAccess';
import { saveLastScreen } from '../services/LastScreenTracker';
import TopNav from '../components/common/TopNav';
import MiniNavBar from '../components/carescreen/MiniNavBar';
import BottomNav from '../components/common/BottomNav';
import Tracker from '../components/carescreen/Tracker';
import QuickLogMenu from '../components/carescreen/QuickLogMenu'; 


const CareScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'tracker' | 'graph' | 'cards'>('tracker');

    useEffect(() => {
      saveLastScreen('Home');
    }, []);

    useEffect(() => {
      const load = async () => {
        const logs = await getLogsGroupedByDate();
        console.log('[DEBUG] Grouped Logs:', logs);
      };
      load();
    }, []);

  const openModal = () => {
    console.log('[DEBUG] Opening native modal...');
    setVisible(true);
  };

  const closeModal = () => {
    console.log('[DEBUG] Closing native modal...');
    setVisible(false);
  };

  return (
  <View style={styles.rootWrapper}>
    <SafeAreaView testID="carescreen-gradient" style={{ flex: 1, backgroundColor: '#A3FFF6' }}>
      <View style={styles.container}>
        <TopNav navigation={navigation} />

        <View style={styles.miniNavWrapper}>
          <MiniNavBar onNavigate={(tab) => setActiveTab(tab.toLowerCase() as 'tracker' | 'graph' | 'cards')} />
        </View>
        <Text testID="active-tab-indicator" style={styles.tabIndicator}>
          Active Tab: {activeTab}
          </Text>

        <Tracker onPlusPress={openModal} activeTab={activeTab} />

        {/* Replace Modal with QuickLogMenu */}
        <Modal
          animationType="slide"
          visible={visible}
          transparent={true}
          onRequestClose={closeModal}
        >
          <QuickLogMenu onClose={closeModal} />
        </Modal>
      </View>
      <BottomNav navigation={navigation} activeScreen="Care" />
    </SafeAreaView>
  </View>
  );
};

export default CareScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20, // Y=20
      paddingHorizontal: 20, // X=20
    },
    rootWrapper: {
      flex: 1,
      backgroundColor: '#A3FFF6', 
    },
    miniNavWrapper: {
      marginTop: 30, // TopNav height is 50 + margin = ~Y=100
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      gap: 25, // future RN support; we’ll fallback to manual spacing for now
    },
    tabIndicator: {
      marginTop: 20,
      fontSize: 16,
      textAlign: 'right',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
      backgroundColor: '#000',
      padding: 24,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalText: {
      color: '#fff',
      fontSize: 18,
      marginBottom: 12,
    },
    safeArea: {
      flex: 1,
    },
  });  