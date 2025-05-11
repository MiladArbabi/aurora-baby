//src/components/Insights/PeriodSelector.tsx
import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'

type Props = {
  period: 'Daily'|'Weekly'|'Monthly',
  onChange: (p:Props['period'])=>void
}

export const PeriodSelector: React.FC<Props> = ({period,onChange}) => (
  <View style={styles.container}>
    {(['Daily','Weekly','Monthly'] as const).map(p=>(
      <TouchableOpacity key={p} onPress={()=>onChange(p)} style={[styles.btn, period===p && styles.active]}>
        <Text style={[styles.txt, period===p&&styles.txtActive]}>{p}</Text>
      </TouchableOpacity>
    ))}
  </View>
)

const styles=StyleSheet.create({
  container:{flexDirection:'row',backgroundColor:'rgba(255,255,255,0.1)',borderRadius:20},
  btn:{flex:1,padding:6,alignItems:'center'},
  active:{backgroundColor:'#FFF'},
  txt:{fontSize:12,color:'#DDD'},
  txtActive:{color:'#000',fontWeight:'600'},
})
