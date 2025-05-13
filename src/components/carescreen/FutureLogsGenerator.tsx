// src/components/carescreen/FutureLogsGenerator.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Menu, Provider as PaperProvider } from 'react-native-paper';
import  styled from 'styled-components/native';

// Props:
// onGenerate: callback receiving hoursAhead (number)
// options?: array of { label: string; value: number }

interface FutureLogsGeneratorProps {
  onGenerate: (hoursAhead: number) => void;
  options?: { label: string; value: number }[];
  buttonLabel?: string;
}

const defaultOptions = [
  { label: 'Next 24 hours', value: 24 },
  { label: 'Next 7 days', value: 168 },
];

const Container = styled(View)`
  align-self: center;
`;

export default function FutureLogsGenerator({
  onGenerate,
  options = defaultOptions,
  buttonLabel = 'Fill in logs',
}: FutureLogsGeneratorProps) {
  const [visible, setVisible] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>(buttonLabel);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleOptionPress = (opt: { label: string; value: number }) => {
    setSelectedLabel(opt.label);
    closeMenu();
    onGenerate(opt.value);
  };

  return (
    <PaperProvider>
      <Container>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          anchor={<Button mode="contained" onPress={openMenu}>{selectedLabel}</Button>}
        >
          {options.map(opt => (
            <Menu.Item
              key={opt.value}
              onPress={() => handleOptionPress(opt)}
              title={opt.label}
            />
          ))}
        </Menu>
      </Container>
    </PaperProvider>
  );
}
