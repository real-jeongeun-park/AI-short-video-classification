import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }) {
  // TODO: 실제 로그인 연동 전까지 임시 상태값만 사용
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
       );
    
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.detail);
        return;
      }
  
      await SecureStore.setItemAsync("userId", String(data.user_id));
      await SecureStore.setItemAsync("nickname", String(data.nickname));
      await SecureStore.setItemAsync("email", String(data.email));
    
      navigation.replace('Main');
            
    } catch (error) {
      console.error(error);
      alert("로그인 실패");
    }
   };

  return (
    <View style={styles.container}>
      <Text style={[typography.h1, { color: colors.textPrimary }]}>로그인</Text>
      <Text style={styles.subtitle}>아이즈온에 오신 걸 환영합니다.</Text>

      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={styles.input}
        placeholder=""
        placeholderTextColor={colors.textPlaceholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={{ flex: 1 }} />

      <PrimaryButton title="로그인" onPress={handleLogin} />
      <Text style={styles.footerText}>
        계정이 없으신가요?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          회원가입
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg ,paddingTop: spacing.xl},
  subtitle: { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg },
  label: { color: colors.textSecondary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 56,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  footerText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  link: { color: colors.primary, fontWeight: '700' },
});
