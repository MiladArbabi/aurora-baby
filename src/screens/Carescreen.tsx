import React, { useRef, useMemo } from 'react';
import { Text, Button, Platform } from 'react-native';
import styled from 'styled-components/native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';

const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;

const CareScreen = () => {
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => [200, 400], []);

  const openSheet = () => {
    console.log('[DEBUG] Opening sheet...');
    if (Platform.OS !== 'web') {
      sheetRef.current?.snapToIndex(1); // Always safe if index={-1} initially
    }
  };

  return (
    <Container>
      <Text testID="care-placeholder">CareScreen Placeholder</Text>
      <Button title="Open Sheet" testID="open-sheet" onPress={openSheet} />

      <Portal>
        <BottomSheet
          ref={sheetRef}
          index={-1} // Sheet starts hidden
          snapPoints={snapPoints}
          enablePanDownToClose
          onChange={(index) => console.log('[DEBUG] BottomSheet index changed:', index)}
        >
          <Text
            testID="bottom-sheet-content"
            style={{
              color: 'black',
              backgroundColor: 'white',
              padding: 20,
              textAlign: 'center',
            }}
          >
            Sheet Content
          </Text>
        </BottomSheet>
      </Portal>
    </Container>
  );
};

export default CareScreen;