// src/tests/screens/WhisprScreen.http.test.tsx
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import WhisprScreen from '../../screens/WhisprScreen'
import { queryWhispr } from '../../services/WhisprService'

// ① Mock out our HTTP client:
jest.mock('../../services/WhisprService')
const mockedQuery = queryWhispr as jest.MockedFunction<typeof queryWhispr>

describe('WhisprScreen (HTTP)', () => {
  beforeEach(() => mockedQuery.mockClear())

  it('calls queryWhispr and shows its reply', async () => {
    // Arrange
    mockedQuery.mockResolvedValueOnce('Hello from server!')

    const { getByPlaceholderText, getByTestId, getByText } = render(<WhisprScreen />)

    // Act: send a question
    fireEvent.changeText(getByPlaceholderText('Ask Whispr'), 'What’s up?')
    fireEvent.press(getByTestId('send-button'))

    // Assert: we hit our HTTP layer
    await waitFor(() => {
      expect(mockedQuery).toHaveBeenCalledWith('What’s up?')
    })

    // And the answer appears
    await waitFor(() => getByText('Hello from server!'))
  })

  it('displays an error bubble on network failure', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('network down'))

    const { getByPlaceholderText, getByTestId, getByText } = render(<WhisprScreen />)

    fireEvent.changeText(getByPlaceholderText('Ask Whispr'), 'Hey?')
    fireEvent.press(getByTestId('send-button'))

    await waitFor(() => getByText(/^Error:/))
    expect(getByText(/network down/)).toBeTruthy()
  })
})