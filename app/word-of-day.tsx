import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Animated,
  PanResponder,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { X, Pause, Play, Volume2, VolumeX, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWordOfDay } from '@/hooks/useWordOfDay';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function WordOfDayScreen() {
  const { slides, dailyVerse, loading } = useWordOfDay();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Combine slides with daily verse
  const allSlides = React.useMemo(() => {
    const combinedSlides = [...slides];
    if (dailyVerse) {
      combinedSlides.unshift({
        id: 'daily-verse',
        type: 'verse' as const,
        content_url: '',
        word: dailyVerse.verse,
        verse: dailyVerse.verse,
        reference: dailyVerse.reference,
        order_index: -1,
        is_active: true,
        created_at: dailyVerse.created_at,
        updated_at: dailyVerse.updated_at,
      });
    }
    return combinedSlides;
  }, [slides, dailyVerse]);

  // Get current slide
  const currentSlide = allSlides[currentIndex];

  // Create video player for current video slide
  const videoSource = currentSlide?.type === 'video' && currentSlide.content_url 
    ? { uri: currentSlide.content_url }
    : { uri: '' };
  
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = isMuted;
  });

  const SLIDE_DURATION = 5000; // 5 seconds per slide

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      if (isPlaying) {
        pauseSlide();
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (Math.abs(gestureState.dx) > 50) {
        if (gestureState.dx > 0) {
          goToPreviousSlide();
        } else {
          goToNextSlide();
        }
      } else if (Math.abs(gestureState.dy) > 50 && gestureState.dy > 0) {
        router.back();
      } else {
        if (!isPlaying) {
          resumeSlide();
        }
      }
    },
  });

  const startSlideTimer = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SLIDE_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && isPlaying) {
        goToNextSlide();
      }
    });
  };

  const pauseSlide = () => {
    setIsPlaying(false);
    progressAnim.stopAnimation();
  };

  const resumeSlide = () => {
    setIsPlaying(true);
    startSlideTimer();
  };

  const goToNextSlide = () => {
    if (currentIndex < allSlides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back();
    }
  };

  const goToPreviousSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (allSlides.length > 0 && isPlaying) {
      if (currentSlide?.type === 'video') {
        if (videoEnded) {
          setTimeout(() => {
            goToNextSlide();
          }, 500);
        }
      } else {
        startSlideTimer();
      }
    }
    
    return () => {
      progressAnim.stopAnimation();
    };
  }, [currentIndex, isPlaying, allSlides.length, videoEnded]);

  useEffect(() => {
    setVideoEnded(false);
  }, [currentIndex]);

  useEffect(() => {
    if (player && currentSlide?.type === 'video') {
      player.muted = isMuted;
    }
  }, [isMuted, currentIndex, player]);

  useEffect(() => {
    if (player && currentSlide?.type === 'video') {
      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.status === 'readyToPlay') {
          player.play();
        }
        if (status.status === 'idle' && status.reasonForWaitingToPlay === null) {
          setVideoEnded(true);
        }
      });
      
      return () => {
        subscription?.remove();
      };
    }
  }, [player, currentSlide]);

  const renderSlideContent = () => {
    if (currentSlide.type === 'verse' || !currentSlide.content_url) {
      return (
        <View style={styles.verseContainer}>
          <View style={styles.verseContent}>
            <Text style={styles.verseLabel}>Word of the Day</Text>
            <Text style={styles.verseText}>"{currentSlide.verse}"</Text>
            <Text style={styles.verseReference}>{currentSlide.reference}</Text>
          </View>
        </View>
      );
    } else if (currentSlide.type === 'image') {
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: currentSlide.content_url }} 
            style={styles.slideImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageVerseText}>"{currentSlide.verse}"</Text>
            <Text style={styles.imageReference}>{currentSlide.reference}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.videoContainer}>
          <VideoView
            style={styles.videoPlayer}
            player={player}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            showsTimecodes={false}
            requiresLinearPlayback={true}
          />
          <View style={styles.videoOverlay}>
            <Text style={styles.videoVerseText}>"{currentSlide.verse}"</Text>
            <Text style={styles.videoReference}>{currentSlide.reference}</Text>
          </View>
        </View>
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Word of the Day...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (allSlides.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Word of the Day</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Word of the Day content available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.fullScreenContainer} {...panResponder.panHandlers}>
        {/* Progress bars */}
        <View style={styles.progressContainer}>
          {allSlides.map((_, index) => (
            <View key={index} style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground} />
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: index === currentIndex 
                      ? progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : index < currentIndex ? '100%' : '0%'
                  }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header controls */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Destiny Worship Centre</Text>
            <Text style={styles.headerSubtitle}>Word of the Day</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={24} color="#FFFFFF" /> : <Volume2 size={24} color="#FFFFFF" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={isPlaying ? pauseSlide : resumeSlide}
            >
              {isPlaying ? <Pause size={24} color="#FFFFFF" /> : <Play size={24} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Slide content */}
        <View style={styles.slideContainer}>
          {renderSlideContent()}
        </View>

        {/* Navigation areas */}
        <TouchableOpacity 
          style={styles.leftTapArea} 
          onPress={goToPreviousSlide}
          activeOpacity={1}
        />
        <TouchableOpacity 
          style={styles.rightTapArea} 
          onPress={goToNextSlide}
          activeOpacity={1}
        />

        {/* Slide counter */}
        <View style={styles.slideCounter}>
          <Text style={styles.slideCounterText}>
            {currentIndex + 1} / {allSlides.length}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default WordOfDayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 2,
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressBarFill: {
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#1E3A8A',
  },
  verseContent: {
    alignItems: 'center',
  },
  verseLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  verseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
  verseReference: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 32,
    alignItems: 'center',
  },
  imageVerseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
  imageReference: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 32,
    alignItems: 'center',
    zIndex: 1000,
  },
  videoVerseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  videoReference: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  leftTapArea: {
    position: 'absolute',
    left: 0,
    top: 100,
    bottom: 100,
    width: screenWidth * 0.3,
  },
  rightTapArea: {
    position: 'absolute',
    right: 0,
    top: 100,
    bottom: 100,
    width: screenWidth * 0.3,
  },
  slideCounter: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  slideCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});