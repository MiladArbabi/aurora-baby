// src/screens/WhisprScreen.tsx
import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { queryWhispr } from '../services/WhisprService'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../navigation/AppNavigator'
import { speak } from '../services/TTSService'

import WhisprVoiceLogo from '../assets/whispr/WhisprVoiceLogo.svg'
import LayerIcon from '../assets/whispr/Layer'
import Arrow from '../assets/whispr/Arrow'

type WhisprNavProp = StackNavigationProp<RootStackParamList, 'Whispr'>

type Sender = 'user' | 'whispr' | 'error'
interface Message {
  text: string
  sender: Sender
}

let scrollRefMock: (opts: { animated: boolean }) => void = () => {}

function useSafeNavigation<T>() {
  try {
    return useNavigation<T>()
  } catch {
    return undefined
  }
}

const Logo = typeof WhisprVoiceLogo === 'function'
  ? WhisprVoiceLogo
  : () => <View style={{ width: 150, height: 150 }} />

const WhisprScreen: React.FC & {
  __setScrollRefMock: (fn: (opts: { animated: boolean }) => void) => void
} = () => {
  const navigation = useSafeNavigation<WhisprNavProp>()
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [threads, setThreads]   = useState<Message[][]>([])
  const [loading, setLoading]   = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    scrollRef.current?.scrollToEnd?.({ animated: true })
    scrollRefMock({ animated: true })
  }, [messages])

  const handleGoBack = () => navigation?.goBack()

  const handleSendPrompt = async (overridePrompt?: string) => {
    const text = overridePrompt ?? prompt
    if (!text.trim()) return

    setThreads(prev => {
      const lastThread = prev[prev.length - 1] || []
      const updatedThread: Message[] = [...lastThread, { text, sender: 'user' }]
      return prev.length
        ? [...prev.slice(0, -1), updatedThread]
        : [[{ text, sender: 'user' }]]
    })

    setMessages(prev => [...prev, { text, sender: 'user' }])
    setPrompt('')
    setLoading(true)

    try {
      const reply = await queryWhispr(text)
      setThreads(prev => {
        const last = prev[prev.length - 1] || []
        const updated: Message[] = [...last, { text: reply, sender: 'whispr' }]
        return [...prev.slice(0, -1), updated]
      })
      setMessages(prev => [...prev, { text: reply, sender: 'whispr' }])
      speak(reply).catch(console.warn);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setThreads(prev => {
        const last = prev[prev.length - 1] || []
        const updated: Message[] = [...last, { text: `Error: ${msg}`, sender: 'error' }]
        return [...prev.slice(0, -1), updated]
      })
      setMessages(prev => [...prev, { text: `Error: ${msg}`, sender: 'error' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          testID="back-button"
          onPress={handleGoBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>◀︎ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="layer-icon"
          onPress={() => setShowLayers(v => !v)}
          style={styles.layerButton}
        >
          <LayerIcon width={32} height={32} />
        </TouchableOpacity>
      </View>

      <Logo width={150} height={150} style={styles.logo} />
      <Text style={styles.greetingText}>Hello, I’m Whispr.</Text>

      <View testID="suggestions" style={styles.suggestions}>
        {['Sleep', 'Feeding', 'Diaper', 'Mood', 'Health'].map(item => (
          <TouchableOpacity
            key={item}
            style={styles.suggestionButton}
            onPress={() => handleSendPrompt(item)}
          >
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showLayers && (
        <View testID="layers-list" style={styles.layersOverlay}>
          {threads.map((thread, i) => {
            const header = thread.find(m => m.sender === 'user')?.text ?? `Chat ${i + 1}`
            return (
              <TouchableOpacity
                key={i}
                style={styles.layerItem}
                onPress={() => {
                  setMessages(thread)
                  setShowLayers(false)
                }}
              >
                <Text style={styles.layerHeader}>{header}</Text>
              </TouchableOpacity>
            )
          })}
          <TouchableOpacity
            style={styles.layerClose}
            onPress={() => setShowLayers(false)}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.messagesContainer} ref={scrollRef}>
        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.messageBubble,
              m.sender === 'user'
                ? styles.userBubble
                : m.sender === 'whispr'
                ? styles.responseBubble
                : styles.errorBubble,
            ]}
          >
            <Text testID={m.sender === 'user' ? 'user-text' : 'response-text'}>
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputForm} testID="whispr-input-form">
        <View style={styles.inputRow}>
          <TextInput
            testID="input"
            placeholder="Ask Whispr"
            multiline
            textAlignVertical="top"
            numberOfLines={4} 
            scrollEnabled={true}
            value={prompt}
            onChangeText={setPrompt}
            style={[styles.input, { height: 80 }]} 
          />
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            testID="send-button"
            onPress={() => handleSendPrompt()}
            disabled={loading}
            accessibilityState={{ disabled: loading }}
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          >
            <Arrow width={24} height={24} />
          </TouchableOpacity>
        </View>
        {loading && <Text testID="loading-spinner">Loading...</Text>}
      </View>
    </View>
  )
}

WhisprScreen.__setScrollRefMock = fn => {
  scrollRefMock = fn
}

export default WhisprScreen

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3A5C4',
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#000' },
  layerButton: { padding: 8 },
  logo: { alignSelf: 'center', marginVertical: 16 },
  greetingText: {
    fontFamily: 'Edrosa',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 16,
    color: '#000',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  suggestionButton: {
    width: 111,
    height: 35,
    borderRadius: 25,
    backgroundColor: '#E9DAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionText: { 
    fontFamily: 'Edrosa', 
    fontSize: 13, 
    color: '#000', 
    borderColor: 'rgba(0,0,0,0.25)' 
  },
  messagesContainer: {
    flex: 1,
    width: width * 0.9,
    backgroundColor: '#E9DAFA',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)'
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5
  },
  userBubble: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  responseBubble: { 
    backgroundColor: '#FFF', 
    alignSelf: 'flex-start',
   },
  errorBubble: { backgroundColor: '#F8D7DA', alignSelf: 'flex-start' },
  inputForm: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 100,               // doubled height
    backgroundColor: '#E6E1F4',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    width: width * 0.9,
    paddingHorizontal: 15,
    marginVertical: 15,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)'
  },
  inputRow: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonRow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    fontFamily: 'Edrosa',
    fontSize: 16,
    color: '#312C38',
    paddingTop: 15,
    paddingLeft: 5,
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#B3A5C4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)'
  },
  sendButtonDisabled: { opacity: 0.5 },
  layersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    justifyContent: 'center',
  },
  layerItem: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginVertical: 6 },
  layerHeader: { fontFamily: 'Edrosa', fontSize: 16, color: '#000' },
  layerClose: { marginTop: 16, alignSelf: 'center' },
})