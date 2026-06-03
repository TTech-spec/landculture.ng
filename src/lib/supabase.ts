import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type ProfileStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  team: string;
  branch: string;
  role: string;
  status: ProfileStatus;
  created_at: string;
}
