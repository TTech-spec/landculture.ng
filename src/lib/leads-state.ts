import { useSyncExternalStore } from "react";
import { seedLeads, type Lead } from "@/lib/leads-store";

let state: Lead[] = seedLeads;
const listeners = new Set<() => void>();

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
