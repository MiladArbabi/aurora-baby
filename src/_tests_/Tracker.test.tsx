// src/components/carescreen/__tests__/Tracker.test.tsx
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import Tracker, { TrackerProps } from '../components/carescreen/Tracker'
import { LogSlice } from 'models'
import LogDetailModal from 'components/carescreen/LogDetailModal'
import { Text } from 'react-native-svg'

// we need to mock our Modal so it actually renders its children:
jest.mock('../LogDetailModal', () => {
  return ({ visible, slice }: { visible: boolean; slice: LogSlice }) =>
    visible ? (
      <MockModal testID="log-detail-modal">
        <Text testID="modal-category">{slice.category.toUpperCase()}</Text>
      </MockModal>
    ) : null
});

// A tiny helper so our mock modal can render children
const MockModal: React.FC<any> = ({ children, testID }) => (
  <>{children}</>
)

describe('Tracker', () => {
  const baseProps: Omit<TrackerProps, 'onSlicePress' | 'onSliceLongPress'> = {
    slices: [
      {
        id: '1',
        babyId: 'b1',
        category: 'sleep',
        startTime: '2025-06-09T00:00:00.000Z',
        endTime: '2025-06-09T06:00:00.000Z',
        createdAt: '2025-06-09T00:00:00.000Z',
        updatedAt: '2025-06-09T00:00:00.000Z',
        version: 1,
      },
      {
        id: '2',
        babyId: 'b1',
        category: 'awake',
        startTime: '2025-06-09T06:00:00.000Z',
        endTime: '2025-06-09T18:00:00.000Z',
        createdAt: '2025-06-09T06:00:00.000Z',
        updatedAt: '2025-06-09T06:00:00.000Z',
        version: 1,
      },
    ],
    nowFrac: 0.5,
    isEditingSchedule: false,
    confirmedIds: new Set(),
    aiSuggestedIds: new Set(),
  }

  it('opens LogDetailModal showing correct category when a slice is long-pressed', async () => {
    const onSlicePress = jest.fn()
    const onSliceLongPress = jest.fn()

    const { getByTestId, queryByTestId } = render(
      <Tracker
        {...baseProps}
        onSlicePress={onSlicePress}
        onSliceLongPress={(_hour) => {
          // the real Tracker sets internal state, so we do nothing here
        }}
      />
    )

    // before any long-press, modal should not be in tree
    expect(queryByTestId('log-detail-modal')).toBeNull()

    // simulate a long press on the SLEEP ring
    // We target the testID we gave CategoryRing for sleep:
    const sleepRing = getByTestId('sleep-ring')

    // fire longPress; payload has nativeEvent location inside the ring
    fireEvent(sleepRing, 'onSliceLongPress', {
      nativeEvent: { locationX: 100, locationY: 0 }, // roughly top-of-clock → hour 0
    })

    // now the modal should appear, showing "SLEEP"
    await waitFor(() => {
      expect(getByTestId('log-detail-modal')).toBeTruthy()
      expect(getByTestId('modal-category').props.children).toBe('SLEEP')
    })

    // similarly, long-pressing the awake ring shows AWAKE
    // first clear modal
    fireEvent(getByTestId('modal-category'), 'onPress') // or simply rerender
    expect(queryByTestId('log-detail-modal')).toBeNull()

    const awakeRing = getByTestId('awake-ring')
    fireEvent(awakeRing, 'onSliceLongPress', {
      nativeEvent: { locationX: 0, locationY: 100 }, // roughly right-of-clock → hour 6
    })

    await waitFor(() => {
      expect(getByTestId('log-detail-modal')).toBeTruthy()
      expect(getByTestId('modal-category').props.children).toBe('AWAKE')
    })
  })
})
