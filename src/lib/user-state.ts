import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  name: string;
  initials: string;
  branch: string;
  role: string;
  email: string;
  phone: string;
  id?: string;
}

export interface ProfileChange {
  id: string;
  at: string; // ISO
  by: string;
  field: keyof UserProfile;
  fromValue: string;
  toValue: string;
}

function deriveInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const FIELD_LABELS: Record<keyof UserProfile, string> = {
  name: "Full name",
  initials: "Initials",
  branch: "Branch",
  role: "Role",
  email: "Email",
  phone: "Phone",
};

export function fieldLabel(f: keyof UserProfile) {
  return FIELD_LABELS[f];
}

// Initialize with empty values - will be loaded from Supabase
let profile: UserProfile = {
  name: "",
  initials: "",
  branch: "",
  role: "",
  email: "",
  phone: "",
  id: "",
};

// Fetch real profile data from Supabase and update the store
export async function loadProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    const initials = data.name ? deriveInitials(data.name) : '??';
    const newProfile: UserProfile = {
      id: data.id,
      name: data.name || '',
      initials: initials,
      branch: data.branch || '',
      role: data.role || '',
      email: data.email || '',
      phone: data.phone || '',
    };
    
    // Update the store with real data
    profile = newProfile;
    refreshSnapshot();
    emit();
    
    return newProfile;
  } catch (err) {
    console.error('Error fetching profile:', err);
    return null;
  }
}

// Update profile in Supabase
export async function updateProfileInSupabase(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        branch: updates.branch,
        role: updates.role,
      })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating profile:', err);
    return false;
  }
}

let activity: ProfileChange[] = [];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let snapshot = { profile, activity };
function refreshSnapshot() {
  snapshot = { profile, activity };
}

function uid() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export const userStore = {
  get: () => snapshot,
  update: async (patch: Partial<UserProfile>, by: string) => {
    const next = { ...profile, ...patch };
    if (patch.name && !patch.initials) {
      next.initials = deriveInitials(next.name);
    }
    const changes: ProfileChange[] = [];
    (Object.keys(next) as (keyof UserProfile)[]).forEach((k) => {
      if (next[k] !== profile[k]) {
        changes.push({
          id: uid(),
          at: new Date().toISOString(),
          by,
          field: k,
          fromValue: profile[k] ?? "",
          toValue: next[k] ?? "",
        });
      }
    });
    if (changes.length === 0) return;
    profile = next;
    activity = [...changes, ...activity];
    refreshSnapshot();
    emit();
    
    // Sync to Supabase if we have a user ID
    if (profile.id) {
      await updateProfileInSupabase(profile.id, patch);
    }
  },
  setProfile: (newProfile: UserProfile) => {
    profile = newProfile;
    refreshSnapshot();
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useUserSnapshot() {
  return useSyncExternalStore(userStore.subscribe, userStore.get, userStore.get);
}

export function useUser() {
  return useUserSnapshot().profile;
}

export function useProfileActivity() {
  return useUserSnapshot().activity;
}
