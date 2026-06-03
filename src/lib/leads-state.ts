import { useSyncExternalStore } from "react";
import { seedLeads, type Lead, generateLeadId } from "@/lib/leads-store";
import { supabase } from "@/lib/supabase";

let state: Lead[] = seedLeads;
const listeners = new Set<() => void>();

// Fetch leads from Supabase
export async function fetchLeadsFromSupabase(userId: string): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!data || data.length === 0) return seedLeads;
    
    // Transform Supabase data to Lead format
    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      location: row.location,
      source: row.source,
      temperature: row.temperature,
      stage: row.stage,
      notes: row.notes || '',
      followUpDate: row.follow_up_date || null,
      createdAt: row.created_at,
      history: [], // History would need a separate table or JSON column
    }));
  } catch (err) {
    console.error('Error fetching leads:', err);
    return seedLeads;
  }
}

// Upload new lead to Supabase
export async function uploadLeadToSupabase(userId: string, lead: Omit<Lead, 'id' | 'history'>): Promise<Lead | null> {
  try {
    const newId = generateLeadId();
    
    console.log('Attempting to upload lead to Supabase:');
    console.log('User ID:', userId);
    console.log('Lead Data:', lead);
    console.log('Generated ID:', newId);
    
    const { data, error } = await supabase
      .from('leads')
      .insert({
        id: newId,
        user_id: userId,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        location: lead.location,
        source: lead.source,
        temperature: lead.temperature,
        stage: lead.stage,
        notes: lead.notes,
        follow_up_date: lead.followUpDate || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      throw error;
    }
    if (!data) {
      console.error('No data returned from Supabase insert');
      return null;
    }
    
    console.log('Successfully uploaded lead:', data);
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      location: data.location,
      source: data.source,
      temperature: data.temperature,
      stage: data.stage,
      notes: data.notes || '',
      followUpDate: data.follow_up_date || null,
      createdAt: data.created_at,
      history: [],
    };
  } catch (err) {
    console.error('Error uploading lead:', err);
    return null;
  }
}

function emit() {
  for (const l of listeners) l();
}

export const leadsStore = {
  get: () => state,
  set: (updater: (prev: Lead[]) => Lead[]) => {
    state = updater(state);
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useLeads() {
  return useSyncExternalStore(leadsStore.subscribe, leadsStore.get, leadsStore.get);
}
