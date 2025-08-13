import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type WordOfDaySlide = Database['public']['Tables']['word_of_day_slides']['Row'];
type DailyVerse = Database['public']['Tables']['daily_verses']['Row'];

export function useWordOfDay() {
  const [slides, setSlides] = useState<WordOfDaySlide[]>([]);
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWordOfDayData();
  }, []);

  const fetchWordOfDayData = async () => {
    try {
      setLoading(true);
      
      // Fetch active word of day slides
      const { data: slidesData, error: slidesError } = await supabase
        .from('word_of_day_slides')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (slidesError) throw slidesError;

      // Fetch today's verse
      const today = new Date().toISOString().split('T')[0];
      const { data: verseData, error: verseError } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('date', today)
        .eq('is_active', true)
        .single();

      if (verseError && verseError.code !== 'PGRST116') {
        throw verseError;
      }

      setSlides(slidesData || []);
      setDailyVerse(verseData || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRandomVerse = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_verses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        return data[randomIndex];
      }
      return null;
    } catch (err) {
      console.error('Error fetching random verse:', err);
      return null;
    }
  };

  return {
    slides,
    dailyVerse,
    loading,
    error,
    fetchWordOfDayData,
    getRandomVerse,
  };
}