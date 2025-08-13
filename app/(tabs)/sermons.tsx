import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Share as RNShare } from 'react-native';
import { Search, Play, Share } from 'lucide-react-native';
import { useSermons } from '@/hooks/useSermons';
import SermonPlayer from '@/components/SermonPlayer';

export default function SermonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSermon, setSelectedSermon] = useState<any>(null);
  const { sermons, loading, error, searchSermons, fetchSermons } = useSermons();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchSermons(query);
    } else {
      fetchSermons();
    }
  };

  const handleShare = async (sermon: any) => {
    try {
      const shareContent = {
        title: sermon.title,
        message: `Check out this sermon: "${sermon.title}" by ${sermon.speaker}\n\n${sermon.description || 'Listen to this inspiring message from our church.'}`,
        url: sermon.video_url || sermon.audio_url || '',
      };

      await RNShare.share(shareContent);
    } catch (error) {
      console.error('Error sharing sermon:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading sermons...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSermons}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sermons</Text>
        <Text style={styles.headerSubtitle}>Listen to God's Word</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sermons, speakers, or series..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.featuredCard}>
          <Image
            source={{ uri: sermons[0]?.image_url || 'https://images.pexels.com/photos/372326/pexels-photo-372326.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.featuredImage}
          />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredBadge}>LATEST</Text>
            <Text style={styles.featuredTitle}>{sermons[0]?.title || 'No sermons available'}</Text>
            <Text style={styles.featuredSpeaker}>{sermons[0]?.speaker || ''}</Text>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => {
                if (sermons[0]) {
                  setSelectedSermon(sermons[0]);
                  // Small delay to ensure sermon is set before triggering fullscreen
                  setTimeout(() => {
                    setSelectedSermon({...sermons[0], autoFullscreen: true});
                  }, 100);
                }
              }}
            >
              <Play size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Video Player */}
        {selectedSermon && (
          <View style={styles.playerSection}>
            <Text style={styles.sectionTitle}>Now Playing</Text>
            <SermonPlayer
              videoUrl={selectedSermon.video_url}
              audioUrl={selectedSermon.audio_url}
              title={selectedSermon.title}
              speaker={selectedSermon.speaker}
              autoFullscreen={selectedSermon.autoFullscreen}
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>All Sermons</Text>

        {sermons.map((sermon) => (
          <View key={sermon.id} style={styles.sermonCard}>
            <Image source={{ uri: sermon.image_url }} style={styles.sermonImage} />
            <View style={styles.sermonInfo}>
              <Text style={styles.sermonSeries}>{sermon.series}</Text>
              <Text style={styles.sermonTitle}>{sermon.title}</Text>
              <Text style={styles.sermonSpeaker}>{sermon.speaker}</Text>
              <Text style={styles.sermonMeta}>
                {new Date(sermon.date).toLocaleDateString()} • {sermon.duration}
              </Text>
            </View>
            <View style={styles.sermonActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  setSelectedSermon(sermon);
                  // Small delay to ensure sermon is set before triggering fullscreen
                  setTimeout(() => {
                    setSelectedSermon({...sermon, autoFullscreen: true});
                  }, 100);
                }}
              >
                <Play size={20} color="#1E3A8A" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleShare(sermon)}
              >
                <Share size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  featuredCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  featuredContent: {
    padding: 20,
    position: 'relative',
  },
  featuredBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  featuredSpeaker: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  playButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1E3A8A',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sermonCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sermonImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 16,
  },
  sermonInfo: {
    flex: 1,
  },
  sermonSeries: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  sermonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sermonSpeaker: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  sermonMeta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sermonActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  playerSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});