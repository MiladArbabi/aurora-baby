// src/tests/components/CareScreen/QuickLogMenu.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import QuickLogMenu from '../../../components/carescreen/QuickLogMenu';

// Mocked props to test interaction
const mockOnClose = jest.fn();

describe('QuickLogMenu', () => {
  it('renders all six logging buttons with icons', () => {
    const { getByTestId } = render(<QuickLogMenu onClose={mockOnClose} />);

    expect(getByTestId('log-sleep')).toBeTruthy();
    expect(getByTestId('log-awake')).toBeTruthy();
    expect(getByTestId('log-feed')).toBeTruthy();
    expect(getByTestId('log-diaper')).toBeTruthy();
    expect(getByTestId('log-mood')).toBeTruthy();
    expect(getByTestId('log-voice')).toBeTruthy();
  });

  it('calls onClose when handlebar is pressed', () => {
    const { getByTestId } = render(<QuickLogMenu onClose={mockOnClose} />);


    fireEvent.press(getByTestId('menu-handle'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
