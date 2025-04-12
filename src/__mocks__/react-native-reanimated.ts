export const useAnimatedStyle = () => ({});
export const useSharedValue = (value: any) => ({ value });
export const useAnimatedProps = () => ({});
export const withTiming = (toValue: any, config?: any, callback?: () => void) => {
  if (callback) callback();
  return toValue;
};
export const Easing = { bezier: jest.fn(), ease: jest.fn() };
export const createAnimatedComponent = (Component: any) => Component; // Simply return the component

export default {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  createAnimatedComponent,
};