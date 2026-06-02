import { useMemo, useState } from "react";
import { Bell, ChevronRight, Plus, Search } from "lucide-react";
import {
  PIPELINE_STAGES,
  STAGE_BADGE,
  TEMP_DOT,
  formatFollowUp,
  followUpStatus,
  type Lead,
} from "@/lib/leads-store";

type SortKey = "date" | "name" | "stage";

type Group = {
  key: "overdue" | "today" | "soon" | "later";
  title: string;
  tone: string;
  leads: Lead[];
};

export function FollowUpsView({
  leads,
  onOpen,
  onNew,
}: {
  leads: Lead[];
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  const stageOrder = (s: Lead["stage"]) => PIPELINE_STAGES.indexOf(s);

  const groups = useMemo<Group[]>(() => {
    const q = query.trim().toLowerCase();
    const active = leads.filter((l) => {
      if (!l.followUpDate) return false;
      if (l.stage === "Closed Won" || l.stage === "Closed Lost") return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q)
      );
    });

    const gs: Group[] = [
      { key: "overdue", title: "Overdue", tone: "text-red-600", leads: [] },
      { key: "today", title: "Today", tone: "text-amber-600", leads: [] },
      { key: "soon", title: "This Week", tone: "text-amber-700", leads: [] },
      { key: "later", title: "Upcoming", tone: "text-foreground", leads: [] },
    ];

    for (const l of active) {
      const s = followUpStatus(l.followUpDate);
      if (!s) continue;
      gs.find((g) => g.key === s.kind)!.leads.push(l);
    }

    const sorter = (a: Lead, b: Lead) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "stage") return stageOrder(a.stage) - stageOrder(b.stage);
      return (a.followUpDate ?? "").localeCompare(b.followUpDate ?? "");
    };
    for (const g of gs) g.leads.sort(sorter);
    return gs;
  }, [leads, query, sortKey]);

  const total = groups.reduce((n, g) => n + g.leads.length, 0);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#E2F3ED] text-[#004C3F]">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Pending Follow-Ups
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {total === 0
                  ? "You're all caught up — no scheduled follow-ups."
                  : `${total} lead${total === 1 ? "" : "s"} with scheduled reminders.`}
              </p>
            </div>
          </div>
          <button
            onClick={onNew}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search follow-ups by name, ID or phone..."
            className="input pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="shrink-0">Sort by</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="input w-full sm:w-44"
          >
            <option value="date">Follow-Up Date</option>
            <option value="name">Lead Name</option>
            <option value="stage">Pipeline Stage</option>
          </select>
        </label>
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {query
            ? "No follow-ups match your search."
            : "No follow-ups scheduled. Open any lead to set one."}
        </div>
      ) : (
        groups
          .filter((g) => g.leads.length > 0)
          .map((g) => (
            <section key={g.key} className="space-y-2">
              <h3 className={`text-sm font-semibold ${g.tone}`}>
                {g.title}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({g.leads.length})
                </span>
              </h3>
              <div className="space-y-2">
                {g.leads.map((l) => {
                  const s = followUpStatus(l.followUpDate);
                  const due =
                    s?.kind === "overdue"
                      ? `${Math.abs(s.diffDays)}d overdue`
                      : s?.kind === "today"
                        ? "Today"
                        : s?.kind === "soon"
                          ? `In ${s.diffDays}d`
                          : formatFollowUp(l.followUpDate);
                  return (
                    <button
                      key={l.id}
                      onClick={() => onOpen(l.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent/40 ${
                        s?.kind === "overdue"
                          ? "border-red-200"
                          : s?.kind === "today"
                            ? "border-amber-200"
                            : "border-border"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${TEMP_DOT[l.temperature]}`} />
                          <span className="truncate font-semibold text-foreground">
                            {l.name}
                          </span>
                          <span className="hidden text-xs text-muted-foreground sm:inline">
                            · {l.id}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STAGE_BADGE[l.stage]}`}
                          >
                            {l.stage}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {l.phone}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-right">
                        <div>
                          <div
                            className={`text-sm font-semibold ${
                              s?.kind === "overdue"
                                ? "text-red-600"
                                : s?.kind === "today"
                                  ? "text-amber-600"
                                  : "text-foreground"
                            }`}
                          >
                            {due}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {formatFollowUp(l.followUpDate)}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
      )}
    </div>
  );
}
