// src/components/common/IconButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, GestureResponderEvent } from 'react-native';

interface IconButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onPress, children, style, testID }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.button, style]}
    testID={testID}
    activeOpacity={0.7}
  >
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E9DAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IconButton;