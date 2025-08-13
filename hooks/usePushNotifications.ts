import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Conditionally import expo packages only if available
let Device: any = null;
let Notifications: any = null;
let Constants: any = null;
let isNotificationsAvailable = false;

try {
  Device = require('expo-device');
  Notifications = require('expo-notifications');
  Constants = require('expo-constants');
  isNotificationsAvailable = true;
  
  // Configure notification behavior only if available
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (error) {
  console.log('Push notifications not available in Expo Go. Use development build for full functionality.');
  isNotificationsAvailable = false;
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const { user } = useAuth();

  useEffect(() => {
    if (!isNotificationsAvailable) {
      setError('Push notifications require a development build. Please use email/password authentication and other features.');
      setLoading(false);
      return;
    }

    registerForPushNotificationsAsync()
      .then(token => {
        setExpoPushToken(token);
        if (token && user) {
          savePushTokenToDatabase(token, user.id);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for notifications while app is running
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for user tapping on notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      handleNotificationResponse(data);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    if (!isNotificationsAvailable || !Device || !Notifications || !Constants) {
      throw new Error('Push notifications require a development build with native modules');
    }

    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for push notifications');
      }
      
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } else {
      throw new Error('Must use physical device for Push Notifications');
    }

    return token;
  };

  const savePushTokenToDatabase = async (token: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving push token:', error);
      }
    } catch (err) {
      console.error('Error saving push token:', err);
    }
  };

  const handleNotificationResponse = (data: any) => {
    // Handle different notification types
    if (data?.type === 'prayer_request') {
      // Navigate to prayer requests
      console.log('Navigate to prayer request:', data.id);
    } else if (data?.type === 'event') {
      // Navigate to specific event
      console.log('Navigate to event:', data.id);
    } else if (data?.type === 'announcement') {
      // Navigate to announcements
      console.log('Navigate to announcement:', data.id);
    }
  };

  const sendTestNotification = async () => {
    if (!expoPushToken) return;

    const message = {
      to: expoPushToken,
      sound: 'default',
      title: 'Grace Community Church',
      body: 'Test notification from your church app!',
      data: { type: 'test' },
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Test notification sent:', result);
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const scheduleLocalNotification = async (title: string, body: string, seconds: number = 5) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: { seconds },
    });
  };

  return {
    expoPushToken,
    notification,
    loading,
    error,
    sendTestNotification,
    scheduleLocalNotification,
  };
}