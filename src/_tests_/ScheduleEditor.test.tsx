import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import ScheduleEditor from '../components/carescreen/ScheduleEditor'
import { LogSlice } from '../models/index'

describe('ScheduleEditor', () => {
  const baseSlices: LogSlice[] = [
    {
      id: 'slice-1',
      babyId: 'baby1',
      category: 'sleep',
      startTime: '2025-06-09T00:00:00.000',
      endTime: '2025-06-09T06:00:00.000',
      createdAt: '2025-06-09T00:00:00.000',
      updatedAt: '2025-06-09T00:00:00.000',
      version: 1,
    },
    {
      id: 'slice-2',
      babyId: 'baby1',
      category: 'feed',
      startTime: '2025-06-09T06:00:00.000',
      endTime: '2025-06-09T07:00:00.000',
      createdAt: '2025-06-09T06:00:00.000',
      updatedAt: '2025-06-09T06:00:00.000',
      version: 1,
    },
  ]

  it('renders all provided slices', () => {
    const onSave = jest.fn()
    const onCancel = jest.fn()
    const { getByText } = render(
      <ScheduleEditor slices={baseSlices} onSave={onSave} onCancel={onCancel} />
    )

    // Expect slice labels or category names to appear
    expect(getByText(/sleep/i)).toBeTruthy()
    expect(getByText(/feed/i)).toBeTruthy()
  })

  it('calls onCancel when cancel button is pressed', () => {
    const onSave = jest.fn()
    const onCancel = jest.fn()
    const { getByText } = render(
      <ScheduleEditor slices={baseSlices} onSave={onSave} onCancel={onCancel} />
    )

    const cancelButton = getByText(/cancel/i)
    fireEvent.press(cancelButton)
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onSave with updated slices when save button is pressed', () => {
    const onSave = jest.fn()
    const onCancel = jest.fn()
    const { getByText } = render(
      <ScheduleEditor slices={baseSlices} onSave={onSave} onCancel={onCancel} />
    )

    // Simulate user modifying the schedule if needed
    // For now, just press save
    const saveButton = getByText(/save/i)
    fireEvent.press(saveButton)

    expect(onSave).toHaveBeenCalledWith(expect.arrayContaining(baseSlices))
  })
})
