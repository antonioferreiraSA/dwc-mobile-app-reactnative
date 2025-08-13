import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Sermon = Database['public']['Tables']['sermons']['Row'];

export function useSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchSermons = async (query: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .or(`title.ilike.%${query}%,speaker.ilike.%${query}%,series.ilike.%${query}%`)
        .order('date', { ascending: false });

      if (error) throw error;
      setSermons(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    sermons,
    loading,
    error,
    fetchSermons,
    searchSermons,
  };
}