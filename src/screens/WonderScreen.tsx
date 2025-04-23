// src/screens/WonderScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView as RNSafeAreaView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveLastScreen } from '../services/LastScreenTracker';
import BottomNav from '../components/common/BottomNav';
import TopNav from '../components/common/TopNav';
import ActionMenu from '../components/common/ActionMenu';
import QuickLogMenu from '../components/carescreen/QuickLogMenu';
import { useActionMenuLogic } from '../hooks/useActionMenuLogic';

type Props = StackScreenProps<RootStackParamList, 'Wonder'>;
const NAV_HEIGHT = 110;

const WonderScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { handleVoiceCommand } = useActionMenuLogic();

  // local quick-log sheet state
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const openQuickLog  = useCallback(() => setQuickLogVisible(true), []);
  const closeQuickLog = useCallback(() => setQuickLogVisible(false), []);

  // track last screen (optional)
  useEffect(() => {
    saveLastScreen('Wonder');
  }, []);

  return (
    <View style={styles.screen}>
      <RNSafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.colors.darkAccent }]}
      >
        <TopNav navigation={navigation} />
        <BottomNav navigation={navigation} activeScreen="Wonder" />
      </RNSafeAreaView>

      <ActionMenu
        style={styles.quickLogContainer}
        onQuickLogPress={openQuickLog}
        onWhisprPress={() => navigation.navigate('Whispr')}
        onMicPress={handleVoiceCommand}
      />

      {quickLogVisible && (
        <QuickLogMenu onClose={closeQuickLog} />
      )}
    </View>
  );
};

export default WonderScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  quickLogContainer: {
    position: 'absolute',
    right: 20,
    bottom: NAV_HEIGHT + 20,
    alignItems: 'center',
  },
});
