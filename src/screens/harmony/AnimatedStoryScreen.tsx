import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

import TopNav from 'components/common/TopNav';
import BottomNav from 'components/common/BottomNav';
import AnimationIcon from 'assets/harmonyscreen/playstoryscreen/AnimationIcon';
import VoiceIcon from 'assets/harmonyscreen/playstoryscreen/VoiceIcon';
import TextIcon from 'assets/harmonyscreen/playstoryscreen/TextIcon';
import TestAnimation from '../../components/test_files/TestAnimation';

type Props = StackScreenProps<RootStackParamList, 'AnimatedStory'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const Card = styled.View`
  width: ${screenWidth * 0.9}px;
  height: ${screenHeight * 0.5}px;
  align-self: center;
  margin-top: 42px;
  margin-bottom: 24px;
  border-radius: 24px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  border-width: 1px;
  border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  padding: 20px;
  justify-content: flex-end;
`;

const IconRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
  padding-horizontal: 20px;
`;

const Label = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.secondaryBackground};
`;

const AnimatedStoryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { animationAsset, fullStory } = route.params;
  const theme = useTheme();
  const animationRef = useRef<LottieView>(null);
  const [mode, setMode] = useState<'cute' | 'voice' | 'text' | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/cute-sound.wav')
      );
      if (mounted) setSound(sound);
    })();
    return () => {
      mounted = false;
      sound?.unloadAsync();
    };
  }, []);

  const handlePlay = async () => {
    animationRef.current?.reset();
    animationRef.current?.play();
    if (mode === 'cute') {
      await sound?.replayAsync();
    } else if (mode === 'voice') {
      Speech.speak(fullStory, { pitch: 1, rate: 0.9 });
    }
    // 'text' mode = visuals only
  };

  // Map mode to TestAnimation type
  const animationType = mode === 'cute'
    ? 'bounce'
    : mode === 'voice'
      ? 'rotate'
      : 'pulse';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Container>
        <TopNav navigation={navigation} />
        <Card>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>
            Animated Story
          </Text>
          <View style={styles.animationWrapper}>
            {mode === 'text' ? (
              <LottieView
                ref={animationRef}
                source={animationAsset}
                loop={false}
                resizeMode="cover"
                style={styles.lottie}
              />
            ) : mode ? (
              <TestAnimation type={animationType} />
            ) : null}
          </View>
        </Card>

        <IconRow>
          <TouchableOpacity onPress={() => { setMode('cute'); handlePlay(); }}>
            <AnimationIcon fill={theme.colors.muted} />
            <Label>Cute Sounds</Label>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setMode('voice'); handlePlay(); }}>
            <VoiceIcon fill={theme.colors.muted} />
            <Label>Voice</Label>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setMode('text'); handlePlay(); }}>
            <TextIcon fill={theme.colors.muted} />
            <Label>Text + Anim</Label>
          </TouchableOpacity>
        </IconRow>

        <BottomNav navigation={navigation} activeScreen="Harmony" />
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  animationWrapper: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
  },
});

export default AnimatedStoryScreen;