import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, SafeAreaView as RNSafeAreaView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import { saveLastScreen } from '../services/LastScreenTracker';
import BottomNav from '../components/common/BottomNav';
import Card from '../components/common/Card';
import TopNav from '../components/common/TopNav';
import ActionMenu from '../components/common/ActionMenu';
import QuickLogMenu from '../components/carescreen/QuickLogMenu';
import { QuickLogEntry } from '../models/QuickLogSchema';
import { QuickMarker } from '../components/carescreen/Tracker';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) =>
     theme.colors.background};
`;
const CardsContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: ${({ theme }: { theme: DefaultTheme }) => 
    theme.spacing.large}px;
  padding-bottom: ${({ theme }: { theme: DefaultTheme }) =>
    theme.sizes.bottomNavHeight + theme.spacing.xlarge}px;
`;

type Props = StackScreenProps<RootStackParamList, 'Home'>;
const NAV_HEIGHT = 110;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  // Quick-log sheet
  const [quickLogVisible, setQuickLogVisible] = useState(false);
  const [quickLogMarkers, setQuickLogMarkers] = useState<QuickMarker[]>([]);
  const openQuickLog = useCallback(() => setQuickLogVisible(true), []);
  const closeQuickLog = useCallback(() => setQuickLogVisible(false), []);

  // drop a dot on the tracker when log completes
  const handleLogged = useCallback((entry: QuickLogEntry) => {
    const t = new Date(entry.timestamp);
    const frac = (t.getHours() * 60 + t.getMinutes() + t.getSeconds() / 60) / 1440;
    setQuickLogMarkers((m) => [
      ...m,
      { id: entry.id, fraction: frac, color: '#000' },
    ]);
  }, []);

  useEffect(() => {
    saveLastScreen('Home');
  }, []);

  const cardData = [
    {
      testID: 'home-card-harmony',
      backgroundImage: require('../assets/png/harmony/harmonycardbackground1.png'),
      title: 'Harmony',
      onPress: () => navigation.navigate('Harmony'),
    },
    {
      testID: 'home-card-care',
      backgroundImage: require('../assets/png/care/carecardbackground1.png'),
      title: 'Care',
      onPress: () => navigation.navigate('Care'),
    },
    {
      testID: 'home-card-wonder',
      backgroundImage: require('../assets/png/wonder/wondercardbackground1.png'),
      title: 'Wonder',
      onPress: () => navigation.navigate('Wonder'),
    },
  ];

  return (
    <View style={styles.screen}>
      <RNSafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <Container>
          <TopNav navigation={navigation} />
          <CardsContainer>
            {cardData.map((card) => (
              <Card
                key={card.testID}
                testID={card.testID}
                backgroundImage={card.backgroundImage}
                title={card.title}
                onPress={card.onPress}
              />
            ))}
          </CardsContainer>
          <BottomNav navigation={navigation} activeScreen="Home" />
        </Container>
      </RNSafeAreaView>

      <ActionMenu
        style={styles.quickLogContainer}
        onQuickLogPress={openQuickLog}
        onWhisprPress={() => navigation.navigate('Whispr')}
        onMicPress={() => {}}
      />

      {quickLogVisible && (
        <QuickLogMenu onClose={closeQuickLog} onLogged={handleLogged} />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  quickLogContainer: {
    position: 'absolute',
    right: 20,
    bottom: NAV_HEIGHT + 20,
    alignItems: 'center',
  },
});