import { createClient } from '@supabase/supabase-js';
import { type User } from './types';

const supabaseUrl = 'https://uiqgwnvbotjvowpxzbwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcWd3bnZib3Rqdm93cHh6YndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Njk4MjEsImV4cCI6MjA3OTI0NTgyMX0.VgsPdzKXMhmWkROy3MMXTFEEzalNrqlhTIiCE-lUpyI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getFullUserProfile = async (authUser: any): Promise<User | null> => {
    if (!authUser) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }

    return {
        ...profile,
        email: authUser.email,
    } as User;
};
