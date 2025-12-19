import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { authStyles } from '../../constants/authStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register' as never);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>PARSS</Text>
      <Text style={authStyles.subtitle}>Sign in to your account</Text>

      <View style={authStyles.form}>
        <TextInput
          style={authStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
          style={authStyles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          style={[authStyles.button, loading && authStyles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={authStyles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={authStyles.linkButton}
          onPress={navigateToForgotPassword}
        >
          <Text style={authStyles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={authStyles.divider}>
          <View style={authStyles.dividerLine} />
          <Text style={authStyles.dividerText}>OR</Text>
          <View style={authStyles.dividerLine} />
        </View>

        <TouchableOpacity
          style={authStyles.secondaryButton}
          onPress={navigateToRegister}
        >
          <Text style={authStyles.secondaryButtonText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}