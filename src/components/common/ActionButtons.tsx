// src/components/common/ActionButtons.tsx
import React from "react"
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native"
import AiLogGeneratorButton from "../../assets/whispr/AiLogGenerator"
import QuickLogButton from "./QuickLogButton"
import { askWhispr } from "../../services/LlamaLogGenerator"
import { QuickLogEntry } from "../../models/QuickLogSchema"

interface Props {
  onQuickLogPress: () => void
  recentLogs: QuickLogEntry[]
  onNewAiLog?: (raw: string) => void
}

const ActionButtons: React.FC<Props> = ({
  onQuickLogPress,
  recentLogs,
  onNewAiLog,
}) => {
  const handleAi = async () => {
    try {
      const prompt = `Here are the last logs:\n${
        JSON.stringify(recentLogs.slice(-5), null, 2)
      }\nSuggest the next 3 logs.`
      const raw = await askWhispr(prompt)
      onNewAiLog?.(raw)
      Alert.alert("AI Suggestions", raw)
    } catch {
      Alert.alert("Error", "Failed to generate AI logs.")
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="ai-log-generator-button"
        onPress={handleAi}
        activeOpacity={0.7}
        style={styles.buttonWrapper}
      >
        <AiLogGeneratorButton />
      </TouchableOpacity>

      <TouchableOpacity
        testID="action-menu"
        onPress={onQuickLogPress}
        activeOpacity={0.7}
        style={styles.buttonWrapper}
      >
        <QuickLogButton/>
      </TouchableOpacity>
    </View>
  )
}

export default ActionButtons

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20 + 110,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonWrapper: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: "transparent",
  },
})
