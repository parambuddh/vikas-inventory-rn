import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

export const LoginScreen = ({ navigation }) => {
  const { handleLogin } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLoginPress = () => {
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    if (handleLogin(username, password)) {
      setUsername('');
      setPassword('');
      // Navigation will be handled by the main App component
    } else {
      setError('Invalid username or password');
    }
  };

  const handleDemoLogin = (role) => {
    setError('');
    const credentials = {
      salesman: { username: 'salesman', password: '1234' },
      admin: { username: 'admin', password: '1234' },
    };

    if (handleLogin(credentials[role].username, credentials[role].password)) {
      setUsername('');
      setPassword('');
    } else {
      setError('Login failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Vikas Marketing</Text>
            <Text style={styles.subtitle}>Inventory & Sales Management</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={COLORS.gray400}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLoginPress}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Demo Logins */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Accounts</Text>
              <TouchableOpacity
                style={[styles.demoButton, styles.salesmanButton]}
                onPress={() => handleDemoLogin('salesman')}
              >
                <Text style={styles.demoButtonText}>👤 Salesman</Text>
                <Text style={styles.demoButtonSubtext}>Demo Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoButton, styles.adminButton]}
                onPress={() => handleDemoLogin('admin')}
              >
                <Text style={styles.demoButtonText}>👨‍💼 Admin</Text>
                <Text style={styles.demoButtonSubtext}>Demo Login</Text>
              </TouchableOpacity>
            </View>

            {/* Credentials Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Demo Credentials</Text>
              <Text style={styles.infoText}>
                Salesman: salesman / 1234
              </Text>
              <Text style={styles.infoText}>
                Admin: admin / 1234
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray500,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    backgroundColor: COLORS.background,
    color: COLORS.gray900,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
  },
  passwordInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray900,
  },
  eyeIcon: {
    padding: SPACING.md,
  },
  eyeText: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.md,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: SPACING['2xl'],
    paddingTop: SPACING['2xl'],
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  demoTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  demoButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  salesmanButton: {
    backgroundColor: COLORS.secondaryLight,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  adminButton: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  demoButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  demoButtonSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray100,
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
    fontFamily: 'monospace',
  },
  error: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
});
