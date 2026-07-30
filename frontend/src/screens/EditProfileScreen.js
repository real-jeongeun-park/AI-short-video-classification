import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme/colors';
import { mockUser } from '../data/mockData';

export default function EditProfileScreen({ navigation }) {
  const [username, setUsername] = useState(mockUser.username);
  const [email, setEmail] = useState(mockUser.email);

  // 아이디/이메일 필드별로 "지금 수정 중인지" 상태를 따로 관리
  const [editingField, setEditingField] = useState(null); // null | 'username' | 'email'

  const toggleEdit = (field) => {
    setEditingField((prev) => (prev === field ? null : field));
  };

  return (
    // 키보드가 올라올 때 화면(입력창)을 자동으로 밀어올려주는 역할
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>프로필 수정</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarWrap}>
          {mockUser.avatarUrl ? (
            <Image source={{ uri: mockUser.avatarUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient colors={[colors.primary, colors.danger]} style={styles.avatar}>
              <Feather name="user" size={40} color="#fff" />
            </LinearGradient>
          )}
          <TouchableOpacity style={styles.cameraBtn}>
            <Feather name="camera" size={16} color="#0A0A0F" />
          </TouchableOpacity>
        </View>

        {/* 아이디 */}
        <Text style={styles.label}>아이디</Text>
        <EditableRow
          value={username}
          onChangeText={setUsername}
          editing={editingField === 'username'}
          onToggle={() => toggleEdit('username')}
        />

        {/* 이메일 */}
        <Text style={styles.label}>이메일</Text>
        <EditableRow
          value={email}
          onChangeText={setEmail}
          editing={editingField === 'email'}
          onToggle={() => toggleEdit('email')}
          keyboardType="email-address"
        />

        {/* 비밀번호 */}
        <Text style={styles.label}>비밀번호</Text>
        <PasswordRow />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 아이디/이메일 공용: 평소엔 텍스트만 보여주고 "변경" 누르면 입력 가능 + "변경완료"로 전환
function EditableRow({ value, onChangeText, editing, onToggle, keyboardType }) {
  return (
    <View style={[styles.fieldRow, editing && styles.fieldRowEditing]}>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        editable={editing}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textPlaceholder}
      />
      <TouchableOpacity
        style={[styles.changeBtn, editing && styles.changeBtnActive]}
        onPress={onToggle}
      >
        <Text style={[styles.changeBtnText, editing && styles.changeBtnTextActive]}>
          {editing ? '변경완료' : '변경'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 비밀번호: 본인 확인(현재 비밀번호) → 새 비밀번호 입력 2단계 플로우
function PasswordRow() {
  const [step, setStep] = useState('idle'); // 'idle' | 'verify' | 'change'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  const resetAll = () => {
    setStep('idle');
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setError('');
  };

  const handleStart = () => {
    setStep('verify');
    setError('');
  };

  const handleVerify = () => {
    // TODO: 실제로는 서버에 현재 비밀번호 검증 요청
    if (currentPassword !== mockUser.password) {
      setError('현재 비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    setStep('change');
  };

  const handleChangeComplete = () => {
    if (newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    // TODO: 실제로는 서버에 새 비밀번호 저장 요청
    setError('');
    resetAll();
  };

  if (step === 'idle') {
    return (
      <View style={styles.fieldRow}>
        <Text style={styles.passwordPlaceholder}>비밀번호 변경</Text>
        <TouchableOpacity style={styles.changeBtn} onPress={handleStart}>
          <Text style={styles.changeBtnText}>변경</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'verify') {
    return (
      <View>
        <View style={[styles.fieldRow, styles.fieldRowEditing]}>
          <TextInput
            style={styles.fieldInput}
            value={currentPassword}
            onChangeText={(t) => {
              setCurrentPassword(t);
              if (error) setError('');
            }}
            placeholder="현재 비밀번호 입력"
            placeholderTextColor={colors.textPlaceholder}
            secureTextEntry
            autoFocus
          />
          <TouchableOpacity onPress={resetAll} style={styles.cancelBtn}>
            <Feather name="x" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.changeBtn, styles.changeBtnActive]} onPress={handleVerify}>
            <Text style={styles.changeBtnTextActive}>확인</Text>
          </TouchableOpacity>
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  // step === 'change'
  return (
    <View>
      <View style={[styles.fieldRow, styles.fieldRowEditing]}>
        <TextInput
          style={styles.fieldInput}
          value={newPassword}
          onChangeText={(t) => {
            setNewPassword(t);
            if (error) setError('');
          }}
          placeholder="새 비밀번호 입력"
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry
          autoFocus
        />
      </View>
      <View style={[styles.fieldRow, styles.fieldRowEditing]}>
        <TextInput
          style={styles.fieldInput}
          value={newPasswordConfirm}
          onChangeText={(t) => {
            setNewPasswordConfirm(t);
            if (error) setError('');
          }}
          placeholder="새 비밀번호 확인"
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry
        />
        <TouchableOpacity onPress={resetAll} style={styles.cancelBtn}>
          <Feather name="x" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.changeBtn, styles.changeBtnActive]} onPress={handleChangeComplete}>
          <Text style={styles.changeBtnTextActive}>변경완료</Text>
        </TouchableOpacity>
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  avatarWrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: '38%',
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.background,
  },
  label: { color: colors.primary, marginBottom: spacing.sm, fontSize: 13 },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 56,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  fieldRowEditing: {
    borderColor: colors.primary,
  },
  fieldInput: {
    flex: 1,
    color: colors.textPrimary,
    height: '100%',
  },
  passwordPlaceholder: { color: colors.textPlaceholder, flex: 1 },

  changeBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  changeBtnActive: {
    backgroundColor: colors.primary,
  },
  changeBtnText: { color: colors.textPrimary, fontWeight: '600' },
  changeBtnTextActive: { color: '#0A0A0F' },

  cancelBtn: {
    marginLeft: spacing.sm,
    padding: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -spacing.sm + 4,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
});