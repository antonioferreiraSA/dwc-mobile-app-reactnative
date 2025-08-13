import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import ChurchIcon from '@/components/ChurchIcon';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle, isGoogleSignInAvailable } = useAuth();

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      Alert.alert('Signup Error', error.message);
    } else {
      Alert.alert(
        'Success', 
        'Account created successfully! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }
    
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    if (!isGoogleSignInAvailable) {
      Alert.alert(
        'Development Build Required', 
        'Google Sign-In requires a development build with native code. Please use email/password sign-up or create a development build with EAS Build.'
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
        <Text style={styles.title}>Join Our Community</Text>
        <Text style={styles.subtitle}>Create an account to get started</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholderTextColor="#9CA3AF"
        />

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
          placeholder="Password (min 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9CA3AF"
        />

        <TouchableOpacity
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={loading || googleLoading}
        >
          <Text style={styles.signupButtonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
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
            onPress={handleGoogleSignup}
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
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Sign In</Text>
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
  signupButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  signupButtonText: {
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
  loginLink: {
    marginLeft: 4,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
});