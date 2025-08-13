import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Heart, Cross } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // Fade in and scale up the logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Slide up the text
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // Hold for a moment
      Animated.delay(1200),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Cross size={48} color="#FFFFFF" />
          </View>
          <View style={styles.heartContainer}>
            <Heart size={24} color="#DC2626" fill="#DC2626" />
          </View>
        </View>

        <Text style={styles.churchName}>Grace Community</Text>
        <Text style={styles.churchName}>Destiny Worship</Text>
        <Text style={styles.churchSubtitle}>Centre</Text>
        
        <View style={styles.verseContainer}>
          <Text style={styles.verse}>
            "For where two or three gather in my name, there am I with them."
          </Text>
          <Text style={styles.verseReference}>Matthew 18:20</Text>
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  logoBackground: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heartContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  churchName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  churchSubtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 2,
  },
  verseContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 20,
  },
  verse: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 12,
  },
  verseReference: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  dot1: {
    animationDelay: '0ms',
  },
  dot2: {
    animationDelay: '200ms',
  },
  dot3: {
    animationDelay: '400ms',
  },
});