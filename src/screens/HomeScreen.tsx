import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { DefaultTheme } from 'styled-components/native';
import { saveLastScreen } from '../services/LastScreenTracker';
import BottomNav from '../components/common/BottomNav';
import Card from '../components/common/Card';
import TopNav from '../components/common/TopNav';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const CardsContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
  padding-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.sizes.bottomNavHeight + theme.spacing.xlarge}px;
`;

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
    </SafeAreaView>
  );
};

export default HomeScreen;