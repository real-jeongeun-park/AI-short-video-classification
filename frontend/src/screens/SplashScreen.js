import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import { Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <View style={styles.center}>
        <Image //로고 이미지
          source={require('../../img/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />  
        
        <Text style={[typography.h1, styles.title]}>AI's on</Text>
        <Text style={styles.subtitleKr}>아이즈온</Text>
        <Text style={styles.description}>숏폼 콘텐츠의 AI 생성 확률을 분석합니다</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="시작하기"
          onPress={() => navigation.navigate('Signup')}
        />
        <PrimaryButton
          title="로그인"
          variant="outline"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 120,
    height: 120,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { color: colors.textPrimary },
  subtitleKr: { color: colors.primary, fontSize: 18, fontWeight: '700', marginTop: 4 },
  description: { color: colors.textSecondary, marginTop: spacing.md, fontSize: 15 },
  footer: { paddingBottom: spacing.lg },
});
