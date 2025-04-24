//src/components/common/ActionMenu.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import QuickLogButton from './QuickLogButton';
import WhisprVoiceButton from './WhisprVoiceButton';
import MicIcon from './MicButton';

type ActionMenuProps = {
  onQuickLogPress: () => void;
  onWhisprPress: () => void;
  onMicPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string
};

const ActionMenu: React.FC<ActionMenuProps> = ({
  onQuickLogPress,
  onWhisprPress,
  onMicPress,
  style,
  testID,
}) => (
  <View style={[styles.container, style]}>
    <View testID={testID} style={[styles.container, style]}>
    <TouchableOpacity onPress={onQuickLogPress} testID="quick-log-open-button">
      <QuickLogButton width={50} height={50} />
    </TouchableOpacity>

    <View style={styles.spacer} />

    <TouchableOpacity onPress={onWhisprPress} testID="whispr-voice-button">
      <WhisprVoiceButton />
    </TouchableOpacity>

    <View style={styles.spacer} />
    
    <TouchableOpacity onPress={onMicPress} testID="tracker-mic-button">
      <MicIcon width={50} height={50} />
    </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  spacer: { height: 20 },
});

export default ActionMenu;