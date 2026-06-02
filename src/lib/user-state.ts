import { useSyncExternalStore } from "react";
import { CURRENT_USER } from "@/lib/leads-store";

export interface UserProfile {
  name: string;
  initials: string;
  branch: string;
  role: string;
  email: string;
  phone: string;
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

let profile: UserProfile = {
  name: CURRENT_USER.name,
  initials: CURRENT_USER.initials,
  branch: CURRENT_USER.branch,
  role: CURRENT_USER.role,
  email: "adaeze.okafor@company.com",
  phone: "+234 801 234 5678",
};

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
  update: (patch: Partial<UserProfile>, by: string) => {
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
