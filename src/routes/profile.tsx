import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import {
  useUser,
  useProfileActivity,
  userStore,
  fieldLabel,
  type UserProfile,
} from "@/lib/user-state";
import { CURRENT_USER } from "@/lib/leads-store";
import { Pencil, Save, X, Mail, Phone, Building2, BadgeCheck, History, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Sales CRM" },
      { name: "description", content: "View and edit your sales rep profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useUser();
  const activity = useProfileActivity();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>(user);

  const startEdit = () => {
    setDraft(user);
    setEditing(true);
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    userStore.update(draft, CURRENT_USER.name);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">View and update your details.</p>
          </div>
          {!editing && (
            <button
              onClick={startEdit}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#004C3F] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
        </div>

        <div className="rounded-xl border border-[#C7E6DB] bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 border-b border-[#E2F3ED] pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004C3F] text-xl font-semibold text-white">
              {user.initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-foreground">{user.name}</div>
              <div className="truncate text-sm text-muted-foreground">{user.role}</div>
              <div className="truncate text-xs text-muted-foreground">{user.branch}</div>
            </div>
          </div>

          {editing ? (
            <form onSubmit={save} className="grid gap-4 pt-6 sm:grid-cols-2">
              <Field label="Full name">
                <input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="pf-input" />
              </Field>
              <Field label="Role">
                <input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} className="pf-input" />
              </Field>
              <Field label="Branch">
                <input value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })} className="pf-input" />
              </Field>
              <Field label="Email">
                <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="pf-input" />
              </Field>
              <Field label="Phone">
                <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="pf-input" />
              </Field>
              <Field label="Initials (avatar)">
                <input maxLength={3} value={draft.initials} onChange={(e) => setDraft({ ...draft, initials: e.target.value.toUpperCase() })} className="pf-input" placeholder="Auto from name if blank" />
              </Field>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center gap-1.5 rounded-md border border-[#C7E6DB] px-3 py-2 text-sm font-medium text-foreground hover:bg-[#E2F3ED]">
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-md bg-[#004C3F] px-3 py-2 text-sm font-medium text-white hover:opacity-90">
                  <Save className="h-4 w-4" /> Save changes
                </button>
              </div>
              <style>{`.pf-input{width:100%;border:1px solid #C7E6DB;background:#fff;border-radius:8px;padding:8px 12px;font-size:14px;outline:none}.pf-input:focus{border-color:#004C3F;box-shadow:0 0 0 2px #E2F3ED}`}</style>
            </form>
          ) : (
            <dl className="grid gap-4 pt-6 sm:grid-cols-2">
              <Row icon={<BadgeCheck className="h-4 w-4" />} label="Role" value={user.role} />
              <Row icon={<Building2 className="h-4 w-4" />} label="Branch" value={user.branch} />
              <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
              <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone} />
            </dl>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-[#C7E6DB] bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E2F3ED] text-[#004C3F]">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Activity log</h2>
              <p className="text-xs text-muted-foreground">Every profile change, who made it, and when.</p>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#C7E6DB] bg-[#FAFDFB] p-6 text-center text-sm text-muted-foreground">
              No changes yet. Edit your profile to see entries here.
            </div>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-[#E2F3ED] pl-5">
              {activity.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-[#004C3F] bg-white" />
                  <div className="rounded-lg border border-[#E2F3ED] bg-[#FAFDFB] p-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground">
                      <span className="font-medium">{fieldLabel(entry.field)}</span>
                      <span className="inline-flex max-w-[40%] items-center gap-1.5 truncate">
                        <span className="truncate rounded bg-white px-1.5 py-0.5 text-xs text-muted-foreground line-through">
                          {entry.fromValue || "—"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-[#004C3F]" />
                        <span className="truncate rounded bg-[#E2F3ED] px-1.5 py-0.5 text-xs font-medium text-[#004C3F]">
                          {entry.toValue || "—"}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      by <span className="font-medium text-foreground">{entry.by}</span> ·{" "}
                      {new Date(entry.at).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#E2F3ED] bg-[#FAFDFB] p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[#004C3F]">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value || "—"}</div>
    </div>
  );
}
