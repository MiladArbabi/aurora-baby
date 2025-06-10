// src/components/common/ActionButtons.tsx
import React, { useCallback } from "react"
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native"
import AiLogGeneratorButton from "../../assets/whispr/AiLogGenerator"
import QuickLogButton from "../carescreen/QuickLogButton"
import { askWhispr } from "../../services/LlamaLogGenerator"
import { QuickLogEntry } from "../../models/LogSchema"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
// Icon size will be 10% of screen width
const ICON_SIZE = SCREEN_WIDTH * 0.10
// Spacing from edges will be 5% of screen dimensions
const HORIZONTAL_SPACING = SCREEN_WIDTH * 0.05
const VERTICAL_SPACING   = SCREEN_HEIGHT * 0.05
// Spacing between buttons equals horizontal spacing
const BUTTON_SPACING = HORIZONTAL_SPACING

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
  const handleAi = useCallback(async () => {
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
  }, [recentLogs, onNewAiLog])

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="ai-log-generator-button"
        onPress={handleAi}
        activeOpacity={0.7}
        style={styles.buttonWrapper}
      >
        <AiLogGeneratorButton
          width={ICON_SIZE}
          height={ICON_SIZE}
        />
      </TouchableOpacity>

      <TouchableOpacity
        testID="action-menu"
        onPress={onQuickLogPress}
        activeOpacity={0.7}
        style={[styles.buttonWrapper, { marginLeft: BUTTON_SPACING }]}
      >
        <QuickLogButton
          width={ICON_SIZE}
          height={ICON_SIZE}
        />
      </TouchableOpacity>
    </View>
  )
}

export default ActionButtons

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: VERTICAL_SPACING,
    right: HORIZONTAL_SPACING,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonWrapper: {
    padding: ICON_SIZE * 0.2,           // 20% of icon size for touch target
    borderRadius: (ICON_SIZE * 1.4) / 2, // keep tappable area roughly circular
    backgroundColor: "transparent",
  },
})
