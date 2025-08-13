import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, TextInput, Modal } from 'react-native';
import { Heart, Target, Users, Building, Globe, Zap, Info, Shield } from 'lucide-react-native';
import { useGiving } from '@/hooks/useGiving';
import { useAuth } from '@/hooks/useAuth';
import { createPayFastData, generatePayFastForm, formatCurrency } from '@/utils/payfast';

interface GivingCategory {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  color: string;
  icon: any;
}

const sampleCategories: GivingCategory[] = [
  {
    id: '1',
    title: 'General Fund',
    description: 'Support our daily operations, staff, and ministry programs',
    goal: 50000,
    raised: 32500,
    color: '#1E3A8A',
    icon: Heart,
  },
  {
    id: '2',
    title: 'Building Fund',
    description: 'Help us expand our facilities to serve more people',
    goal: 200000,
    raised: 85000,
    color: '#DC2626',
    icon: Building,
  },
  {
    id: '3',
    title: 'Missions',
    description: 'Support our local and international mission work',
    goal: 75000,
    raised: 45000,
    color: '#059669',
    icon: Globe,
  },
  {
    id: '4',
    title: 'Youth Ministry',
    description: 'Invest in the next generation through youth programs',
    goal: 30000,
    raised: 18500,
    color: '#F59E0B',
    icon: Zap,
  },
];

export default function GivingScreen() {
  const [selectedCategory, setSelectedCategory] = useState<GivingCategory>(sampleCategories[0]);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmountText, setCustomAmountText] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const { user } = useAuth();

  const amounts = [50, 100, 250, 500, 1000, 2500];

  const handleCustomAmountChange = (value: string) => {
    setCustomAmountText(value);
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setSelectedAmount(amount);
    } else {
      setSelectedAmount(null);
    }
  };

  const handleCustomAmountSubmit = () => {
    const amount = parseFloat(customAmountText);
    if (!isNaN(amount) && amount > 0) {
      setSelectedAmount(amount);
      setShowCustomInput(false);
    } else {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
    }
  };

  const handleCustomAmountCancel = () => {
    setCustomAmountText('');
    setShowCustomInput(false);
  };

  const handleDonate = async () => {
    if (!selectedAmount) {
      Alert.alert('Select Amount', 'Please select or enter a donation amount');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to make a donation');
      return;
    }

    try {
      console.log('Creating PayFast payment data...');
      console.log('Selected amount:', selectedAmount);
      console.log('Selected category:', selectedCategory.title);
      console.log('User:', user.email);
      console.log('User metadata:', user.user_metadata);
      
      // Create payment data using utility function
      const paymentData = createPayFastData(
        selectedAmount,
        selectedCategory.title,
        selectedCategory.description,
        user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Anonymous',
        user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Donor',
        user.email || '',
        selectedCategory.id,
        user.id,
        isRecurring
      );

      console.log('PayFast payment data created:', paymentData);

      const passphrase = process.env.EXPO_PUBLIC_PAYFAST_PASSPHRASE;
      console.log('Using passphrase:', passphrase ? 'Set' : 'Missing');
      
      if (!passphrase) {
        Alert.alert('Configuration Error', 'PayFast passphrase is not configured.');
        return;
      }

      const paymentUrl = await generatePayFastForm(paymentData, passphrase);
      console.log('Generated PayFast URL:', paymentUrl);

      if (paymentUrl) {
        console.log('Opening PayFast URL...');
        await Linking.openURL(paymentUrl);
      } else {
        Alert.alert('Error', 'Failed to generate payment URL');
      }
    } catch (error) {
      console.error('Donation error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process donation. Please try again.');
    }
  };

  const getProgress = (category: GivingCategory) => {
    return Math.min((category.raised / category.goal) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giving</Text>
        <Text style={styles.headerSubtitle}>Support God's work through your generosity</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Giving Categories - Horizontal Scroll */}
        <Text style={styles.sectionTitle}>Choose a Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {sampleCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory.id === category.id && styles.categoryCardSelected
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <category.icon size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    {formatCurrency(category.raised)}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(getProgress(category))}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${getProgress(category)}%`,
                        backgroundColor: category.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.goalText}>Goal: {formatCurrency(category.goal)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Amount Selection */}
        <Text style={styles.sectionTitle}>Select Amount</Text>
        <View style={styles.amountGrid}>
          {amounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountButton,
                selectedAmount === amount && styles.amountButtonSelected
              ]}
              onPress={() => {
                setSelectedAmount(amount);
              }}
            >
              <Text style={[
                styles.amountText,
                selectedAmount === amount && styles.amountTextSelected
              ]}>
                {formatCurrency(amount)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.amountButton,
              selectedAmount && !amounts.includes(selectedAmount) && styles.amountButtonSelected
            ]}
            onPress={() => setShowCustomInput(true)}
          >
            <Text style={[
              styles.amountText,
              selectedAmount && !amounts.includes(selectedAmount) && styles.amountTextSelected
            ]}>
              {selectedAmount && !amounts.includes(selectedAmount) 
                ? formatCurrency(selectedAmount)
                : 'Custom'
              }
            </Text>
          </TouchableOpacity>
        </View>

        {/* Donation Summary */}
        {selectedAmount && (
          <View style={styles.donationSummary}>
            <Text style={styles.summaryTitle}>Donation Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Category:</Text>
              <Text style={styles.summaryValue}>{selectedCategory.title}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(selectedAmount)}</Text>
            </View>
            
            <View style={styles.recurringContainer}>
              <Text style={styles.recurringLabel}>Monthly Recurring</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={isRecurring ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>

            <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
              <Text style={styles.donateButtonText}>
                Donate {formatCurrency(selectedAmount)}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PayFast Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Shield size={20} color="#0369A1" />
            <Text style={styles.infoTitle}>Secure Payment with PayFast</Text>
          </View>
          <Text style={styles.infoText}>
            Your donation is processed securely through PayFast, South Africa's leading payment gateway. 
            All transactions are encrypted and your financial information is never stored on our servers.
          </Text>
          <Text style={styles.infoText}>
            You'll receive a tax certificate for your donation via email within 24 hours.
          </Text>
        </View>
      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        visible={showCustomInput}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCustomAmountCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Custom Amount</Text>
            <Text style={styles.modalSubtitle}>How much would you like to donate?</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount (e.g., 150)"
              value={customAmountText}
              onChangeText={setCustomAmountText}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCustomAmountCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCustomAmountSubmit}
              >
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    width: 280,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryCardSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#F8FAFC',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  amountButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  amountButtonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#1E3A8A',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  amountTextSelected: {
    color: '#1E3A8A',
  },
  customButton: {
    backgroundColor: '#8B5CF6',
  },
  donationSummary: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  recurringLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  donateButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369A1',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0284C7',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});