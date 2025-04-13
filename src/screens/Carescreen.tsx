// src/screens/CareScreen.tsx
import React, { useState } from 'react';
import { Text, Button, Modal, View, StyleSheet } from 'react-native';
import MiniNavBar from '../components/carescreen/MiniNavBar';

const CareScreen = () => {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracker' | 'graph' | 'cards'>('tracker');


  const openModal = () => {
    console.log('[DEBUG] Opening native modal...');
    setVisible(true);
  };

  const closeModal = () => {
    console.log('[DEBUG] Closing native modal...');
    setVisible(false);
  };

  return (
    <View style={styles.container}>
        <Text testID='care-placeholder'>CareScreen Placeholder</Text>
        
        <MiniNavBar
        onNavigate={(tab) => setActiveTab(tab.toLowerCase() as 'tracker' | 'graph' | 'cards')}
        />
        
        <Text testID="active-tab-indicator">Active Tab: {activeTab}</Text>

        <Button title="Open Sheet" testID='open-sheet' onPress={openModal} />
        
        <Modal
        animationType="slide"
        visible={visible}
        transparent={true}
        onRequestClose={closeModal}
        >

        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>This is the native modal</Text>
            <Button title="Close" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CareScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
