import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ArrowLeft, Bell, Send, Smartphone, Globe } from 'lucide-react-native';
import { router } from 'expo-router';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function TestNotificationsScreen() {
  const { 
    expoPushToken, 
    loading, 
    error, 
    sendTestNotification, 
    scheduleLocalNotification 
  } = usePushNotifications();
  const [sending, setSending] = useState(false);

  const handleTestLocalNotification = async () => {
    try {
      await scheduleLocalNotification(
        "🙏 Prayer Reminder",
        "Take a moment to pray and connect with God",
        3
      );
      Alert.alert('Success', 'Local notification scheduled for 3 seconds!');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule local notification');
    }
  };

  const handleTestPushNotification = async () => {
    if (!expoPushToken) {
      Alert.alert(
        'Development Build Required',
        'Push notifications require a development build. Create one with EAS Build to test push notifications.'
      );
      return;
    }

    setSending(true);
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Push notification sent! Check your device.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send push notification');
    } finally {
      setSending(false);
    }
  };

  const testNotifications = [
    {
      id: 1,
      title: '📢 Church Announcement',
      body: 'Special Christmas service this Sunday at 10 AM!',
      type: 'announcement'
    },
    {
      id: 2,
      title: '🙏 Prayer Request',
      body: 'New prayer request from Sarah M. - Please pray for healing.',
      type: 'prayer'
    },
    {
      id: 3,
      title: '📅 Event Reminder',
      body: 'Youth group meeting starts in 30 minutes!',
      type: 'event'
    },
    {
      id: 4,
      title: '🎵 New Sermon',
      body: 'Walking in Faith - Pastor John Smith is now available.',
      type: 'sermon'
    }
  ];

  const handleTestSpecificNotification = async (notification: any) => {
    try {
      await scheduleLocalNotification(
        notification.title,
        notification.body,
        2
      );
      Alert.alert('Scheduled!', `${notification.title} will appear in 2 seconds`);
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule notification');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Bell size={24} color={expoPushToken ? "#059669" : "#DC2626"} />
            <Text style={styles.statusTitle}>Notification Status</Text>
          </View>
          
          {loading ? (
            <Text style={styles.statusText}>Setting up notifications...</Text>
          ) : error ? (
            <View>
              <Text style={[styles.statusText, styles.errorText]}>{error}</Text>
              <Text style={styles.statusHint}>
                Push notifications require a development build with native modules.
              </Text>
            </View>
          ) : expoPushToken ? (
            <View>
              <Text style={[styles.statusText, styles.successText]}>
                ✅ Push notifications enabled
              </Text>
              <Text style={styles.tokenText}>
                Token: {expoPushToken.substring(0, 20)}...
              </Text>
            </View>
          ) : (
            <Text style={[styles.statusText, styles.warningText]}>
              ⚠️ Push notifications not available in Expo Go
            </Text>
          )}
        </View>

        {/* Test Buttons */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Test Local Notifications</Text>
          <Text style={styles.sectionDescription}>
            These work in Expo Go and show immediately on your device
          </Text>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={handleTestLocalNotification}
          >
            <Smartphone size={20} color="#FFFFFF" />
            <Text style={styles.testButtonText}>Test Local Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Test Push Notifications</Text>
          <Text style={styles.sectionDescription}>
            Requires development build - sends via Expo Push Service
          </Text>
          
          <TouchableOpacity 
            style={[styles.testButton, styles.pushButton, !expoPushToken && styles.disabledButton]}
            onPress={handleTestPushNotification}
            disabled={!expoPushToken || sending}
          >
            <Globe size={20} color="#FFFFFF" />
            <Text style={styles.testButtonText}>
              {sending ? 'Sending...' : 'Test Push Notification'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sample Notifications */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Sample Church Notifications</Text>
          <Text style={styles.sectionDescription}>
            Test different types of notifications your church might send
          </Text>
          
          {testNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.sampleNotification}
              onPress={() => handleTestSpecificNotification(notification)}
            >
              <View style={styles.sampleNotificationContent}>
                <Text style={styles.sampleTitle}>{notification.title}</Text>
                <Text style={styles.sampleBody}>{notification.body}</Text>
                <Text style={styles.sampleType}>Type: {notification.type}</Text>
              </View>
              <Send size={16} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📱 How to Test Push Notifications</Text>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>
              <Text style={styles.stepBold}>Expo Go:</Text> Only local notifications work
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>
              <Text style={styles.stepBold}>Development Build:</Text> Run `eas build --profile development`
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>
              <Text style={styles.stepBold}>Production:</Text> Full push notification support
            </Text>
          </View>
        </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  successText: {
    color: '#059669',
  },
  errorText: {
    color: '#DC2626',
  },
  warningText: {
    color: '#F59E0B',
  },
  statusHint: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  tokenText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  testSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  pushButton: {
    backgroundColor: '#059669',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sampleNotification: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sampleNotificationContent: {
    flex: 1,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sampleBody: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  sampleType: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  instructionsCard: {
    backgroundColor: '#EEF2FF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginRight: 12,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  stepBold: {
    fontWeight: '600',
    color: '#1E3A8A',
  },
});