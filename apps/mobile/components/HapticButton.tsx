import { type ReactNode } from 'react'
import { Pressable, type StyleProp, type ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'

interface HapticButtonProps {
  onPress: () => void
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export function HapticButton({ onPress, children, style }: HapticButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }, style]}
    >
      {children}
    </Pressable>
  )
}
