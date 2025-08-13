import React, { useState } from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Calendar, Clock, MapPin, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import EventRSVPModal from '@/components/EventRSVPModal';

export default function EventsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const { events, loading, error, fetchEvents, rsvpToEvent, cancelRSVP } = useEvents();
  const { user } = useAuth();

  const categories = ['All', 'Service', 'Special Event', 'Youth', 'Prayer', 'Fellowship'];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchEvents();
    } catch (error) {
      console.error('Error refreshing events:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Set up real-time subscriptions for events
  useEffect(() => {
    const eventsSubscription = supabase
      .channel('events-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' },
        () => {
          console.log('Events updated, refreshing...');
          fetchEvents();
        }
      )
      .subscribe();

    const rsvpSubscription = supabase
      .channel('rsvp-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'event_rsvps' },
        () => {
          console.log('RSVPs updated, refreshing...');
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
      supabase.removeChannel(rsvpSubscription);
    };
  }, []);

  const handleRSVP = (event: any) => {
    if (!user) {
      alert('Please sign in to RSVP for events');
      return;
    }
    setSelectedEvent(event);
    setShowRSVPModal(true);
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle both "December 20, 2024" and ISO date formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString; // Return original string on error
    }
  };

  const formatShortDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const isToday = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    } catch (error) {
      return false;
    }
  };

  // Helper function to normalize dates for comparison
  const normalizeDate = (dateInput: string | Date): string => {
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) {
        return '';
      }
      // Use toISOString and split to get YYYY-MM-DD without timezone issues
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  const filteredEvents = events.filter(event => {
    if (selectedCategory !== 'All' && event.category !== selectedCategory) {
      return false;
    }
    if (selectedDate) {
      const eventDateNormalized = normalizeDate(event.date);
      const selectedDateNormalized = normalizeDate(selectedDate);
      return eventDateNormalized === selectedDateNormalized;
    }
    return true;
  });

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

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const currentDateNormalized = normalizeDate(current);
      const hasEvent = events.some(event => {
        const eventDateNormalized = normalizeDate(event.date);
        return eventDateNormalized === currentDateNormalized;
      });
      const isCurrentMonth = current.getMonth() === month;
      const isSelected = selectedDate && normalizeDate(current) === normalizeDate(selectedDate);
      const isTodayDate = normalizeDate(current) === normalizeDate(new Date());

      days.push({
        date: new Date(current),
        dateString: currentDateNormalized,
        hasEvent,
        isCurrentMonth,
        isSelected,
        isToday: isTodayDate,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    // Use the exact date without timezone manipulation
    setSelectedDate(new Date(date));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <Text style={styles.headerSubtitle}>Stay connected with our community</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >
        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Mini Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePreviousMonth} style={styles.calendarNavButton}>
              <ChevronLeft size={20} color="#1E3A8A" />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.calendarNavButton}>
              <ChevronRight size={20} color="#1E3A8A" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.calendarDayHeader}>{day}</Text>
            ))}
            {generateCalendarDays().map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !day.isCurrentMonth && styles.calendarDayInactive,
                  day.isSelected && styles.calendarDaySelected,
                  day.isToday && styles.calendarDayToday,
                ]}
                onPress={() => handleDateSelect(day.date)}
              >
                <Text style={[
                  styles.calendarDayText,
                  !day.isCurrentMonth && styles.calendarDayTextInactive,
                  day.isSelected && styles.calendarDayTextSelected,
                  day.isToday && styles.calendarDayTextToday,
                ]}>
                  {day.date.getDate()}
                </Text>
                {day.hasEvent && (
                  <View style={[
                    styles.eventDot,
                    day.isSelected && styles.eventDotSelected
                  ]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {selectedDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => setSelectedDate(null)}
            >
              <Text style={styles.clearDateButtonText}>
                Clear Date Filter ({formatShortDate(normalizeDate(selectedDate))})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Events List */}
        <Text style={styles.sectionTitle}>
          {selectedDate ? `Events on ${formatShortDate(normalizeDate(selectedDate))}` : 'Upcoming Events'}
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading events: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Calendar size={48} color="#9CA3AF" />
            <Text style={styles.noEventsTitle}>No Events Found</Text>
            <Text style={styles.noEventsText}>
              {selectedDate 
                ? 'No events scheduled for this date. Try selecting a different date.'
                : 'No events match your current filters. Try changing the category.'}
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Image source={{ uri: event.image_url }} style={styles.eventImage} />
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventTitleContainer}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
                      <Text style={styles.categoryBadgeText}>{event.category}</Text>
                    </View>
                  </View>
                  {isToday(event.date) && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>TODAY</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.eventDescription}>{event.description}</Text>

                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailRow}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.eventDetailText}>{formatDate(event.date)}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.eventDetailText}>{event.time}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.eventDetailText}>{event.location}</Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <Users size={16} color="#6B7280" />
                    <Text style={styles.eventDetailText}>
                      {event.attendees}/{event.capacity} attending
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.rsvpButton, { backgroundColor: getCategoryColor(event.category) }]}
                  onPress={() => handleRSVP(event)}
                >
                  <Text style={styles.rsvpButtonText}>
                    {event.is_rsvp_required ? 'RSVP Required' : 'Join Event'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <EventRSVPModal
        visible={showRSVPModal}
        event={selectedEvent}
        onClose={() => {
          setShowRSVPModal(false);
          setSelectedEvent(null);
        }}
        onSuccess={() => {
          console.log('RSVP success callback triggered');
          fetchEvents(); // Refresh events after successful RSVP
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
  filterContainer: {
    paddingVertical: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  calendarCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
  },
  calendarDayToday: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  calendarDayTextInactive: {
    color: '#9CA3AF',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarDayTextToday: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  eventDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  eventDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  clearDateButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearDateButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noEventsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
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
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  todayBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 20,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  rsvpButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  rsvpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
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