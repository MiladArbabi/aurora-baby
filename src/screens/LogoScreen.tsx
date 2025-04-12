import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import styled from 'styled-components/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Logo: undefined;
  AppNavigator: undefined;
};

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #fff;
`;

interface LogoScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Logo'>;
}

const LogoScreen: React.FC<LogoScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('AppNavigator');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Container>
      <Image
        source={require('../assets/png/system/colorlogo.png')}
        style={{ width: 300, height: 300 }}
        testID="logo-image"
      />
    </Container>
  );
};

export default LogoScreen;