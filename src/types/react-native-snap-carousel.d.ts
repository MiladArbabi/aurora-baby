declare module 'react-native-snap-carousel' {
    import { ComponentType } from 'react';
    import { ViewStyle } from 'react-native';
  
    interface CarouselProps<T> {
      data: T[];
      renderItem: (item: { item: T; index: number }) => JSX.Element;
      sliderWidth: number;
      itemWidth: number;
      layout?: 'default' | 'stack' | 'tinder';
      style?: ViewStyle;
    }
  
    const Carousel: ComponentType<CarouselProps<any>>;
    export default Carousel;
  }