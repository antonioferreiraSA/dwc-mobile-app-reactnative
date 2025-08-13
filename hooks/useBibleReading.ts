import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type BibleReadingPlan = Database['public']['Tables']['bible_reading_plans']['Row'];
type BibleReadingPlanDay = Database['public']['Tables']['bible_reading_plan_days']['Row'];
type UserReadingProgress = Database['public']['Tables']['user_reading_progress']['Row'];

export function useBibleReading() {
  const [plans, setPlans] = useState<BibleReadingPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<BibleReadingPlan | null>(null);
  const [planDays, setPlanDays] = useState<BibleReadingPlanDay[]>([]);
  const [userProgress, setUserProgress] = useState<UserReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBibleReadingPlans();
  }, []);

  const fetchBibleReadingPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching Bible reading plans...');
      const { data, error } = await supabase
        .from('bible_reading_plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('Bible reading plans fetched:', data);
      setPlans(data || []);
      
      // Set first plan as current if none selected
      if (data && data.length > 0 && !currentPlan) {
        setCurrentPlan(data[0]);
        await fetchPlanDays(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching Bible reading plans:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanDays = async (planId: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('bible_reading_plan_days')
        .select('*')
        .eq('plan_id', planId)
        .order('day_number', { ascending: true });

      if (error) throw error;
      setPlanDays(data || []);
    } catch (err) {
      console.error('Error fetching plan days:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchUserProgress = async (userId: string, planId: string) => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('user_reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .order('day_number', { ascending: true });

      if (error) throw error;
      setUserProgress(data || []);
    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const markDayComplete = async (userId: string, planId: string, dayNumber: number, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('user_reading_progress')
        .upsert({
          user_id: userId,
          plan_id: planId,
          day_number: dayNumber,
          notes: notes || null,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // Refresh user progress
      await fetchUserProgress(userId, planId);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const selectPlan = async (plan: BibleReadingPlan) => {
    setCurrentPlan(plan);
    await fetchPlanDays(plan.id);
  };

  const getTodaysReading = () => {
    if (!planDays.length) return null;
    
    // Simple logic: return the next uncompleted day or day 1
    const completedDays = userProgress.map(p => p.day_number);
    const nextDay = planDays.find(day => !completedDays.includes(day.day_number));
    
    return nextDay || planDays[0];
  };

  const getProgressPercentage = () => {
    if (!currentPlan || !planDays.length) return 0;
    return Math.round((userProgress.length / currentPlan.duration_days) * 100);
  };

  const isDayCompleted = (dayNumber: number) => {
    return userProgress.some(p => p.day_number === dayNumber);
  };

  return {
    plans,
    currentPlan,
    planDays,
    userProgress,
    loading,
    error,
    fetchBibleReadingPlans,
    fetchPlanDays,
    fetchUserProgress,
    markDayComplete,
    selectPlan,
    getTodaysReading,
    getProgressPercentage,
    isDayCompleted,
  };
}