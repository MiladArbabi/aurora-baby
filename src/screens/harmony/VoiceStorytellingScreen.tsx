// src/screens/harmony/VoiceStorytellingScreen.tsx
import React, { useRef } from 'react';
import { Dimensions, Animated, Pressable, StyleProp, ViewStyle } from 'react-native';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTTS } from '../../hooks/useTTS';
import TopNav from '../../components/common/TopNav';
import BottomNav from '../../components/common/BottomNav';
import BackButton from '../../assets/icons/common/BackButton';
import PlayIcon from '../../assets/harmonyscreen/voice/PlayIcon';
import PauseIcon from '../../assets/harmonyscreen/voice/PauseIcon';
import StopIcon from '../../assets/harmonyscreen/voice/StopIcon';

type Props = StackScreenProps<RootStackParamList, 'VoiceStorytelling'>;

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
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.darkAccent};
  border-width: 1px;
  border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  padding: 20px;
  justify-content: space-between;
`;

const BackWrapper = styled.TouchableOpacity`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
`;

const CardTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
  margin-top: 286px; 
`;

const StoryText = styled.Text`
  color: white;
  margin-top: 16px;
  font-size: 16px;
  text-align: left;
`;

const ControlRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-vertical: 20px; 
  padding-horizontal: 30px; 
`;

const ControlButton = styled.TouchableOpacity`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  padding: 10px 20px;
  border-radius: 8px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

type AnimButtonProps = {
  children: React.ReactNode
  onPress: () => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

const AnimatedIconButton: React.FC<AnimButtonProps> = ({
  children, onPress, disabled, style
}) => {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = () => {
    Animated.spring(scale, { 
      toValue: 0.9, 
      friction: 4, 
      tension: 100,
      useNativeDriver: true }).start()
  }
  const onPressOut = () => {
    Animated.spring(scale, { 
      toValue: 1, 
      friction: 4, 
      tension: 100,
      useNativeDriver: true }).start()
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  )
}

const VoiceStorytellingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { storyId, fullStory, title } = route.params ?? {};
  const theme = useTheme();
  const { speak, pause, stop, isSpeaking, isPaused } = useTTS();

  if (!storyId || !fullStory || !title) {

    return (
      <Container>
        <TopNav navigation={navigation} />
        <Card>
          <CardTitle>Story not found</CardTitle>
          <StoryText>Missing or invalid story data. Please return and try again.</StoryText>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <TopNav navigation={navigation} />
      <Card>
        <BackWrapper onPress={() => navigation.goBack()}>
          <BackButton fill={theme.colors.primary} />
        </BackWrapper>
        <CardTitle>{title}</CardTitle>
        <StoryText>{fullStory}</StoryText>
      </Card>
      <ControlRow>
        <AnimatedIconButton onPress={pause} disabled={!isSpeaking || isPaused}>
          <PauseIcon fill={theme.colors.primary} />
        </AnimatedIconButton>

        <AnimatedIconButton 
          onPress={() => speak(fullStory, 0.8)} 
          disabled={isSpeaking && !isPaused}
          >
          <PlayIcon fill={theme.colors.primary} />
        </AnimatedIconButton>

        <AnimatedIconButton onPress={stop} disabled={!isSpeaking}>
          <StopIcon fill={theme.colors.primary} />
        </AnimatedIconButton>
      </ControlRow>
      <BottomNav navigation={navigation} activeScreen="Harmony" />
      </Container>
  );
};

export default VoiceStorytellingScreen;