import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, typography } from '../theme/colors';

export default function PrimaryButton({
  title,
  onPress,
  variant = 'filled', // 'filled' | 'outline'
  color = colors.primary,
  loading = false,
  style,
}) {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading}
      style={[
        styles.base,
        isOutline
          ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color }
          : { backgroundColor: color },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? color : '#0A0A0F'} />
      ) : (
        <Text style={[typography.button, { color: isOutline ? color : '#0A0A0F' }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
