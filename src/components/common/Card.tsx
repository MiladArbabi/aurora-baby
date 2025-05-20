import React from 'react'
import { Dimensions, ViewStyle, TouchableOpacityProps } from 'react-native'
import styled, { useTheme, DefaultTheme } from 'styled-components/native'

const { width: screenW, height: screenH } = Dimensions.get('window')

interface CardProps extends TouchableOpacityProps {
  variant: keyof DefaultTheme['card']  // "large" | "common" | "medium" | "game"
  background?: string
  children?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ 
  variant, 
  background, 
  children, 
  style: userStyle,
  ...rest 
}) => {
  const theme = useTheme()
  const cfg = theme.card[variant]
  const internalStyle: ViewStyle = {
    width: screenW * cfg.widthFactor,
    height: screenH * cfg.heightFactor,
    borderRadius: cfg.borderRadius,
    borderWidth: theme.carousel.stroke,
    borderColor: theme.colors.border,
    backgroundColor: background || theme.colors.secondaryBackground,
  }

return (
  <StyledTouchable
  // 4) merge your style with theirs
  style={[internalStyle, userStyle as ViewStyle]}
    {...rest}
    >
      {children}
  </StyledTouchable>  
)}


const StyledTouchable = styled.TouchableOpacity`
  overflow: hidden;
`