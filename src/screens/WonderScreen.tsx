//src/screens/WonderScreen.tsx
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveLastScreen } from '../services/LastScreenTracker';
import { DefaultTheme } from 'styled-components/native';
import BottomNav from '../components/common/BottomNav';
import TopNav from '../components/common/TopNav';
import { useActionMenuLogic } from '../hooks/useActionMenuLogic';
import ActionMenu from '../components/common/ActionMenu';
import QuickLogModal from '../components/common/QuickLogModal';
import QuickLogMenu from '../components/carescreen/QuickLogMenu';

const NAV_HEIGHT = 110;

type WonderScreenProps = StackScreenProps<RootStackParamList, 'Wonder'>;

const WonderScreen: React.FC<WonderScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const {
      quickLogMenuVisible,
      openQuickLog,
      closeQuickLog,
      handleVoiceCommand,
      } = useActionMenuLogic();


  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.darkAccent }} >
          <TopNav navigation={navigation} />
          <BottomNav navigation={navigation} activeScreen="Wonder" />
      </SafeAreaView>
      <ActionMenu
        style={styles.quickLogContainer}
        onQuickLogPress={openQuickLog}
        onWhisprPress={() => navigation.navigate('Whispr')}
        onMicPress={handleVoiceCommand}
      />
      <QuickLogModal visible={quickLogMenuVisible} onClose={closeQuickLog} />
    </View>
  );
};

export default WonderScreen;

const styles = StyleSheet.create({
  screen: {
     flex: 1,
     },
  quickLogContainer: {
      position: 'absolute',
      right: 20,
      bottom: NAV_HEIGHT + 20,
      alignItems: 'center',
    }
  });