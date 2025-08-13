import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type PrayerRequest = Database['public']['Tables']['prayer_requests']['Row'];

export function usePrayerRequests() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayerRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const submitPrayerRequest = async (
    title: string,
    description: string,
    category: string,
    isAnonymous: boolean,
    submittedBy?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .insert({
          title,
          description,
          category,
          is_anonymous: isAnonymous,
          submitted_by: isAnonymous ? 'Anonymous' : submittedBy,
        });

      if (error) throw error;
      await fetchPrayerRequests(); // Refresh list
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const incrementPrayerCount = async (requestId: string) => {
    try {
      const { error } = await supabase.rpc('increment_prayer_count', {
        request_id: requestId,
      });

      if (error) throw error;
      await fetchPrayerRequests(); // Refresh list
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    prayerRequests,
    loading,
    error,
    fetchPrayerRequests,
    submitPrayerRequest,
    incrementPrayerCount,
  };
}