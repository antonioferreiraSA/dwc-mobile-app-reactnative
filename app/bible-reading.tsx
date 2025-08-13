import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, BookOpen, CircleCheck as CheckCircle, Circle, Calendar, Target, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useBibleReading } from '@/hooks/useBibleReading';
import { useAuth } from '@/hooks/useAuth';

export default function BibleReadingScreen() {
  const { user } = useAuth();
  const {
    plans,
    currentPlan,
    planDays,
    userProgress,
    loading,
    error,
    selectPlan,
    markDayComplete,
    fetchUserProgress,
    getTodaysReading,
    getProgressPercentage,
    isDayCompleted,
  } = useBibleReading();

  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user && currentPlan) {
      fetchUserProgress(user.id, currentPlan.id);
    }
  }, [user, currentPlan]);

  useEffect(() => {
    const todaysReading = getTodaysReading();
    if (todaysReading) {
      setSelectedDay(todaysReading);
    }
  }, [planDays, userProgress]);

  const handleMarkComplete = async (dayNumber: number) => {
    if (!user || !currentPlan) return;
    
    const result = await markDayComplete(user.id, currentPlan.id, dayNumber, notes);
    if (!result.error) {
      setNotes('');
      // Move to next day if available
      const nextDay = planDays.find(day => day.day_number === dayNumber + 1);
      if (nextDay) {
        setSelectedDay(nextDay);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading Bible reading plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setError(null);
            fetchBibleReadingPlans();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bible Reading Plan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Reading Plan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plansScroll}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  currentPlan?.id === plan.id && styles.planCardActive
                ]}
                onPress={() => selectPlan(plan)}
              >
                <BookOpen size={24} color={currentPlan?.id === plan.id ? '#FFFFFF' : '#1E3A8A'} />
                <Text style={[
                  styles.planName,
                  currentPlan?.id === plan.id && styles.planNameActive
                ]}>
                  {plan.name}
                </Text>
                <Text style={[
                  styles.planDuration,
                  currentPlan?.id === plan.id && styles.planDurationActive
                ]}>
                  {plan.duration_days} days
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {currentPlan && (
          <>
            {/* Progress Overview */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Progress</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Target size={20} color="#1E3A8A" />
                    <Text style={styles.progressNumber}>{getProgressPercentage()}%</Text>
                    <Text style={styles.progressLabel}>Complete</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Calendar size={20} color="#059669" />
                    <Text style={styles.progressNumber}>{userProgress.length}</Text>
                    <Text style={styles.progressLabel}>Days Read</Text>
                  </View>
                  <View style={styles.progressStat}>
                    <Clock size={20} color="#F59E0B" />
                    <Text style={styles.progressNumber}>{currentPlan.duration_days - userProgress.length}</Text>
                    <Text style={styles.progressLabel}>Remaining</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getProgressPercentage()}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Today's Reading */}
            {selectedDay && (
              <View style={styles.card}>
                <View style={styles.todayHeader}>
                  <Text style={styles.cardTitle}>
                    Day {selectedDay.day_number}: {selectedDay.reading_reference}
                  </Text>
                  {isDayCompleted(selectedDay.day_number) && (
                    <CheckCircle size={24} color="#059669" />
                  )}
                </View>
                
                {selectedDay.reading_text && (
                  <View style={styles.readingText}>
                    <Text style={styles.verseText}>"{selectedDay.reading_text}"</Text>
                    <Text style={styles.verseReference}>{selectedDay.reading_reference}</Text>
                  </View>
                )}

                {selectedDay.reflection_question && (
                  <View style={styles.reflectionContainer}>
                    <Text style={styles.reflectionTitle}>Reflection Question</Text>
                    <Text style={styles.reflectionQuestion}>{selectedDay.reflection_question}</Text>
                  </View>
                )}

                {!isDayCompleted(selectedDay.day_number) && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleMarkComplete(selectedDay.day_number)}
                  >
                    <CheckCircle size={20} color="#FFFFFF" />
                    <Text style={styles.completeButtonText}>Mark as Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Reading Schedule */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reading Schedule</Text>
              <View style={styles.scheduleContainer}>
                {planDays.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayItem,
                      selectedDay?.id === day.id && styles.dayItemActive,
                      isDayCompleted(day.day_number) && styles.dayItemCompleted
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <View style={styles.dayNumber}>
                      {isDayCompleted(day.day_number) ? (
                        <CheckCircle size={20} color="#059669" />
                      ) : (
                        <Circle size={20} color="#9CA3AF" />
                      )}
                      <Text style={[
                        styles.dayNumberText,
                        isDayCompleted(day.day_number) && styles.dayNumberCompleted
                      ]}>
                        {day.day_number}
                      </Text>
                    </View>
                    <View style={styles.dayInfo}>
                      <Text style={[
                        styles.dayReference,
                        isDayCompleted(day.day_number) && styles.dayReferenceCompleted
                      ]}>
                        {day.reading_reference}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  plansScroll: {
    flexDirection: 'row',
  },
  planCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  planName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  planNameActive: {
    color: '#FFFFFF',
  },
  planDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  planDurationActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E3A8A',
    borderRadius: 4,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  readingText: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  verseText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
  },
  reflectionContainer: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reflectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  reflectionQuestion: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleContainer: {
    gap: 8,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayItemActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#1E3A8A',
  },
  dayItemCompleted: {
    backgroundColor: '#ECFDF5',
  },
  dayNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    minWidth: 60,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  dayNumberCompleted: {
    color: '#059669',
  },
  dayInfo: {
    flex: 1,
  },
  dayReference: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  dayReferenceCompleted: {
    color: '#059669',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});