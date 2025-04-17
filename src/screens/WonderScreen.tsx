import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveLastScreen } from '../services/LastScreenTracker';
import { DefaultTheme } from 'styled-components/native';
import BottomNav from '../components/common/BottomNav';
import TopNav from '../components/common/TopNav';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

type WonderScreenProps = StackScreenProps<RootStackParamList, 'Wonder'>;

const WonderScreen: React.FC<WonderScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  useEffect(() => {
    saveLastScreen('Home');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container>
        <TopNav navigation={navigation} />
        <BottomNav navigation={navigation} activeScreen="Wonder" />
      </Container>
    </SafeAreaView>
  );
};

export default WonderScreen;