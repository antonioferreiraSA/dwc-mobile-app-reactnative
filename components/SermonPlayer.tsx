import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, Platform } from 'react-native';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

interface SermonPlayerProps {
  videoUrl?: string;
  audioUrl?: string;
  title: string;
  speaker: string;
  autoFullscreen?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SermonPlayer({ 
  videoUrl, 
  audioUrl, 
  title, 
  speaker,
  autoFullscreen = false
}: SermonPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Auto-trigger fullscreen if autoFullscreen prop is true
  useEffect(() => {
    if (autoFullscreen && videoUrl) {
      setIsFullscreen(true);
      setPlaying(true);
    }
  }, [autoFullscreen, videoUrl]);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const togglePlayback = () => {
    if (!playing) {
      setPlaying(true);
      setIsFullscreen(true);
    } else {
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    setPlaying(false);
  };

  const handleFullscreenPlay = () => {
    setPlaying(true);
  };

  // If we have a video URL, show YouTube player
  if (videoUrl) {
    const videoId = getYouTubeVideoId(videoUrl);
    
    if (!videoId) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid YouTube URL</Text>
        </View>
      );
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=${muted ? 1 : 0}&controls=1&rel=0&modestbranding=1`;
    const fullscreenEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&controls=1&rel=0&modestbranding=1&fs=1`;

    return (
      <>
        <View style={styles.container}>
          <View style={styles.playerContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: embedUrl }}
              style={styles.webView}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
            />
            
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={togglePlayback}>
                {playing ? <Pause size={24} color="#FFFFFF" /> : <Play size={24} color="#FFFFFF" />}
              </TouchableOpacity>
              
              <View style={styles.sermonInfo}>
                <Text style={styles.sermonTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.sermonSpeaker}>{speaker}</Text>
              </View>
              
              <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                {muted ? <VolumeX size={20} color="#FFFFFF" /> : <Volume2 size={20} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Fullscreen Video Modal */}
        <Modal
          visible={isFullscreen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={exitFullscreen}
        >
          <View style={styles.fullscreenContainer}>
            <TouchableOpacity style={styles.exitFullscreenButton} onPress={exitFullscreen}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <WebView
              source={{ uri: `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&fs=1` }}
              style={styles.fullscreenWebView}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              onLoad={handleFullscreenPlay}
            />
          </View>
        </Modal>
      </>
    );
  }

  // If we have audio URL, show audio player (placeholder for now)
  if (audioUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.audioPlayerContainer}>
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            {playing ? <Pause size={32} color="#FFFFFF" /> : <Play size={32} color="#FFFFFF" />}
          </TouchableOpacity>
          
          <View style={styles.audioInfo}>
            <Text style={styles.audioTitle} numberOfLines={2}>{title}</Text>
            <Text style={styles.audioSpeaker}>{speaker}</Text>
          </View>
          
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            {muted ? <VolumeX size={24} color="#6B7280" /> : <Volume2 size={24} color="#6B7280" />}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No media available
  return (
    <View style={styles.noMediaContainer}>
      <Text style={styles.noMediaText}>No audio or video available for this sermon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  playerContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 200,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  controlButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  sermonInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  sermonTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  sermonSpeaker: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  audioPlayerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButton: {
    width: 56,
    height: 56,
    backgroundColor: '#1E3A8A',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  audioSpeaker: {
    fontSize: 14,
    color: '#6B7280',
  },
  muteButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  noMediaContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  noMediaText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenWebView: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000000',
  },
  exitFullscreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});