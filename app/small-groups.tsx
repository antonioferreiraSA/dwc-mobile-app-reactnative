import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Users, MapPin, Clock, User, Mail, Phone } from 'lucide-react-native';
import { router } from 'expo-router';
import SmallGroupJoinModal from '@/components/SmallGroupJoinModal';

interface SmallGroup {
  id: number;
  name: string;
  description: string;
  leader: string;
  leaderEmail?: string;
  leaderPhone?: string;
  meetingTime: string;
  location: string;
  members: number;
  capacity: number;
  category: string;
  image?: string;
}

const smallGroups: SmallGroup[] = [
  {
    id: 1,
    name: 'Young Adults Bible Study',
    description: 'A vibrant community of young adults exploring God\'s word together. We dive deep into scripture while building lasting friendships and supporting each other in our faith journey.',
    leader: 'Pastor Mike Johnson',
    leaderEmail: 'mike@destinyworshipcentre.co.za',
    leaderPhone: '011 616 1795',
    meetingTime: 'Wednesdays 7:00 PM',
    location: 'Room 201, Main Building',
    members: 15,
    capacity: 25,
    category: 'Bible Study',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 2,
    name: 'Marriage Ministry',
    description: 'Strengthening marriages through biblical principles, prayer, and fellowship. Join other couples as we grow together in love, understanding, and commitment.',
    leader: 'Pastor David & Linda Wilson',
    leaderEmail: 'david@destinyworshipcentre.co.za',
    meetingTime: 'Saturdays 6:00 PM',
    location: 'Fellowship Hall',
    members: 12,
    capacity: 20,
    category: 'Marriage',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 3,
    name: 'Women\'s Prayer Circle',
    description: 'A supportive community of women coming together in prayer, worship, and encouragement. Experience the power of sisterhood in Christ.',
    leader: 'Sister Grace Mthembu',
    leaderEmail: 'grace@destinyworshipcentre.co.za',
    meetingTime: 'Tuesdays 10:00 AM',
    location: 'Prayer Room',
    members: 18,
    capacity: 30,
    category: 'Prayer',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 4,
    name: 'Men\'s Fellowship',
    description: 'Brothers in Christ gathering for fellowship, accountability, and spiritual growth. Building godly men who lead with integrity and purpose.',
    leader: 'Elder John Sithole',
    leaderEmail: 'john@destinyworshipcentre.co.za',
    meetingTime: 'Saturdays 8:00 AM',
    location: 'Conference Room',
    members: 10,
    capacity: 20,
    category: 'Fellowship',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 5,
    name: 'Youth Ministry',
    description: 'Empowering the next generation through dynamic worship, relevant teaching, and fun activities. Where young hearts meet Jesus!',
    leader: 'Pastor Sarah Ndlovu',
    leaderEmail: 'sarah@destinyworshipcentre.co.za',
    meetingTime: 'Fridays 6:30 PM',
    location: 'Youth Hall',
    members: 25,
    capacity: 40,
    category: 'Youth',
    image: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 6,
    name: 'Senior Saints',
    description: 'A warm community for our seasoned believers to share wisdom, enjoy fellowship, and continue growing in faith together.',
    leader: 'Elder Mary Khumalo',
    leaderEmail: 'mary@destinyworshipcentre.co.za',
    meetingTime: 'Thursdays 2:00 PM',
    location: 'Senior Lounge',
    members: 8,
    capacity: 15,
    category: 'Fellowship',
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export default function SmallGroupsScreen() {
  const [selectedGroup, setSelectedGroup] = useState<SmallGroup | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Bible Study': '#1E3A8A',
      'Marriage': '#DC2626',
      'Prayer': '#8B5CF6',
      'Fellowship': '#059669',
      'Youth': '#F59E0B',
    };
    return colors[category] || '#6B7280';
  };

  const handleJoinGroup = (group: SmallGroup) => {
    setSelectedGroup(group);
    setShowJoinModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Small Groups</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Find Your Community</Text>
          <Text style={styles.introText}>
            Small groups are the heart of our church community. Join a group to build meaningful relationships, 
            grow in your faith, and experience the love of Christ together.
          </Text>
        </View>

        {smallGroups.map((group) => (
          <View key={group.id} style={styles.groupCard}>
            <Image source={{ uri: group.image }} style={styles.groupImage} />
            <View style={styles.groupContent}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{group.name}</Text>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(group.category) }]}>
                  <Text style={styles.categoryText}>{group.category}</Text>
                </View>
              </View>
              
              <Text style={styles.groupDescription}>{group.description}</Text>
              
              <View style={styles.groupDetails}>
                <View style={styles.detailRow}>
                  <User size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{group.leader}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{group.meetingTime}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{group.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Users size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    {group.members}/{group.capacity} members
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.joinButton, { backgroundColor: getCategoryColor(group.category) }]}
                onPress={() => handleJoinGroup(group)}
              >
                <Text style={styles.joinButtonText}>Join Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <SmallGroupJoinModal
        visible={showJoinModal}
        group={selectedGroup}
        onClose={() => {
          setShowJoinModal(false);
          setSelectedGroup(null);
        }}
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
  introCard: {
    backgroundColor: '#1E3A8A',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 24,
    borderRadius: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    color: '#E0E7FF',
    lineHeight: 24,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  groupImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  groupContent: {
    padding: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  groupDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  groupDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  joinButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});