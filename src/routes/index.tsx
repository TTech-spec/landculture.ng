import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import AuthFlow, { type User as AuthUser } from "@/auth";
import WelcomePage from "@/components/welcomeScreen";
import { Plus, Search, LayoutGrid, Bell } from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { StageFilter } from "@/components/dashboard/StageFilter";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { NewLeadDialog } from "@/components/dashboard/NewLeadDialog";
import { LeadDetail } from "@/components/dashboard/LeadDetail";
import { FollowUpsView } from "@/components/dashboard/FollowUpsView";
import {
  followUpStatus,
  type Stage,
  type Temperature,
} from "@/lib/leads-store";
import { leadsStore, useLeads } from "@/lib/leads-state";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sales Rep Dashboard — Field CRM" },
      {
        name: "description",
        content:
          "Manage leads, track pipeline stages, and log activity from the field.",
      },
    ],
  }),
  component: AuthGate,
});

type AppScreen = "welcome" | "auth" | "dashboard";

function AuthGate() {
  const [screen, setScreen] = useState<AppScreen>("welcome");
  const [authedUser, setAuthedUser] = useState<AuthUser | null>(null);

  if (screen === "welcome") {
    return <WelcomePage onGetStarted={() => setScreen("auth")} />;
  }
  if (screen === "auth" || !authedUser) {
    return (
      <AuthFlow
        onSuccess={(user) => {
          setAuthedUser(user);
          setScreen("dashboard");
        }}
      />
    );
  }
  return <Dashboard />;
}

type StageFilterValue = "All" | Stage;
type TempFilterValue = "All" | Temperature;
type ViewMode = "all" | "followups";

function Dashboard() {
  const leads = useLeads();
  const setLeads = (updater: (prev: typeof leads) => typeof leads) =>
    leadsStore.set(updater);
  const [view, setView] = useState<ViewMode>("all");
  const [stageFilter, setStageFilter] = useState<StageFilterValue>("All");
  const [tempFilter, setTempFilter] = useState<TempFilterValue>("All");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const pendingCount = useMemo(
    () =>
      leads.filter((l) => {
        if (l.stage === "Closed Won" || l.stage === "Closed Lost") return false;
        const s = followUpStatus(l.followUpDate);
        return s !== null && s.kind !== "later";
      }).length,
    [leads],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (stageFilter !== "All" && l.stage !== stageFilter) return false;
      if (tempFilter !== "All" && l.temperature !== tempFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q)
      );
    });
  }, [leads, stageFilter, tempFilter, query]);

  const openLead = leads.find((l) => l.id === openLeadId) || null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        {openLead ? (
          <LeadDetail
            lead={openLead}
            onBack={() => setOpenLeadId(null)}
            onUpdate={(updated) => {
              setLeads((prev) =>
                prev.map((l) => (l.id === updated.id ? updated : l)),
              );
            }}
          />
        ) : (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                  Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your leads and pipeline at a glance.
                </p>
              </div>
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Lead
              </button>
            </div>

            <MetricsCards leads={leads} onPendingClick={() => setView("followups")} />

            <div className="inline-flex rounded-lg border border-border bg-card p-1 text-sm">
              <button
                onClick={() => setView("all")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                  view === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                All Leads
              </button>
              <button
                onClick={() => setView("followups")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                  view === "followups"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bell className="h-4 w-4" />
                Follow-Ups
                {pendingCount > 0 && (
                  <span
                    className={`ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                      view === "followups"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-[#E2F3ED] text-[#004C3F]"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {view === "all" ? (
              <>
                <StageFilter
                  leads={leads}
                  value={stageFilter}
                  onChange={setStageFilter}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, ID or phone..."
                      className="input pl-9"
                    />
                  </div>
                  <select
                    value={tempFilter}
                    onChange={(e) =>
                      setTempFilter(e.target.value as TempFilterValue)
                    }
                    className="input w-full sm:w-44"
                  >
                    <option value="All">All Temperatures</option>
                    <option value="Hot">Hot</option>
                    <option value="Warm">Warm</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>

                <LeadsTable leads={filtered} onOpen={(id) => setOpenLeadId(id)} />
              </>
            ) : (
              <FollowUpsView
                leads={leads}
                onOpen={(id) => setOpenLeadId(id)}
                onNew={() => setCreating(true)}
              />
            )}
          </div>
        )}
      </main>

      <NewLeadDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(lead) => setLeads((prev) => [lead, ...prev])}
      />
    </div>
  );
}
