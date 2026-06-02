import { Bell, ChevronRight } from "lucide-react";
import {
  formatDate,
  formatFollowUp,
  followUpStatus,
  STAGE_BADGE,
  TEMP_DOT,
  type Lead,
} from "@/lib/leads-store";

function FollowUpPill({ dateStr }: { dateStr?: string | null }) {
  const status = followUpStatus(dateStr);
  if (!status) return null;
  const tone =
    status.kind === "overdue"
      ? "bg-red-50 text-red-700 border-red-200"
      : status.kind === "today"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : status.kind === "soon"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-slate-50 text-slate-600 border-slate-200";
  const label =
    status.kind === "overdue"
      ? `${Math.abs(status.diffDays)}d overdue`
      : status.kind === "today"
        ? "Today"
        : status.kind === "soon"
          ? `In ${status.diffDays}d`
          : formatFollowUp(dateStr);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${tone}`}
      title={`Follow-up: ${formatFollowUp(dateStr)}`}
    >
      <Bell className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

export function LeadsTable({
  leads,
  onOpen,
}: {
  leads: Lead[];
  onOpen: (id: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        No leads match your filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Lead Name</th>
              <th className="px-4 py-3 font-medium">Lead ID</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Temp</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((l) => (
              <tr
                key={l.id}
                className="cursor-pointer hover:bg-accent/40"
                onClick={() => onOpen(l.id)}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <span>{l.name}</span>
                    <FollowUpPill dateStr={l.followUpDate} />
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{l.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.phone}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${STAGE_BADGE[l.stage]}`}
                  >
                    {l.stage}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${TEMP_DOT[l.temperature]}`} />
                    <span className="text-xs text-foreground">{l.temperature}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(l.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(l.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
                  >
                    View <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {leads.map((l) => (
          <button
            key={l.id}
            onClick={() => onOpen(l.id)}
            className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors active:bg-accent/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${TEMP_DOT[l.temperature]}`} />
                  <span className="truncate font-semibold text-foreground">{l.name}</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {l.id} · {l.phone}
                </div>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${STAGE_BADGE[l.stage]}`}
                >
                  {l.stage}
                </span>
                <FollowUpPill dateStr={l.followUpDate} />
              </div>
              <span className="text-[11px] text-muted-foreground">{formatDate(l.createdAt)}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
