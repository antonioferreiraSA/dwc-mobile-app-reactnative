import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import ChurchIcon from '@/components/ChurchIcon';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle, isGoogleSignInAvailable } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      Alert.alert('Login Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!isGoogleSignInAvailable) {
      Alert.alert(
        'Development Build Required', 
        'Google Sign-In requires a development build with native code. Please use email/password sign-in or create a development build with EAS Build.'
      );
      return;
    }

    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      Alert.alert('Google Sign-In Error', error.message);
    } else {
      router.replace('/(tabs)');
    }
    
    setGoogleLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <ChurchIcon size={100} />
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Destiny Worship Centre</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading || googleLoading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {isGoogleSignInAvailable && (
          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            <Image
              source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>
              {googleLoading ? 'Signing In...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/signup" style={styles.signupLink}>
            <Text style={styles.signupLinkText}>Sign Up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
  },
  header: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
  },
  signupLink: {
    marginLeft: 4,
  },
  signupLinkText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
});