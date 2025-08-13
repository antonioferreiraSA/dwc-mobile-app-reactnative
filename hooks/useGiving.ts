import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type GivingCategory = Database['public']['Tables']['giving_categories']['Row'];
type Donation = Database['public']['Tables']['donations']['Row'];

export function useGiving() {
  const [categories, setCategories] = useState<GivingCategory[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGivingCategories();
  }, []);

  const fetchGivingCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('giving_categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDonations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserDonations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const createDonation = async (
    userId: string,
    categoryId: string,
    amount: number,
    paymentMethod: string,
    isRecurring: boolean = false,
    frequency?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .insert({
          user_id: userId,
          category_id: categoryId,
          amount,
          payment_method: paymentMethod,
          is_recurring: isRecurring,
          frequency,
        });

      if (error) throw error;

      // Update the raised amount for the category
      const { error: updateError } = await supabase.rpc('update_category_raised_amount', {
        category_id: categoryId,
        donation_amount: amount,
      });

      if (updateError) throw updateError;

      await fetchGivingCategories(); // Refresh categories
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const getUserGivingStats = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('amount, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (error) throw error;

      const currentYear = new Date().getFullYear();
      const yearlyTotal = data
        ?.filter(donation => new Date(donation.created_at).getFullYear() === currentYear)
        .reduce((sum, donation) => sum + Number(donation.amount), 0) || 0;

      return {
        totalThisYear: yearlyTotal,
        totalDonations: data?.length || 0,
        error: null,
      };
    } catch (err) {
      return {
        totalThisYear: 0,
        totalDonations: 0,
        error: err instanceof Error ? err.message : 'An error occurred',
      };
    }
  };

  return {
    categories,
    userDonations,
    loading,
    error,
    fetchGivingCategories,
    fetchUserDonations,
    createDonation,
    getUserGivingStats,
  };
}