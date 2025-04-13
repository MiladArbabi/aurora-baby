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
});
