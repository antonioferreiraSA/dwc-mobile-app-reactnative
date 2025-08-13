import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  Animated,
  PanResponder,
  StatusBar
} from 'react-native';
import { X, Pause, Play, Volume2, VolumeX } from 'lucide-react-native';
import { useWordOfDay } from '@/hooks/useWordOfDay';
import { WebView } from 'react-native-webview';

interface WordOfDayModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function WordOfDayModal({ visible, onClose }: WordOfDayModalProps) {
  const { slides, dailyVerse, loading } = useWordOfDay();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const SLIDE_DURATION = 5000; // 5 seconds per slide

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (_, gestureState) => {
      // Pause during swipe
      if (isPlaying) {
        pauseSlide();
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (Math.abs(gestureState.dx) > 50) {
        if (gestureState.dx > 0) {
          // Swipe right - previous slide
          goToPreviousSlide();
        } else {
          // Swipe left - next slide
          goToNextSlide();
        }
      } else if (Math.abs(gestureState.dy) > 50 && gestureState.dy > 0) {
        // Swipe down - close modal
        onClose();
      } else {
        // Resume if not swiping
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resumeSlide = () => {
    setIsPlaying(true);
    startSlideTimer();
  };

  const goToNextSlide = () => {
    if (currentIndex < allSlides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose(); // Close when reaching the end
    }
  };

  const goToPreviousSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (visible && allSlides.length > 0 && isPlaying) {
      startSlideTimer();
    }
    return () => {
      progressAnim.stopAnimation();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visible, currentIndex, isPlaying, allSlides.length]);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setIsPlaying(true);
      setIsMuted(false);
    }
  }, [visible]);

  if (!visible || allSlides.length === 0) return null;

  const currentSlide = allSlides[currentIndex];

  const renderSlideContent = () => {
    if (currentSlide.type === 'verse' || !currentSlide.content_url) {
      // Render verse slide
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
      // Render image slide
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
      // Render video slide using HTML5 video
      const videoHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              background: #000;
              overflow: hidden;
            }
            video {
              width: 100vw;
              height: 100vh;
              object-fit: cover;
              background: #000;
            }
            .overlay {
              position: fixed;
              bottom: 60px;
              left: 0;
              right: 0;
              background: linear-gradient(transparent, rgba(0,0,0,0.7));
              padding: 40px 20px 20px;
              text-align: center;
              z-index: 1000;
              pointer-events: none;
            }
            .verse {
              color: white;
              font-size: 18px;
              font-style: italic;
              margin-bottom: 12px;
              line-height: 1.4;
            }
            .reference {
              color: rgba(255,255,255,0.9);
              font-size: 14px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <video 
            autoplay 
            muted="${isMuted}"
            playsinline
            webkit-playsinline
            onended="handleVideoEnd()"
            onloadeddata="handleVideoLoaded()"
          >
            <source src="${currentSlide.content_url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          
          <div class="overlay">
            <div class="verse">"${currentSlide.verse}"</div>
            <div class="reference">${currentSlide.reference}</div>
          </div>

          <script>
            let videoEnded = false;
            
            function handleVideoEnd() {
              videoEnded = true;
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'videoEnded'
              }));
            }
            
            function handleVideoLoaded() {
              const video = document.querySelector('video');
              if (video) {
                video.play().catch(e => console.log('Video play failed:', e));
              }
            }
            
            // Handle mute/unmute from React Native
            window.setMuted = function(muted) {
              const video = document.querySelector('video');
              if (video) {
                video.muted = muted;
              }
            };
            
            // Handle play/pause from React Native
            window.togglePlayback = function() {
              const video = document.querySelector('video');
              if (video) {
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }
            };
            
            // Ensure video starts playing
            document.addEventListener('DOMContentLoaded', function() {
              const video = document.querySelector('video');
              if (video) {
                video.play().catch(e => console.log('Auto-play failed:', e));
              }
            });
          </script>
        </body>
        </html>
      `;

      return (
        <View style={styles.videoContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: videoHtml }}
            style={styles.videoWebView}
            allowsFullscreenVideo={false}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            scrollEnabled={false}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'videoEnded') {
                  console.log('Video ended, setting videoEnded to true');
                  setVideoEnded(true);
                }
              } catch (e) {
                console.log('Error parsing WebView message:', e);
              }
            }}
          />
        </View>
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.container} {...panResponder.panHandlers}>
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
          <View style={styles.headerLeft}>
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
            <TouchableOpacity style={styles.controlButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 50,
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
  headerLeft: {
    flex: 1,
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
    backgroundColor: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
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
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 32,
    fontStyle: 'italic',
  },
  verseReference: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  imageReference: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    width: '100%',
  },
  videoWebView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000000',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 32,
    alignItems: 'center',
  },
  videoVerseText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  videoReference: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
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