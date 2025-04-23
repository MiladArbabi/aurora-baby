//src/tests/components/CareScreen/LogDetailModal.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import LogDetailModal from '../../../components/carescreen/LogDetailModal'
import { QuickLogEntry } from '../../../models/QuickLogSchema'

describe('LogDetailModal', () => {
  const sampleNote: QuickLogEntry = {
    id: 'note1',
    babyId: 'baby-001',
    timestamp: '2025-04-23T10:00:00Z',
    type: 'note',
    version: 1,
    data: { text: 'Baby had a little nap' },
  }

  it('renders nothing when visible=false', () => {
    const { queryByText } = render(
      <LogDetailModal
        visible={false}
        entry={sampleNote}
        onClose={() => {}}
      />
    )
    expect(queryByText('Baby had a little nap')).toBeNull()
  })

  it('renders the entry and calls onClose when backdrop or close pressed', () => {
    const onClose = jest.fn()
    const { getByText, getByTestId } = render(
      <LogDetailModal
        visible={true}
        entry={sampleNote}
        onClose={onClose}
      />
    )

    // detail text shows up
    expect(getByText('Baby had a little nap')).toBeTruthy()

    // press the close button
    fireEvent.press(getByTestId('log-detail-close'))
    expect(onClose).toHaveBeenCalled()

    // press backdrop
    fireEvent.press(getByTestId('log-detail-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})