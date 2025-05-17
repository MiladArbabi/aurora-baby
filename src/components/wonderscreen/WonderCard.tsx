import React from 'react'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import styled, { useTheme, DefaultTheme } from 'styled-components/native'
import type { WonderCardData } from '../../types/WonderCardData'
import ARIcon from '../../assets/wonderscreen/ARIcon'
import VRIcon from '../../assets/wonderscreen/VRIcon'
import GameIcon from '../../assets/wonderscreen/GameIcon'

export const WonderCard: React.FC<WonderCardData> = ({
  title,
  thumbnail,
  ctaLabel,
  features = [],
}) => {
  const theme = useTheme()

  // Determine background color by feature type
  let bgColor: string = theme.colors.background
  if (features.includes('play')) {
    bgColor = theme.colors.primary    // Lavender for game cards
  } else if (features.includes('vr')) {
    bgColor = theme.colors.accent     // Teal for VR cards
  } else if (features.includes('ar')) {
    bgColor = theme.colors.tertiaryAccent  // Dusty Blue for AR cards
  }

  // pick the first matching icon
  let IconComponent: React.FC<any> | null = null
  if (features.includes('ar')) IconComponent = ARIcon
  else if (features.includes('vr')) IconComponent = VRIcon
  else if (features.includes('play')) IconComponent = GameIcon

  return (
    <CardContainer style={{ backgroundColor: bgColor }}>
      {IconComponent && (
        <IconWrapper>
          <IconComponent
            fill={theme.colors.text}
            width={24}
            height={24}
          />
        </IconWrapper>
      )}
      <Thumbnail source={{ uri: thumbnail }} />
      <Info>
        <Title numberOfLines={1}>{title}</Title>
        {ctaLabel && <CTA>{ctaLabel}</CTA>}
      </Info>
    </CardContainer>
  )
}

const CardContainer = styled(TouchableOpacity)`
  position: relative;
  width: 200px;
  margin-right: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) =>
     theme.colors.border};
`

const IconWrapper = styled(View)`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
`

const Thumbnail = styled(Image)`
  width: 100%;
  height: 120px;
`

const Info = styled(View)`
  padding: 8px;
`

const Title = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`

const CTA = styled(Text)`
  margin-top: 4px;
  font-size: 14px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`
