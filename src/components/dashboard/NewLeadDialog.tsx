import { useState } from "react";
import { X } from "lucide-react";
import {
  generateLeadId,
  type Lead,
  type LeadSource,
  type Temperature,
} from "@/lib/leads-store";
import { uploadLeadToSupabase } from "@/lib/leads-state";
import { useUser } from "@/lib/user-state";
import { supabase } from "@/lib/supabase";

const SOURCES: LeadSource[] = [
  "Referral",
  "Walk-in",
  "Social Media",
  "Cold Call",
  "Online Ad",
];

const TEMPS: Temperature[] = ["Hot", "Warm", "Cold"];

export function NewLeadDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (lead: Lead) => void;
}) {
  const user = useUser();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState<LeadSource>("Referral");
  const [temperature, setTemperature] = useState<Temperature>("Warm");
  const [followUpDate, setFollowUpDate] = useState("");
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const reset = () => {
    setName("");
    setPhone("");
    setEmail("");
    setLocation("");
    setSource("Referral");
    setTemperature("Warm");
    setFollowUpDate("");
    setNote("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }
      
      console.log('User ID:', session.user.id);
      console.log('User Email:', session.user.email);

      const now = new Date().toISOString();
      const leadData: Omit<Lead, 'id' | 'history'> = {
        name,
        phone,
        email,
        location,
        source,
        temperature,
        stage: "Lead",
        createdAt: now,
        notes: note,
        followUpDate: followUpDate || null,
      };
      
      console.log('Lead data to upload:', leadData);

      const uploadedLead = await uploadLeadToSupabase(session.user.id, leadData);
      
      console.log('Uploaded lead result:', uploadedLead);
      
      if (uploadedLead) {
        const lead: Lead = {
          ...uploadedLead,
          history: [
            {
              id: crypto.randomUUID(),
              at: now,
              by: user.name || 'Unknown User',
              fromStage: null,
              toStage: "Lead",
              fromTemperature: null,
              toTemperature: temperature,
              note,
            },
          ],
        };
        onCreate(lead);
        reset();
        onClose();
      } else {
        alert('Failed to upload lead to Supabase. Check console for details.');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      alert(`Error creating lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-card shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">New Lead</h2>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 px-5 py-5">
          <Field label="Full Name" required>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Phone Number" required>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Email Address" required>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Lead Source">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="input"
              >
                {SOURCES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Temperature">
              <select
                value={temperature}
                onChange={(e) => setTemperature(e.target.value as Temperature)}
                className="input"
              >
                {TEMPS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Follow-Up Date">
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Initial Note" required>
            <textarea
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Add context about this lead..."
            />
          </Field>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
