import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Conditionally import Google Sign-In only on native platforms
let GoogleSignin: any = null;
let isGoogleSignInAvailable = false;

if (Platform.OS !== 'web') {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    isGoogleSignInAvailable = true;
    
    // Configure Google Sign-In only if available
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });
    }
  } catch (error) {
    console.log('Google Sign-In not available in Expo Go. Use development build for Google Sign-In.');
    isGoogleSignInAvailable = false;
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // Create profile after successful signup
    if (data.user && !error) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        }, {
          onConflict: 'id'
        });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    // Also sign out from Google (only on native platforms)
    if (GoogleSignin && Platform.OS !== 'web') {
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('Google sign out error:', error);
      }
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    // Return error if Google Sign-In is not available
    if (!isGoogleSignInAvailable || !GoogleSignin || Platform.OS === 'web') {
      return { 
        data: null, 
        error: new Error('Google Sign-In requires a development build. Please use email/password sign-in or create a development build.') 
      };
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });
        return { data, error };
      } else {
        return { data: null, error: new Error('No ID token received') };
      }
    } catch (error: any) {
      return { data: null, error };
    }
  };

  return {
    session,
    user,
    loading,
    isGoogleSignInAvailable,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
}