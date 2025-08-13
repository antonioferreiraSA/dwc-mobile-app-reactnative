import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { X, Send, CircleCheck as CheckCircle, MessageCircle } from 'lucide-react-native';
import { usePrayerRequests } from '@/hooks/usePrayerRequests';
import { useAuth } from '@/hooks/useAuth';

interface PrayerRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrayerRequestModal({ visible, onClose }: PrayerRequestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [category, setCategory] = useState('health');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { submitPrayerRequest } = usePrayerRequests();
  const { user } = useAuth();

  const categories = [
    { value: 'health', label: 'Health', color: '#DC2626' },
    { value: 'family', label: 'Family', color: '#059669' },
    { value: 'work', label: 'Work', color: '#1E3A8A' },
    { value: 'spiritual', label: 'Spiritual', color: '#8B5CF6' },
    { value: 'other', label: 'Other', color: '#6B7280' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in the title and description.');
      return;
    }

    if (!isAnonymous && (!firstName.trim() || !lastName.trim())) {
      alert('Please fill in your name or check Anonymous.');
      return;
    }

    setSubmitting(true);

    const submittedBy = isAnonymous ? 'Anonymous' : `${firstName.trim()} ${lastName.trim()}`;
    
    const result = await submitPrayerRequest(
      title.trim(),
      description.trim(),
      category,
      isAnonymous,
      submittedBy
    );

    if (result.error) {
      alert('Error submitting prayer request. Please try again.');
    } else {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 100);
      }, 2000);
    }

    setSubmitting(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setCategory('health');
    setIsAnonymous(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prayer Request</Text>
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
              <View style={styles.introCard}>
                <View style={styles.introIcon}>
                  <MessageCircle size={24} color="#FFFFFF" />
                </View>
                <View style={styles.introContent}>
                  <Text style={styles.introTitle}>Share Your Prayer Request</Text>
                  <Text style={styles.introText}>
                    Our community will pray for you. Share what's on your heart and let us lift you up in prayer.
                  </Text>
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Prayer Request Title *"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#9CA3AF"
              />

              <TextInput
                style={styles.descriptionInput}
                placeholder="Please share the details of your prayer request... *"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.categoryLabel}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryButton,
                      category === cat.value && { backgroundColor: cat.color }
                    ]}
                    onPress={() => setCategory(cat.value)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      category === cat.value && styles.categoryButtonTextActive
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.anonymousContainer}>
                <View style={styles.anonymousLeft}>
                  <Text style={styles.anonymousLabel}>Submit Anonymously</Text>
                  <Text style={styles.anonymousDescription}>Your name won't be shown publicly</Text>
                </View>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor={isAnonymous ? '#FFFFFF' : '#F3F4F6'}
                />
              </View>

              {!isAnonymous && (
                <View style={styles.personalDetailsContainer}>
                  <Text style={styles.personalDetailsTitle}>Personal Details</Text>
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
                    placeholder="Phone Number (Optional)"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, (!title.trim() || !description.trim() || (!isAnonymous && (!firstName.trim() || !lastName.trim()))) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim() || !description.trim() || (!isAnonymous && (!firstName.trim() || !lastName.trim())) || submitting}
              >
                <Send size={20} color="#FFFFFF" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Prayer Request'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                * Required fields. Your prayer request will be shared with our prayer team and community.
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
            <Text style={styles.successTitle}>Prayer Request Submitted!</Text>
            <Text style={styles.successMessage}>
              Thank you for sharing your heart with us. Our community will be praying for you and your request.
            </Text>
            <View style={styles.successFooter}>
              <Text style={styles.successFooterText}>We're praying for you! 🙏</Text>
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
  introCard: {
    backgroundColor: '#8B5CF6',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  introIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  introContent: {
    flex: 1,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  introText: {
    fontSize: 14,
    color: '#E0E7FF',
    lineHeight: 20,
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
  descriptionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 20,
    minHeight: 100,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 20,
  },
  anonymousLeft: {
    flex: 1,
  },
  anonymousLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  anonymousDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  personalDetailsContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  personalDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
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
  submitButton: {
    backgroundColor: '#8B5CF6',
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