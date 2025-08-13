import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, RefreshControl } from 'react-native';
import { Clock, MapPin, Users, BookOpen, MessageCircle, Sparkles, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useWordOfDay } from '@/hooks/useWordOfDay';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useSermons } from '@/hooks/useSermons';
import { supabase } from '@/lib/supabase';
import PrayerRequestModal from '@/components/PrayerRequestModal';
import SermonPlayer from '@/components/SermonPlayer';

export default function HomeScreen() {
  const { dailyVerse, loading: verseLoading, fetchWordOfDayData } = useWordOfDay();
  const { announcements, loading: announcementsLoading, fetchAnnouncements } = useAnnouncements();
  const { sermons, loading: sermonsLoading, fetchSermons } = useSermons();
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedSermon, setSelectedSermon] = useState<any>(null);
  const [showSermonPlayer, setShowSermonPlayer] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to sermons changes
    const sermonsSubscription = supabase
      .channel('sermons-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sermons' },
        () => {
          console.log('Sermons updated, refreshing...');
          fetchSermons();
        }
      )
      .subscribe();

    // Subscribe to announcements changes
    const announcementsSubscription = supabase
      .channel('announcements-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          console.log('Announcements updated, refreshing...');
          fetchAnnouncements();
        }
      )
      .subscribe();

    // Subscribe to daily verses changes
    const versesSubscription = supabase
      .channel('daily-verses-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'daily_verses' },
        () => {
          console.log('Daily verses updated, refreshing...');
          fetchWordOfDayData();
        }
      )
      .subscribe();

    // Subscribe to word of day slides changes
    const slidesSubscription = supabase
      .channel('word-slides-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'word_of_day_slides' },
        () => {
          console.log('Word of day slides updated, refreshing...');
          fetchWordOfDayData();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(sermonsSubscription);
      supabase.removeChannel(announcementsSubscription);
      supabase.removeChannel(versesSubscription);
      supabase.removeChannel(slidesSubscription);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh all data
      await Promise.all([
        fetchSermons(),
        fetchAnnouncements(),
        fetchWordOfDayData(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const quickActions = [
    { id: 1, title: 'Prayer Requests', icon: MessageCircle, color: '#8B5CF6', onPress: () => setShowPrayerModal(true) },
    { id: 2, title: 'Bible Reading', icon: BookOpen, color: '#059669', onPress: () => router.push('/bible-reading') },
    { id: 3, title: 'Small Groups', icon: Users, color: '#DC2626', onPress: () => router.push('/small-groups') },
    { id: 4, title: 'Bible', icon: BookOpen, color: '#1E3A8A', onPress: () => router.push('/bible') },
  ];

  // Sample announcements for demonstration
  const sampleAnnouncements = [
    { id: '1', title: 'Christmas Eve Service', content: 'Join us for a special Christmas Eve service on December 24th at 6:00 PM. Celebrate the birth of Jesus with our church family.' },
    { id: '2', title: 'New Year Prayer Meeting', content: 'Start the new year in prayer! Join us on January 1st at 9:00 AM for a special prayer meeting.' },
    { id: '3', title: 'Youth Camp Registration', content: 'Registration is now open for our annual youth camp. Early bird pricing available until January 15th.' },
    { id: '4', title: 'Small Group Leaders Meeting', content: 'All small group leaders are invited to our monthly meeting this Saturday at 10:00 AM.' },
    { id: '5', title: 'Community Outreach Program', content: 'Join us in serving our community this weekend. We need volunteers for our food distribution program.' },
    { id: '6', title: 'Bible Study Series', content: 'Starting next week: "Walking in Faith" - a 6-week Bible study series every Wednesday at 7:00 PM.' },
  ];

  const displayAnnouncements = announcements.length > 0 ? announcements.slice(0, 5) : sampleAnnouncements.slice(0, 5);

  const handleAnnouncementPress = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementModal(true);
  };

  const closeAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setSelectedAnnouncement(null);
  };

  const handleListenNow = () => {
    const latestSermon = sermons.length > 0 ? sermons[0] : null;
    if (latestSermon) {
      setSelectedSermon(latestSermon);
      setShowSermonPlayer(true);
    }
  };

  const closeSermonPlayer = () => {
    setShowSermonPlayer(false);
    setSelectedSermon(null);
  };

  // Get the latest sermon or use fallback data
  const latestSermon = sermons.length > 0 ? sermons[0] : {
    id: 'sample',
    title: 'Walking in Faith',
    speaker: 'Pastor John Smith',
    date: 'December 15, 2024',
    image_url: 'https://images.pexels.com/photos/372326/pexels-photo-372326.jpeg?auto=compress&cs=tinysrgb&w=400',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample video
    audio_url: null,
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <View style={styles.topNavLeft}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.churchName}>Destiny Worship Centre</Text>
          </View>
        </View>

        {/* Latest Sermon */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest Sermon</Text>
          <View style={styles.sermonCard}>
            <Image
              source={{ uri: latestSermon.image_url }}
              style={styles.sermonImage}
            />
            <View style={styles.sermonContent}>
              <Text style={styles.sermonTitle}>{latestSermon.title}</Text>
              <Text style={styles.sermonSpeaker}>{latestSermon.speaker}</Text>
              <Text style={styles.sermonDate}>
                {typeof latestSermon.date === 'string' 
                  ? latestSermon.date 
                  : new Date(latestSermon.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })
                }
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleListenNow}>
            <Text style={styles.secondaryButtonText}>Listen Now</Text>
          </TouchableOpacity>
        </View>

        {/* Announcements */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Announcements</Text>
          {announcementsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading announcements...</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.announcementsScroll}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {displayAnnouncements.map((announcement, index) => (
                <TouchableOpacity 
                  key={announcement.id} 
                  style={[
                    styles.announcement,
                    index === displayAnnouncements.length - 1 && styles.lastAnnouncement
                  ]}
                  onPress={() => handleAnnouncementPress(announcement)}
                >
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                  <Text style={styles.announcementText}>{announcement.content}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Service Times */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Service</Text>
          <View style={styles.serviceInfo}>
            <View style={styles.serviceRow}>
              <Clock size={20} color="#1E3A8A" />
              <Text style={styles.serviceText}>Sunday at 10:00 AM</Text>
            </View>
            <View style={styles.serviceRow}>
              <MapPin size={20} color="#1E3A8A" />
              <Text style={styles.serviceText}>35 Ernest Schwartz Ln, Bruma, Johannesburg</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                style={styles.quickAction}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <action.icon size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Word of the Day */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Word of the Day</Text>
          <TouchableOpacity 
            style={styles.wordOfDayButton} 
            onPress={() => router.push('/word-of-day')}
          >
            <View style={styles.wordOfDayIcon}>
              <Sparkles size={24} color="#FFFFFF" />
            </View>
            <View style={styles.wordOfDayContent}>
              <Text style={styles.wordOfDayText}>Daily inspiration and scripture</Text>
              <Text style={styles.wordOfDayAction}>Tap to explore today's inspiration</Text>
            </View>
          </TouchableOpacity>
        </View>

        <PrayerRequestModal 
          visible={showPrayerModal} 
          onClose={() => setShowPrayerModal(false)} 
        />
      </ScrollView>

      {/* Sermon Player Modal */}
      <Modal
        visible={showSermonPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeSermonPlayer}
      >
        <View style={styles.sermonPlayerContainer}>
          <View style={styles.sermonPlayerHeader}>
            <TouchableOpacity onPress={closeSermonPlayer} style={styles.sermonCloseButton}>
              <X size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.sermonPlayerTitle}>Now Playing</Text>
            <View style={styles.sermonPlayerPlaceholder} />
          </View>
          
          {selectedSermon && (
            <View style={styles.sermonPlayerContent}>
              <SermonPlayer
                videoUrl={selectedSermon.video_url}
                audioUrl={selectedSermon.audio_url}
                title={selectedSermon.title}
                speaker={selectedSermon.speaker}
                autoFullscreen={false}
              />
              
              <View style={styles.sermonDetails}>
                <Text style={styles.sermonDetailsTitle}>{selectedSermon.title}</Text>
                <Text style={styles.sermonDetailsSpeaker}>{selectedSermon.speaker}</Text>
                <Text style={styles.sermonDetailsDate}>
                  {typeof selectedSermon.date === 'string' 
                    ? selectedSermon.date 
                    : new Date(selectedSermon.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })
                  }
                </Text>
                {selectedSermon.description && (
                  <Text style={styles.sermonDetailsDescription}>
                    {selectedSermon.description}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Announcement Modal */}
      <Modal
        visible={showAnnouncementModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAnnouncementModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeAnnouncementModal} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Announcement</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedAnnouncement && (
              <View style={styles.modalAnnouncementCard}>
                <Text style={styles.modalAnnouncementTitle}>
                  {selectedAnnouncement.title}
                </Text>
                <Text style={styles.modalAnnouncementContent}>
                  {selectedAnnouncement.content}
                </Text>
                <View style={styles.modalAnnouncementFooter}>
                  <Text style={styles.modalAnnouncementDate}>
                    Posted: {new Date(selectedAnnouncement.created_at || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topNavLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  churchName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  serviceInfo: {
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickAction: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  sermonCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sermonImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  sermonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  sermonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sermonSpeaker: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  sermonDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  announcement: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  lastAnnouncement: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  announcementText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  announcementsScroll: {
    maxHeight: 200,
  },
  wordOfDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wordOfDayIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  wordOfDayContent: {
    flex: 1,
  },
  wordOfDayText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  wordOfDayAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  sermonPlayerContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  sermonPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sermonCloseButton: {
    padding: 8,
  },
  sermonPlayerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sermonPlayerPlaceholder: {
    width: 40,
  },
  sermonPlayerContent: {
    flex: 1,
    padding: 20,
  },
  sermonDetails: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sermonDetailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sermonDetailsSpeaker: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 4,
  },
  sermonDetailsDate: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  sermonDetailsDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalAnnouncementCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalAnnouncementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 32,
  },
  modalAnnouncementContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalAnnouncementFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalAnnouncementDate: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});