// src/tests/screens/WhisprScreen.test.tsx
import React from 'react'
import {
  render,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react-native'
import { queryWhispr } from '../../services/WhisprService'
import WhisprScreen from '../../screens/WhisprScreen'

jest.mock('../../services/WhisprService')
const mockedQuery = queryWhispr as jest.MockedFunction<typeof queryWhispr>

describe('WhisprScreen', () => {
  it(
    'sends a prompt and displays the GPT response',
    async () => {
      mockedQuery.mockResolvedValueOnce('This is a GPT response from Whispr.')

      const { getByPlaceholderText, getByTestId } = render(<WhisprScreen />)
      const input = getByPlaceholderText('Ask Whispr')
      const sendBtn = getByTestId('send-button')

      fireEvent.changeText(input, 'What is baby sleep tracking?')
      fireEvent.press(sendBtn)

      const response = await waitFor(() => getByTestId('response-text'))
      expect(response.props.children).toBe(
        'This is a GPT response from Whispr.'
      )
    },
    10000
  )

  it('shows a loading indicator while waiting for the response', async () => {
    mockedQuery.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve('Response'), 500)
        )
    )

    const { getByPlaceholderText, getByTestId } = render(<WhisprScreen />)
    const input = getByPlaceholderText('Ask Whispr')
    const sendBtn = getByTestId('send-button')

    fireEvent.changeText(input, 'Tell me a bedtime story')
    fireEvent.press(sendBtn)

    expect(getByTestId('loading-spinner')).toBeTruthy()
    await waitForElementToBeRemoved(() => getByTestId('loading-spinner'))
  })

  it('disables Send button and shows spinner while loading', async () => {
    mockedQuery.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve('ok'), 100)
        )
    )

    const { getByPlaceholderText, getByTestId } = render(<WhisprScreen />)
    const input = getByPlaceholderText('Ask Whispr')
    const sendBtn = getByTestId('send-button')

    fireEvent.changeText(input, 'test')
    fireEvent.press(sendBtn)

    // Immediately after press...
    expect(sendBtn.props.accessibilityState.disabled).toBe(true)
    expect(getByTestId('loading-spinner')).toBeTruthy()

    // Once the promise resolves...
    await waitFor(() => {
      expect(sendBtn.props.accessibilityState.disabled).toBe(false)
      expect(() => getByTestId('loading-spinner')).toThrow()
    })
  })

  it('tapping a suggestion sends that prompt automatically', async () => {
    mockedQuery.mockResolvedValueOnce('Reply!')

    const { getByText, getByTestId } = render(<WhisprScreen />)

    fireEvent.press(getByText('Sleep'))

    const sendBtn = getByTestId('send-button')
    expect(sendBtn.props.accessibilityState.disabled).toBe(true)

    await waitFor(() => {
      const r = getByTestId('response-text')
      expect(r.props.children).toBe('Reply!')
    })
  })

  it('renders each exchanged message in the response bubble', async () => {
    mockedQuery
      .mockResolvedValueOnce('First reply')
      .mockResolvedValueOnce('Second reply')

    const {
      getByPlaceholderText,
      getByTestId,
      getAllByTestId,
    } = render(<WhisprScreen />)
    const input = getByPlaceholderText('Ask Whispr')
    const sendBtn = getByTestId('send-button')

    // first send
    fireEvent.changeText(input, 'First prompt')
    fireEvent.press(sendBtn)
    await waitFor(() =>
      expect(getAllByTestId('response-text')).toHaveLength(1)
    )

    // second send
    fireEvent.changeText(input, 'Second prompt')
    fireEvent.press(sendBtn)
    await waitFor(() =>
      expect(getAllByTestId('response-text')).toHaveLength(2)
    )
  })

  it('auto-scrolls to the bottom when a new message arrives', async () => {
    const scrollToEndMock = jest.fn()
    const { getByTestId } = render(<WhisprScreen />)
    WhisprScreen.__setScrollRefMock(scrollToEndMock)

    fireEvent.changeText(getByTestId('input'), 'Hello')
    fireEvent.press(getByTestId('send-button'))

    await waitFor(() => {
      expect(scrollToEndMock).toHaveBeenCalledWith({ animated: true })
    })
  })
})
