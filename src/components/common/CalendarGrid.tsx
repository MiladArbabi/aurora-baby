/// src/components/common/CalendarGrid.tsx
import React from 'react';
import { Text } from 'react-native';

export interface DateRange { start: Date; end: Date }

const CalendarGrid: React.FC<{
  year: number;
  month: number;
  onSelectDate: (range: DateRange) => void;
}> = ({ year, month, onSelectDate }) => (
  // for now we'll just fire a dummy range:
  <Text
    onPress={() =>
      onSelectDate({
        start: new Date(year, month, 1),
        end:   new Date(year, month, 1)
      })
    }
  >
    (calendar grid here)
  </Text>
);

export default CalendarGrid;
  