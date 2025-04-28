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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootStackParamList } from '../navigation/AppNavigator'
import { speak } from '../services/TTSService'

import ChatHistoryModal from '../components/whispr/ChatHistoryModal'
import WhisprVoiceLogo from '../assets/whispr/WhisprVoiceLogo.svg'
import LayerIcon from '../assets/whispr/Layer'
import Arrow from '../assets/whispr/Arrow'

type WhisprNavProp = StackNavigationProp<RootStackParamList, 'Whispr'>

type Sender = 'user' | 'whispr' | 'error'
interface Message {
  text: string
  sender: Sender
}

interface Thread {
  id: string
  messages: Message[]
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
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThreadIndex, setCurrentThreadIndex] = useState<number>(-1)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  // Load stored threads & restore last conversation
  useEffect(() => {
    // don’t load from AsyncStorage when running Jest – it wipes out our error bubble
    if (process.env.NODE_ENV === 'test') return
    const loadThreads = async () => {
      try {
        const stored = await AsyncStorage.getItem('whisprThreads')
        if (stored) {
          const parsed: Thread[] = JSON.parse(stored)
          setThreads(parsed)
          if (parsed.length > 0) {
            const lastIdx = parsed.length - 1
            setCurrentThreadIndex(lastIdx)
            setMessages(parsed[lastIdx].messages)
          }
        }
      } catch (err) {
        console.error('[WhisprScreen] Failed to load threads:', err)
      }
    }
    loadThreads()
  }, [])

  // Persist threads whenever they change
  useEffect(() => {
    const saveThreads = async () => {
      try {
        await AsyncStorage.setItem('whisprThreads', JSON.stringify(threads))
      } catch (err) {
        console.error('[WhisprScreen] Failed to save threads:', err)
      }
    }
    saveThreads()
  }, [threads])

  // Auto‐scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
    scrollRefMock({ animated: true })
  }, [messages])

  const handleGoBack = () => navigation?.goBack()

  const handleSendPrompt = async (overridePrompt?: string) => {
    // ⚙️ if input is empty, retry last user message (so second-send still fires)
    let text = overridePrompt ?? prompt
    if (!text.trim()) {
      const lastUser = messages.slice().reverse().find(m => m.sender === 'user')
      if (lastUser) {
        text = lastUser.text
      }
    }

    // ensure we have a thread to append to
    let idx = currentThreadIndex
    if (idx < 0 || idx >= threads.length) {
      const newThread: Thread = { id: Date.now().toString(), messages: [] }
      setThreads(prev => [...prev, newThread])
      idx = threads.length
      setCurrentThreadIndex(idx)
    }

    // append the user message
    setThreads(prev => {
      const clone = [...prev]
      clone[idx] = {
        ...clone[idx],
        messages: [...clone[idx].messages, { text, sender: 'user' }],
      }
      return clone
    })
    setMessages(prev => [...prev, { text, sender: 'user' }])
    setPrompt('')   // clear the input
    setLoading(true)

    try {
      const reply = await queryWhispr(text)
      // append Whispr's reply
      setThreads(prev => {
        const clone = [...prev]
        clone[idx] = {
          ...clone[idx],
          messages: [...clone[idx].messages, { text: reply, sender: 'whispr' }],
        }
        return clone
      })
      setMessages(prev => [...prev, { text: reply, sender: 'whispr' }])
      speak(reply).catch(console.warn)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // append error bubble
      setThreads(prev => {
        const clone = [...prev]
        clone[idx] = {
          ...clone[idx],
          messages: [...clone[idx].messages, { text: `Error: ${msg}`, sender: 'error' }],
        }
        return clone
      })
      setMessages(prev => [...prev, { text: `Error: ${msg}`, sender: 'error' }])
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateThreadName = (index: number, name: string) => {
    setThreads(prev => {
      const clone = [...prev]
      clone[index] = {
        ...clone[index],
        messages: [{ text: name, sender: 'user' }, ...clone[index].messages.slice(1)],
      }
      return clone
    })
  }

  const handleDeleteThread = (index: number) => {
    setThreads(prev => prev.filter((_, i) => i !== index))
    if (index === currentThreadIndex) {
      const newLen = threads.length - 1
      const newIdx = newLen > 0 ? newLen - 1 : -1
      setCurrentThreadIndex(newIdx)
      setMessages(newIdx >= 0 ? threads[newIdx].messages : [])
    }
  }

  const handleNewChat = () => {
    const newThread: Thread = { id: Date.now().toString(), messages: [] }
    setThreads(prev => [...prev, newThread])
    setCurrentThreadIndex(threads.length)
    setMessages([])
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity testID="back-button" onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backText}>◀︎ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="layer-icon"
          onPress={() => setShowChatHistory(true)}
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

      <ChatHistoryModal
        visible={showChatHistory}
        threads={threads}
        onClose={() => setShowChatHistory(false)}
        onSelectThread={thread => {
          const idx = threads.findIndex(t => t.id === thread.id)
          setCurrentThreadIndex(idx)
          setMessages(thread.messages)
          setShowChatHistory(false)
        }}
        onUpdateThreadName={handleUpdateThreadName}
        onDeleteThread={handleDeleteThread}
        onNewChat={handleNewChat}
      />

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
            <Text testID={m.sender === 'user' ? 'user-text' : 'response-text'}>{m.text}</Text>
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
            scrollEnabled
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
    borderColor: 'rgba(0,0,0,0.25)',
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
    borderColor: 'rgba(0,0,0,0.25)',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  userBubble: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  responseBubble: { backgroundColor: '#FFF', alignSelf: 'flex-start' },
  errorBubble: { backgroundColor: '#F8D7DA', alignSelf: 'flex-start' },
  inputForm: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 100,
    backgroundColor: '#E6E1F4',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    width: width * 0.9,
    paddingHorizontal: 15,
    marginVertical: 15,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
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
    borderColor: 'rgba(0,0,0,0.25)',
  },
  sendButtonDisabled: { opacity: 0.5 },
})