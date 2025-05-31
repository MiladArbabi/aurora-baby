// src/components/common/RegionButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';

interface RegionButtonProps {
  style: ViewStyle;
  color: string;
  hoverColor: string;
  onPress: () => void;
  testID?: string;
}

export const RegionButton: React.FC<RegionButtonProps> = ({
  style,
  color,
  hoverColor,
  onPress,
  testID,
}) => {
  const [pressed, setPressed] = useState(false);
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.8}
      style={[
        style,
        { backgroundColor: pressed ? hoverColor : color },
        styles.buttonShadow,
      ]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    />
  );
};

const styles = StyleSheet.create({
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
