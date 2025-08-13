import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { ArrowLeft, Send, CircleCheck as CheckCircle, CircleHelp as HelpCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function HelpSupportScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  const categories = [
    { value: 'general', label: 'General Question' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'account', label: 'Account Help' },
    { value: 'events', label: 'Events & Services' },
    { value: 'giving', label: 'Giving & Donations' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('help_support_requests')
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim() || null,
          subject: subject.trim(),
          message: message.trim(),
          category,
          user_id: user?.id || null,
        });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTimeout(() => {
          resetForm();
          router.back();
        }, 100);
      }, 2000);
    } catch (error) {
      console.error('Error submitting help request:', error);
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
    setSubject('');
    setMessage('');
    setCategory('general');
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
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
                <HelpCircle size={24} color="#FFFFFF" />
              </View>
              <View style={styles.introContent}>
                <Text style={styles.introTitle}>Need Help?</Text>
                <Text style={styles.introText}>
                  We're here to help! Send us your questions or feedback and we'll get back to you as soon as possible.
                </Text>
              </View>
            </View>

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

            <Text style={styles.categoryLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && styles.categoryButtonActive
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

            <TextInput
              style={styles.input}
              placeholder="Subject *"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              style={styles.messageInput}
              placeholder="Please describe your question or issue in detail... *"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />

            <TouchableOpacity
              style={[styles.submitButton, (!firstName.trim() || !lastName.trim() || !email.trim() || !subject.trim() || !message.trim()) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !subject.trim() || !message.trim() || submitting}
            >
              <Send size={20} color="#FFFFFF" style={styles.submitIcon} />
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Send Message'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              * Required fields. We typically respond within 24 hours during business days.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

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
            <Text style={styles.successTitle}>Message Sent!</Text>
            <Text style={styles.successMessage}>
              Thank you for reaching out. We've received your message and will get back to you as soon as possible.
            </Text>
            <View style={styles.successFooter}>
              <Text style={styles.successFooterText}>We're here to help! 💙</Text>
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
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: '#1E3A8A',
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
  categoryButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
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
    minHeight: 120,
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