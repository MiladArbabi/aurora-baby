import React from 'react';
import styled from 'styled-components/native';

const Spinner = styled.ActivityIndicator`
  opacity: 1;
`;

const LoadingSpinner: React.FC = () => {
  return <Spinner testID="loading-spinner" size="large" color="#007AFF" />;
};

export default LoadingSpinner;