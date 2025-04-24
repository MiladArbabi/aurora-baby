// src/tests/components/CareScreen/MiniNavBar.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MiniNavBar from '../../../components/carescreen/MiniNavBar';

describe('MiniNavBar', () => {
  it('renders all three navigation icons', () => {
    const { getByTestId } = render(<MiniNavBar />);

    expect(getByTestId('tracker-icon')).toBeTruthy();
    expect(getByTestId('graph-icon')).toBeTruthy();
    expect(getByTestId('cards-icon')).toBeTruthy();
  });

  it('calls correct callback on icon press', () => {
    const onNavigate = jest.fn();
    const { getByTestId } = render(<MiniNavBar onNavigate={onNavigate} />);

    fireEvent.press(getByTestId('graph-icon'));
    expect(onNavigate).toHaveBeenCalledWith('graph');

    fireEvent.press(getByTestId('tracker-icon'));
    expect(onNavigate).toHaveBeenCalledWith('tracker');

    fireEvent.press(getByTestId('cards-icon'));
    expect(onNavigate).toHaveBeenCalledWith('cards');
  });

  it('right-aligns contents in a container', () => {
    const { getByTestId } = render(<MiniNavBar />);
    const container = getByTestId('mini-navbar-container');

    // Container style should include flexDirection row and justifyContent flex-end
    expect(container.props.style).toMatchObject({
      flexDirection: 'row',
      justifyContent: 'flex-end',
    });
  });
});
