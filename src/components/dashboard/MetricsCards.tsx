import { Users, Activity, Trophy, Bell } from "lucide-react";
import { followUpStatus, type Lead } from "@/lib/leads-store";

export function MetricsCards({
  leads,
  onPendingClick,
}: {
  leads: Lead[];
  onPendingClick?: () => void;
}) {
  const total = leads.length;
  const active = leads.filter(
    (l) => l.stage !== "Closed Won" && l.stage !== "Closed Lost",
  ).length;
  const won = leads.filter((l) => l.stage === "Closed Won").length;
  const pending = leads.filter((l) => {
    if (l.stage === "Closed Won" || l.stage === "Closed Lost") return false;
    const s = followUpStatus(l.followUpDate);
    return s !== null && s.kind !== "later";
  }).length;

  const items = [
    { label: "Total Leads", value: total, icon: Users, tone: "text-[#004C3F] bg-[#E2F3ED]", action: undefined as undefined | (() => void) },
    { label: "Active Leads", value: active, icon: Activity, tone: "text-[#004C3F] bg-[#E2F3ED]", action: undefined },
    { label: "Closed Won", value: won, icon: Trophy, tone: "text-white bg-[#004C3F]", action: undefined },
    { label: "Pending Follow-Ups", value: pending, icon: Bell, tone: "text-[#004C3F] bg-[#E2F3ED]", action: onPendingClick },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((it) => {
        const clickable = !!it.action;
        const Tag = clickable ? "button" : "div";
        return (
          <Tag
            key={it.label}
            onClick={it.action}
            className={`rounded-xl border border-border bg-card p-4 text-left shadow-sm ${
              clickable ? "cursor-pointer transition-colors hover:bg-accent/40" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                {it.label}
              </span>
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${it.tone}`}>
                <it.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
              {it.value}
            </div>
          </Tag>
        );
      })}
    </div>
  );
}
