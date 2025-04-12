import React, { ReactNode, forwardRef } from 'react';

export const GestureHandlerRootView = forwardRef<any, { children: ReactNode }>(({ children }, ref) => (
  <>{children}</>
));
GestureHandlerRootView.displayName = 'GestureHandlerRootView';

export const PanGestureHandler = forwardRef<any, { children: ReactNode }>(({ children }, ref) => (
  <>{children}</>
));
PanGestureHandler.displayName = 'PanGestureHandler';

export default {
  install: jest.fn(),
  GestureHandlerRootView,
  PanGestureHandler,
};