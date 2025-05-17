import React from 'react'
import { Text, View, FlatList } from 'react-native'
import styled from 'styled-components/native'
import type { DefaultTheme } from 'styled-components'
import type { WonderCardData } from '../../types/WonderCardData'
import { WonderCard } from './WonderCard'

interface Props {
  title: string
  data: WonderCardData[]
}

const WonderCardList: React.FC<Props> = ({ title, data }) => {
  if (data.length === 0) return null

  return (
    <SectionContainer>
      <SectionTitle>{title}</SectionTitle>
      <FlatList
        horizontal
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <WonderCard {...item} />}
        showsHorizontalScrollIndicator={false}
      />
    </SectionContainer>
  )
}

export default WonderCardList

const SectionContainer = styled(View)`
  margin-top: 8px;
  margin-bottom: 24px;
  padding-left: 16px;
`

const SectionTitle = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`
