import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingSpinner from '../../components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders a visible spinner', () => {
    const { getByTestId } = render(<LoadingSpinner />);
    const spinner = getByTestId('loading-spinner');
    expect(spinner).toBeTruthy();
    expect(spinner.props.style).toMatchObject({ opacity: 1 });
  });
});