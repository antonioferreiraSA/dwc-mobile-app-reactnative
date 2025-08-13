import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Event = Database['public']['Tables']['events']['Row'];
type EventRSVP = Database['public']['Tables']['event_rsvps']['Row'];

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const rsvpToEvent = async (eventId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: userId,
          status: 'attending',
        });

      if (error) throw error;

      // Update attendee count
      const { error: updateError } = await supabase.rpc('increment_event_attendees', {
        event_id: eventId,
      });

      if (updateError) throw updateError;

      await fetchEvents(); // Refresh events
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const cancelRSVP = async (eventId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      // Decrease attendee count
      const { error: updateError } = await supabase.rpc('decrement_event_attendees', {
        event_id: eventId,
      });

      if (updateError) throw updateError;

      await fetchEvents(); // Refresh events
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    rsvpToEvent,
    cancelRSVP,
  };
}