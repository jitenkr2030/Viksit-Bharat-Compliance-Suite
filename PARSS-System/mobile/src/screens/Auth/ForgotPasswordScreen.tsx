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
import { useNavigation } from '@react-navigation/native';
import { authStyles } from '../../constants/authStyles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement password reset API call
      // await authService.forgotPassword(email);
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email address.'
      );
      navigation.navigate('Login' as never);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Reset Password</Text>
      <Text style={authStyles.subtitle}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>

      <View style={authStyles.form}>
        <TextInput
          style={authStyles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TouchableOpacity
          style={[authStyles.button, loading && authStyles.buttonDisabled]}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={authStyles.buttonText}>Send Reset Instructions</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={authStyles.linkButton}
          onPress={navigateBack}
        >
          <Text style={authStyles.linkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}