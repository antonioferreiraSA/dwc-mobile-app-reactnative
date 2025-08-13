import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Send, CircleCheck as CheckCircle, Calendar, Clock, MapPin, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  attendees: number;
  capacity: number | null;
  image_url: string | null;
  is_rsvp_required: boolean;
}

interface EventRSVPModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventRSVPModal({ visible, event, onClose, onSuccess }: EventRSVPModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert('Please fill in your name and email address.');
      return;
    }

    if (!event || !user) return;

    setSubmitting(true);

    try {
      console.log('Submitting RSVP with data:', {
        event_id: event.id,
        user_id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || null,
        additional_info: additionalInfo.trim() || null,
      });

      // Check if user already has an RSVP for this event
      const { data: existingRSVP, error: checkError } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing RSVP:', checkError);
        throw checkError;
      }

      if (existingRSVP) {
        alert('You have already RSVP\'d to this event.');
        setSubmitting(false);
        return;
      }

      // Create the RSVP entry
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: event.id,
          user_id: user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim() || null,
          additional_info: additionalInfo.trim() || null,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone_number: phoneNumber.trim() || null,
          additional_info: additionalInfo.trim() || null,
          status: 'attending',
        })
        .select();

      if (rsvpError) {
        console.error('RSVP insert error:', rsvpError);
        throw rsvpError;
      }

      console.log('RSVP created successfully:', rsvpData);

      // Ensure user profile exists, create or update it
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: email.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          phone: phoneNumber.trim() || null,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        // Don't fail the RSVP if profile update fails
      }

      // Update attendees count manually since RPC might not exist
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          attendees: event.attendees + 1 
        })
        .eq('id', event.id);

      if (updateError) {
        console.warn('Error updating attendees count:', updateError);
      }

      console.log('About to show success modal');

      setShowSuccess(true);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        console.log('Hiding success modal');
        setShowSuccess(false);
        setTimeout(() => {
          console.log('Closing RSVP modal and calling onSuccess');
          resetForm();
          onClose();
          onSuccess(); // Refresh events list
        }, 200);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      alert(`Error submitting RSVP: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setAdditionalInfo('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Service': '#1E3A8A',
      'Special Event': '#DC2626',
      'Youth': '#F59E0B',
      'Prayer': '#8B5CF6',
      'Fellowship': '#059669',
    };
    return colors[category] || '#6B7280';
  };

  if (!event) return null;

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>RSVP to Event</Text>
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
              <View style={[styles.eventInfo, { backgroundColor: getCategoryColor(event.category) }]}>
                <View style={styles.eventIcon}>
                  <Calendar size={24} color="#FFFFFF" />
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventDetailRow}>
                    <Calendar size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.eventDetailText}>{formatEventDate(event.date)}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Clock size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.eventDetailText}>{event.time}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <MapPin size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Users size={16} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.eventDetailText}>
                      {event.attendees}/{event.capacity || '∞'} attending
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.description}>
                Please fill out the form below to RSVP for this event. We're excited to see you there!
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
                placeholder="Any dietary restrictions, accessibility needs, or questions?"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />

              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  { backgroundColor: getCategoryColor(event.category) },
                  (!firstName.trim() || !lastName.trim() || !email.trim()) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!firstName.trim() || !lastName.trim() || !email.trim() || submitting}
              >
                <Send size={20} color="#FFFFFF" style={styles.submitIcon} />
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting RSVP...' : 'Confirm RSVP'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                * Required fields. You'll receive a confirmation email after RSVPing.
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
            <Text style={styles.successTitle}>RSVP Confirmed!</Text>
            <Text style={styles.successMessage}>
              Thank you for RSVPing to {event.title}. We're excited to see you there! You'll receive a confirmation email shortly.
            </Text>
            <View style={styles.successFooter}>
              <Text style={styles.successFooterText}>See you at the event! 🎉</Text>
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
  eventInfo: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  eventIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
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
    minHeight: 80,
  },
  submitButton: {
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