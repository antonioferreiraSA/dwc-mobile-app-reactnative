import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Send, CircleCheck as CheckCircle, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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

interface SmallGroupJoinModalProps {
  visible: boolean;
  group: SmallGroup | null;
  onClose: () => void;
}

export default function SmallGroupJoinModal({ visible, group, onClose }: SmallGroupJoinModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('Please fill in your name and email address.');
      return;
    }

    if (!group) return;

    setSubmitting(true);

    try {
      // Create the small group join request entry
      const { error } = await supabase
        .from('small_group_requests')
        .insert({
          group_name: group.name,
          group_leader: group.leader,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim() || null,
          message: message.trim() || null,
          user_id: user?.id || null,
        });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 100);
      }, 2000);
    } catch (error) {
      console.error('Error submitting small group request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!group) return null;

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Join Small Group</Text>
            <View style={styles.placeholder} />
          </View>

          <KeyboardAvoidingView 
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              style={styles.content} 
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.groupInfo}>
                <View style={styles.groupIcon}>
                  <Users size={24} color="#FFFFFF" />
                </View>
                <View style={styles.groupDetails}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupLeader}>Led by {group.leader}</Text>
                  <Text style={styles.groupTime}>{group.meetingTime}</Text>
                </View>
              </View>

              <Text style={styles.description}>
                We're excited that you want to join our small group! Please fill out the form below and we'll get back to you with more details.
              </Text>

              <View style={styles.nameRow}>
                <TextInput
                  style={[styles.nameInput, styles.firstNameInput]}
                  placeholder="First Name *"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={[styles.nameInput, styles.lastNameInput]}
                  placeholder="Last Name *"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Email Address *"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={styles.messageInput}
                placeholder="Tell us a bit about yourself or any questions you have..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                style={[styles.submitButton, (!firstName.trim() || !lastName.trim() || !email.trim()) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!firstName.trim() || !lastName.trim() || !email.trim() || submitting}
              >
                <Send size={20} color="#FFFFFF" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Request to Join'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                * Required fields. We'll contact you within 24 hours to welcome you to the group!
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Custom Success Modal */}
      <Modal
        visible={showSuccess}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <CheckCircle size={64} color="#059669" />
            </View>
            <Text style={styles.successTitle}>Request Submitted!</Text>
            <Text style={styles.successMessage}>
              Thank you for your interest in joining {group.name}. The group leader will contact you soon to welcome you to the community.
            </Text>
            <View style={styles.successFooter}>
              <Text style={styles.successFooterText}>Welcome to the family! 🙏</Text>
            </View>
          </View>
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
  keyboardContainer: {
    flex: 1,
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
  closeButton: {
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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  groupInfo: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  groupIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupDetails: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  groupLeader: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 2,
  },
  groupTime: {
    fontSize: 14,
    color: '#C7D2FE',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  firstNameInput: {
    flex: 1,
  },
  lastNameInput: {
    flex: 1,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 16,
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 24,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitIcon: {
    marginRight: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  successFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
    alignItems: 'center',
  },
  successFooterText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '500',
  },
});