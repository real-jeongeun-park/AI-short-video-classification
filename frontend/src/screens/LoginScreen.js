// LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import * as SecureStore from 'expo-secure-store';

import axios from 'axios';
import { Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.detail || "로그인에 실패했습니다.");
        return;
      }

      await SecureStore.setItemAsync("userId", String(data.user_id));
      await SecureStore.setItemAsync("nickname", String(data.nickname));
      await SecureStore.setItemAsync("email", String(data.email));

      navigation.replace('Main');
    } catch (error) {
      console.error(error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 상단 뒤로가기 화살표 버튼 (SignupScreen과 동일 위치) */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* 타이틀 영역 */}
        <Text style={[typography.h1, { color: colors.textPrimary }]}>
          로그인
        </Text>
        <Text style={styles.subtitle}>
          아이즈온에 오신 걸 환영합니다.
        </Text>

        {/* 닉네임/아이디 입력창 */}
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일을 입력하세요"
          placeholderTextColor={colors.textPlaceholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* 비밀번호 입력창 */}
        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor={colors.textPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* 로그인 버튼 */}
        <View style={styles.buttonWrapper}>
          <PrimaryButton title="로그인" onPress={handleLogin} />
        </View>

        {/* 회원가입 링크 */}
        <Text style={styles.footerText}>
          계정이 없으신가요?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
            회원가입
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: 40,
  },
  label: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 56,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  buttonWrapper: {
    marginTop: 200,
  },
  footerText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});