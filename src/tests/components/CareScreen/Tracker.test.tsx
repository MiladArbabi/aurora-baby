// src/tests/components/CareScreen/Tracker.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import Tracker from '../../../components/carescreen/Tracker';

describe('Tracker', () => {
  it('renders the plus icon at the center', () => {
    const mockFn = jest.fn();
    const { getByTestId } = render(<Tracker onPlusPress={mockFn} />);
    expect(getByTestId('tracker-plus-button')).toBeTruthy();
  });
});
