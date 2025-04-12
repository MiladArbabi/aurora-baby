import React, { ReactNode, useImperativeHandle, forwardRef, useState } from 'react';
import { View } from 'react-native';

interface BottomSheetProps {
  snapPoints: number[]; 
  index?: number;
  onChange?: (index: number) => void;
  children: ReactNode;
  style?: any;
  backgroundStyle?: any;
}

const BottomSheet = forwardRef(({ snapPoints, index = 0, onChange, children }: BottomSheetProps, ref) => {
  const [currentIndex, setCurrentIndex] = useState(index);

  useImperativeHandle(ref, () => ({
    snapToIndex: (newIndex: number) => {
      if (onChange) onChange(newIndex);
      setCurrentIndex(newIndex);
    },
    getIndex: () => currentIndex,
    close: () => {
      if (onChange) onChange(0);
      setCurrentIndex(0);
    }
  }));

  return <View testID="mock-bottom-sheet">{children}</View>;
});

export default Object.assign(BottomSheet, { __esModule: true });