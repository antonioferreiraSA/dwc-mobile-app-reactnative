import React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { User, MessageCircle, BookOpen, Phone, MapPin, Mail, Settings, CircleHelp as HelpCircle, Bell, Users, ChevronRight, LogOut, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import PrayerRequestModal from '@/components/PrayerRequestModal';

export default function MoreScreen() {
  const { signOut, user } = useAuth();
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      router.replace('/(auth)/login');
    }
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handlePrayerRequest = () => {
    setShowPrayerModal(true);
  };

  const handleBibleReading = () => {
    router.push('/bible-reading');
  };

  const handleSmallGroups = () => {
    router.push('/small-groups');
  };

  const handleLocation = () => {
    const url = 'https://www.google.com/maps/dir//35+Ernest+Schwartz+Ln,+Bruma,+Johannesburg,+2026/@-26.1834565,28.0268285,12z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x1e950dfe3568b061:0x8ae8a008ecbb679a!2m2!1d28.1092661!2d-26.1835451?entry=ttu&g_ep=EgoyMDI1MDgxMC4wIKXMDSoASAFQAw%3D%3D';
    Linking.openURL(url);
  };

  const handleContact = () => {
    Linking.openURL('tel:0116161795');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:dwccontent@gmail.com');
  };

  const handleWebsite = () => {
    Linking.openURL('https://destinyworshipcentre.co.za/');
  };

  const handleHelpSupport = () => {
    router.push('/help-support');
  };

  const handleTestNotifications = () => {
    router.push('/test-notifications');
  };

  const menuItems = [
    {
      section: 'Spiritual',
      items: [
        { id: 1, title: 'Prayer Requests', icon: MessageCircle, description: 'Submit and view prayer requests', onPress: handlePrayerRequest },
        { id: 2, title: 'Bible Reading Plan', icon: BookOpen, description: 'Daily scripture reading', onPress: handleBibleReading },
        { id: 3, title: 'Small Groups', icon: Users, description: 'Find and join a small group', onPress: handleSmallGroups },
      ]
    },
    {
      section: 'Church Info',
      items: [
        { id: 4, title: 'Contact Us', icon: Phone, description: 'Get in touch with church staff', onPress: handleContact },
        { id: 5, title: 'Location & Directions', icon: MapPin, description: 'Find our church campus', onPress: handleLocation },
        { id: 6, title: 'Staff Directory', icon: Mail, description: 'Connect with church leadership', onPress: handleEmail },
      ]
    },
    {
      section: 'Account',
      items: [
        { id: 7, title: 'Notifications', icon: Bell, description: 'Manage your notifications', onPress: handleNotifications },
        { id: 8, title: 'Settings', icon: Settings, description: 'App preferences' },
        { id: 9, title: 'Test Notifications', icon: Bell, description: 'Test push notifications', onPress: handleTestNotifications },
        { id: 10, title: 'Help & Support', icon: HelpCircle, description: 'Get help using the app', onPress: handleHelpSupport },
        { id: 11, title: 'Sign Out', icon: LogOut, description: 'Log out of your account', onPress: handleLogout, isDestructive: true },
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>More</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ 
              uri: user?.user_metadata?.avatar_url || 
                   'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150' 
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
            <Text style={styles.memberSince}>
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Unknown'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <User size={20} color="#1E3A8A" />
          </TouchableOpacity>
        </View>

        {/* Daily Verse */}
        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>Verse of the Day</Text>
          <Text style={styles.verseText}>
            "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."
          </Text>
          <Text style={styles.verseReference}>Proverbs 3:5-6</Text>
        </View>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIcon, item.isDestructive && styles.destructiveIcon]}>
                      <item.icon size={20} color={item.isDestructive ? "#DC2626" : "#1E3A8A"} />
                    </View>
                    <View style={styles.menuItemInfo}>
                      <Text style={[styles.menuItemTitle, item.isDestructive && styles.destructiveText]}>{item.title}</Text>
                      <Text style={styles.menuItemDescription}>{item.description}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Church Info Card */}
        <View style={styles.churchInfoCard}>
          <Text style={styles.churchInfoTitle}>Destiny Worship Centre</Text>
          <Text style={styles.churchInfoAddress}>35 Ernest Schwartz Ln, Bruma, Johannesburg, 2026</Text>
          <Text style={styles.churchInfoPhone}>011 616 1795</Text>
          <Text style={styles.churchInfoWebsite}>destinyworshipcentre.co.za</Text>
          
          <View style={styles.churchInfoActions}>
            <TouchableOpacity style={styles.infoButton} onPress={handleContact}>
              <Phone size={16} color="#1E3A8A" />
              <Text style={styles.infoButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton} onPress={handleLocation}>
              <MapPin size={16} color="#1E3A8A" />
              <Text style={styles.infoButtonText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton} onPress={handleEmail}>
              <Mail size={16} color="#1E3A8A" />
              <Text style={styles.infoButtonText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <PrayerRequestModal 
        visible={showPrayerModal} 
        onClose={() => setShowPrayerModal(false)} 
      />
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
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  editProfileButton: {
    padding: 12,
  },
  verseCard: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  verseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E0E7FF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verseText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DDD6FE',
    textAlign: 'right',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  churchInfoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  churchInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  churchInfoAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  churchInfoPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  churchInfoWebsite: {
    fontSize: 14,
    color: '#1E3A8A',
    marginBottom: 16,
  },
  churchInfoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  infoButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    gap: 6,
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  destructiveIcon: {
    backgroundColor: '#FEF2F2',
  },
  destructiveText: {
    color: '#DC2626',
  },
});