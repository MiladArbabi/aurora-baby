// src/tests/components/PastLogsView.test.tsx
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import PastLogsView from '../../screens/PastLogsView'
import { getLogsBetween } from '../../services/QuickLogAccess'
import { generateAIQuickLogs } from '../../services/LlamaLogGenerator'
import { QuickLogEntry } from '../../models/QuickLogSchema'

jest.mock('../../services/QuickLogAccess')
jest.mock('../../services/LlamaLogGenerator')

const realLogs: QuickLogEntry[] = [
    { id:'1', babyId:'b1', timestamp:'2025-05-01T08:00:00Z', type:'sleep', version:1, data:{ start:'2025-05-01T07:00:00Z', end:'2025-05-01T08:00:00Z', duration:60 } }
  ]
  const aiLogs: QuickLogEntry[] = [
    { id:'a1', babyId:'b1', timestamp:'2025-05-02T09:00:00Z', type:'feeding', version:1, data:{ method:'bottle', notes:'AI feed' } }
  ]

;(getLogsBetween as jest.Mock).mockResolvedValue(realLogs)
;(generateAIQuickLogs as jest.Mock).mockResolvedValue(aiLogs)

const mockGetLogsBetween = getLogsBetween as jest.MockedFunction<typeof getLogsBetween>
const mockGenerateAI = generateAIQuickLogs as jest.MockedFunction<typeof generateAIQuickLogs>

describe('PastLogsView', () => {
  const realEntries: QuickLogEntry[] = [
    { id: '1', babyId: 'b1', timestamp: '2025-05-01T08:00:00Z', type: 'sleep', version: 1, data: { start: '2025-05-01T07:00:00Z', end: '2025-05-01T08:00:00Z', duration: 60 } },
    { id: '2', babyId: 'b1', timestamp: '2025-05-02T09:30:00Z', type: 'feeding', version: 1, data: { method: 'bottle', quantity: 100, notes: '' } },
  ]

  const aiEntries: QuickLogEntry[] = [
    { id: 'a1', babyId: 'b1', timestamp: '2025-05-03T10:00:00Z', type: 'diaper', version: 1, data: { status: 'wet', notes: '' } },
  ]

  beforeEach(() => {
    mockGetLogsBetween.mockResolvedValue(realEntries)
    mockGenerateAI.mockResolvedValue(aiEntries)
  })

  it('loads and displays the real past logs', async () => {
    const { getByText } = render(<PastLogsView />)

    // Wait for real entries to appear
    await waitFor(() => {
      expect(getByText('sleep')).toBeTruthy()
      expect(getByText('feeding')).toBeTruthy()
    })

    // Timestamps are formatted in locale; ensure part of them show up
    expect(getByText(/10:00/)).toBeTruthy()
    expect(getByText(/11:30/)).toBeTruthy()
  })

  test('AI logs appear after pressing Generate', async () => {
    const { getByText, queryByText } = render(<PastLogsView />)
  
    // Wait for real log
    await waitFor(() => expect(getByText('sleep')).toBeTruthy())
  
    // Press button
    fireEvent.press(getByText('Generate AI-Suggested Logs'))
    // Loading
    expect(getByText('Generating...')).toBeTruthy()
  
    // Then AI log shows
    await waitFor(() => expect(getByText('feeding')).toBeTruthy())
  })
  
  it('shows a loading state then displays AI-suggested logs when button pressed', async () => {
    const { getByText, queryByText } = render(<PastLogsView />)

    // wait for real logs first
    await waitFor(() => expect(getByText('sleep')).toBeTruthy())

    const button = getByText('Generate AI-Suggested Logs')
    fireEvent.press(button)

    // immediately shows loading title
    expect(getByText('Generating...')).toBeTruthy()

    // after generation, AI entry should appear
    await waitFor(() => {
      // button text returns
      expect(getByText('Generate AI-Suggested Logs')).toBeTruthy()
      // AI section header
      expect(getByText('AI-Suggested Future Logs')).toBeTruthy()
      // AI entry type
      expect(getByText('diaper')).toBeTruthy()
    })

    // ensure real entries are still there
    expect(getByText('sleep')).toBeTruthy()
  })

  it('disables the button while generating', async () => {
    // make AI call take a moment
    mockGenerateAI.mockImplementation(() => new Promise(res => setTimeout(() => res(aiEntries), 100)))

    const { getByRole, getByText } = render(<PastLogsView />)
    await waitFor(() => expect(getByText('sleep')).toBeTruthy())
    // find the button by its accessibilityRole so we get the actual <Button /> wrapper
    const button = getByRole('button', { name: 'Generate AI-Suggested Logs' })

    fireEvent.press(button)
    // immediately disabled
    expect(button.props.accessibilityState?.disabled).toBe(true)

    await waitFor(() => {
      // back to enabled
      expect(button.props.accessibilityState?.disabled).toBe(false)
    })
  })
})
