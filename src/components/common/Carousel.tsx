// src/components/common/Carousel.tsx
import React from 'react';
import { Dimensions, ViewStyle, TouchableOpacity, ImageBackground, Text, FlatList } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';

interface CarouselItem {
  id: string;
  title?: string;
  image?: any;
  backgroundColor?: string;  // use solid color if provided
  onPress: () => void;
}

interface Props {
  data: CarouselItem[];
  config: { w: number; h: number; r: number; center?: boolean};
}

const { width: screenW, height: screenH } = Dimensions.get('window');

const StyledItem = styled(TouchableOpacity)<{ style: ViewStyle }>`
  overflow: hidden;
`;

// fallback container for solid‑color cards
const ItemContainer = styled.View<{ bg?: string }>`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  background-color: ${({ bg }: { bg?: string }) => bg || 'transparent'};
`;

const ItemImage = styled(ImageBackground)`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`;

const ItemTitle = styled(Text)`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.bold};
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.sizes.body}px;
  text-align: center;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
`;

export const ReusableCarousel: React.FC<Props> = ({ data, config }) => {
const theme = useTheme();
  const itemWidth = screenW * config.w;
  const itemHeight = screenH * config.h;
  const pageWidth = itemWidth + theme.spacing.small * 2;
  const isCentered = Boolean(config.center);
    const initialIndex = React.useMemo(
    () => (isCentered ? Math.floor(Math.random() * data.length) : 0),
    []
    );
  const sidePadding = config.center
  ? (screenW - itemWidth) / 2
  : theme.spacing.small;



  const style: ViewStyle = {
    width: itemWidth,
    height: itemHeight,
    borderRadius: config.r,
    borderWidth: theme.carousel.stroke,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.small
  };

    return (
            <FlatList
              data={data}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
        
              // center the first/last items
              contentContainerStyle={{
                paddingHorizontal: sidePadding,
              }}
        
              // ensure one “page” per card  margins
              snapToInterval={pageWidth}
              decelerationRate="fast"
              initialScrollIndex={initialIndex}
              getItemLayout={(_, index) => ({
                length: pageWidth,
                offset: sidePadding + pageWidth * index,
                index,
            })}
        
              renderItem={({ item }) => (
                <StyledItem style={style} onPress={item.onPress}>
                  {item.image ? (
                    <ItemImage source={item.image} resizeMode="cover">
                      {item.title && <ItemTitle>{item.title}</ItemTitle>}
                    </ItemImage>
                  ) : (
                    <ItemContainer bg={item.backgroundColor}>
                      {item.title && <ItemTitle>{item.title}</ItemTitle>}
                    </ItemContainer>
                  )}
                </StyledItem>
              )}
            />
          );
};