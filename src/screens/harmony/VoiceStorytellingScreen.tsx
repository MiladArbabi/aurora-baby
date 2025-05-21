// src/screens/harmony/VoiceStorytellingScreen.tsx

import React from 'react'
import { View, Text, Animated, Dimensions } from 'react-native'
import styled, { useTheme, DefaultTheme } from 'styled-components/native'
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../navigation/AppNavigator'
import AuroraLogo from '../../assets/system/colorlogo'
import TopNav from '../../components/common/TopNav'
import BottomNav from '../../components/common/BottomNav'
import { useVoice } from '../../hooks/useVoice'
import { VoiceToggle } from '../../components/voice/VoiceToggle'
import { VoiceProgress } from '../../components/voice/VoiceProgress'
import { VoiceSpeedControl } from '../../components/harmonyscreen/VoiceSpeedControl'

type Props = StackScreenProps<RootStackParamList, 'VoiceStory'>
const { width: SCREEN_W } = Dimensions.get('window')

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`
const Content = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: center;
  align-items: center;
`
const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  margin-bottom: 16px;
`
const BodyText = styled.Text`
  font-size: 18px;
  line-height: 26px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  text-align: center;
  margin-bottom: 24px;
`

export default function VoiceStorytellingScreen({ route, navigation }: Props) {
  const theme = useTheme()
  const { storyId, fullStory = '' } = route.params
  const {
    play,
    pause,
    setRate,
    isSpeaking,
    progress,
    rate
  } = useVoice()
  const spinAnim = React.useRef(new Animated.Value(0)).current
  const [showContent, setShowContent] = React.useState(false)

  // logo spin on mount
  React.useEffect(() => {
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => setTimeout(() => setShowContent(true), 200))
  }, [])

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <Container>
      <TopNav navigation={navigation}/>
      {!showContent ? (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <Animated.View style={{ transform:[{ rotate: spin }] }}>
            <AuroraLogo width={120} height={120} fill={theme.colors.text}/>
          </Animated.View>
        </View>
      ) : (
        <Content>
          <Title>Read Aloud</Title>
          <BodyText>{fullStory}</BodyText>
          <VoiceToggle
            isSpeaking={isSpeaking}
            onPlay={() => play(fullStory)}
            onPause={pause}
          />
          <VoiceProgress progress={progress}/>
          <VoiceSpeedControl rate={rate} onChangeRate={setRate}/>
        </Content>
      )}
      <BottomNav navigation={navigation} activeScreen="Harmony"/>
    </Container>
  )
}
