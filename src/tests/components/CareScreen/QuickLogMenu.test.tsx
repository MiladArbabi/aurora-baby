import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import QuickLogMenu from '../../../components/carescreen/QuickLogMenu'

describe('QuickLogMenu', () => {
  it('renders all six logging buttons with icons', () => {
    const onClose = jest.fn()
    const onLogged = jest.fn()
    const { getByTestId } = render(
      <QuickLogMenu onClose={onClose} onLogged={onLogged} />
    )

    expect(getByTestId('log-sleep')).toBeTruthy()
    expect(getByTestId('log-feed')).toBeTruthy()
    expect(getByTestId('log-diaper')).toBeTruthy()
    expect(getByTestId('log-mood')).toBeTruthy()
    expect(getByTestId('log-note')).toBeTruthy()
    expect(getByTestId('log-health')).toBeTruthy()
  })

  it('calls onClose when handlebar is pressed', () => {
    const onClose = jest.fn()
    const { getByTestId } = render(<QuickLogMenu onClose={onClose} />)
    fireEvent.press(getByTestId('menu-handle'))
    expect(onClose).toHaveBeenCalled()
  })

  it('centers the handlebar horizontally', () => {
    const { getByTestId } = render(<QuickLogMenu onClose={() => {}} />)
    const handle = getByTestId('menu-handle')
    // style prop should include alignSelf: 'center'
    expect(handle.props.style).toMatchObject({ alignSelf: 'center' })
  })
})