import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Bell, BellOff, Send, Calendar, MessageCircle, Heart } from 'lucide-react-native';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export default function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const { expoPushToken, loading, error, sendTestNotification } = usePushNotifications();
  const [settings, setSettings] = useState({
    announcements: true,
    events: true,
    prayerRequests: true,
    sermons: true,
    giving: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTestNotification = async () => {
    if (!expoPushToken) {
      Alert.alert(
        'Development Build Required', 
        'Push notifications require a development build with native modules. In Expo Go, you can still use all other app features like sermons, events, giving, and prayer requests.'
      );
      return;
    }

    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent! You should receive it shortly.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const notificationTypes = [
    {
      key: 'announcements' as const,
      title: 'Church Announcements',
      description: 'Important updates and news',
      icon: Bell,
      color: '#1E3A8A',
    },
    {
      key: 'events' as const,
      title: 'Upcoming Events',
      description: 'Event reminders and updates',
      icon: Calendar,
      color: '#059669',
    },
    {
      key: 'prayerRequests' as const,
      title: 'Prayer Requests',
      description: 'New prayer requests and updates',
      icon: MessageCircle,
      color: '#8B5CF6',
    },
    {
      key: 'sermons' as const,
      title: 'New Sermons',
      description: 'Latest sermon releases',
      icon: Send,
      color: '#DC2626',
    },
    {
      key: 'giving' as const,
      title: 'Giving Reminders',
      description: 'Donation and tithing reminders',
      icon: Heart,
      color: '#F59E0B',
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Setting up notifications...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <BellOff size={48} color="#DC2626" />
          <Text style={styles.errorTitle}>Notifications Unavailable</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            Push notifications require a physical device and proper permissions.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <Text style={styles.headerSubtitle}>
          Choose what notifications you'd like to receive
        </Text>
      </View>

      {expoPushToken && (
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Bell size={24} color="#059669" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Notifications Enabled</Text>
            <Text style={styles.statusText}>You'll receive push notifications</Text>
          </View>
          <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.settingsContainer}>
        {notificationTypes.map((type) => (
          <View key={type.key} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: type.color }]}>
                <type.icon size={20} color="#FFFFFF" />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{type.title}</Text>
                <Text style={styles.settingDescription}>{type.description}</Text>
              </View>
            </View>
            <Switch
              value={settings[type.key]}
              onValueChange={() => handleToggle(type.key)}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings[type.key] ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About Notifications</Text>
        <Text style={styles.infoText}>
          We'll only send you relevant updates about church activities and events. 
          You can change these settings anytime.
        </Text>
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
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
  statusIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  testButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});