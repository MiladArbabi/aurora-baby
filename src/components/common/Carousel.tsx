// src/components/common/Carousel.tsx
import React from 'react'
import { Dimensions, ViewStyle, FlatList } from 'react-native'
import styled, { useTheme, DefaultTheme } from 'styled-components/native'
import { Card } from './Card'

const { width: screenW, height: screenH } = Dimensions.get('window')

interface CarouselItem {
  id: string
  title?: string
  image?: any
  backgroundColor?: string
  onPress: () => void
}

interface Props {
  data: CarouselItem[]
  // we’re no longer needing w/h here—Card handles sizing
  config: keyof DefaultTheme['card']
}

export const ReusableCarousel: React.FC<Props> = ({ data, config }) => {
  const theme = useTheme()

  // extract card sizing from theme
  const { widthFactor, heightFactor, borderRadius } = theme.card[config]
  const itemWidth = screenW * widthFactor
  const itemHeight = screenH * heightFactor
  const pageWidth = itemWidth + theme.spacing.small * 2
  const sidePadding = theme.spacing.small
  
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: sidePadding }}
      snapToInterval={pageWidth}
      decelerationRate="fast"
      renderItem={({ item }) => (
        <Card
          variant={config}
          onPress={item.onPress}
          style={{
            marginHorizontal: theme.spacing.small,
            // override Card’s own sizing so we can snap properly
            width: itemWidth,
            height: itemHeight,
            borderRadius,
          }}
          background={item.backgroundColor}
        >
          {item.image
            ? <ImageBackground source={item.image} style={{ flex: 1, borderRadius, overflow: 'hidden' }}>
                {item.title && <Title>{item.title}</Title>}
              </ImageBackground>
            : item.title && <TitleOverlay><Title>{item.title}</Title></TitleOverlay>
          }
        </Card>
      )}
    />
  )
}

// styled-components for image/title
const ImageBackground = styled.ImageBackground`
  flex: 1;
  justify-content: flex-end;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`

const TitleOverlay = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
`

const Title = styled.Text`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.bold};
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.sizes.body}px;
  text-align: center;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
`
