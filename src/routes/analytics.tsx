import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Flame,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { TopNav } from "@/components/dashboard/TopNav";
import { useLeads } from "@/lib/leads-state";
import { PIPELINE_STAGES, followUpStatus, type Lead } from "@/lib/leads-store";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Performance Analytics — Field CRM" },
      {
        name: "description",
        content:
          "Weekly performance, conversion funnel and lead activity for sales reps.",
      },
    ],
  }),
  component: AnalyticsPage,
});

// Palette
const GREEN = "#004C3F";
const MINT = "#E2F3ED";
const GREEN_SOFT = "#1F7A66";
const MINT_BORDER = "#C7E6DB";

const STAGE_TINT: Record<string, string> = {
  Lead: "#A7C8BD",
  "Pre-Qualified": "#7FB3A2",
  Qualified: "#4F9D85",
  "Inspection Booked": "#2E8068",
  "Inspection Completed": "#176A52",
  "Closed Won": GREEN,
  "Closed Lost": "#9CA3AF",
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function dayKey(d: Date) {
  return startOfDay(d).toISOString().slice(0, 10);
}
function dayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function buildWeek(leads: Lead[]) {
  const today = startOfDay(new Date());
  const startThis = new Date(today);
  startThis.setDate(today.getDate() - 6); // last 7 days incl today

  const days: { key: string; label: string; date: Date; created: number; updates: number; won: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startThis);
    d.setDate(startThis.getDate() + i);
    days.push({ key: dayKey(d), label: dayLabel(d), date: d, created: 0, updates: 0, won: 0 });
  }
  const idx = new Map(days.map((d) => [d.key, d]));

  for (const l of leads) {
    const k = dayKey(new Date(l.createdAt));
    const row = idx.get(k);
    if (row) row.created += 1;
    for (const h of l.history) {
      const hk = dayKey(new Date(h.at));
      const r = idx.get(hk);
      if (!r) continue;
      r.updates += 1;
      if (h.toStage === "Closed Won") r.won += 1;
    }
  }
  return { days, startThis };
}

function compareToPrev(leads: Lead[], startThis: Date) {
  const startPrev = new Date(startThis);
  startPrev.setDate(startThis.getDate() - 7);
  const inRange = (iso: string, from: Date, to: Date) => {
    const t = new Date(iso).getTime();
    return t >= from.getTime() && t < to.getTime();
  };

  const thisCreated = leads.filter((l) => inRange(l.createdAt, startThis, new Date(startThis.getTime() + 7 * 86400000))).length;
  const prevCreated = leads.filter((l) => inRange(l.createdAt, startPrev, startThis)).length;

  const wonInRange = (from: Date, to: Date) =>
    leads.reduce(
      (n, l) =>
        n +
        l.history.filter((h) => h.toStage === "Closed Won" && inRange(h.at, from, to))
          .length,
      0,
    );
  const thisWon = wonInRange(startThis, new Date(startThis.getTime() + 7 * 86400000));
  const prevWon = wonInRange(startPrev, startThis);

  return { thisCreated, prevCreated, thisWon, prevWon };
}

function pct(curr: number, prev: number) {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return Math.round(((curr - prev) / prev) * 100);
}

function AnalyticsPage() {
  const leads = useLeads();

  const { days, startThis } = useMemo(() => buildWeek(leads), [leads]);
  const cmp = useMemo(() => compareToPrev(leads, startThis), [leads, startThis]);

  const totalActivity = days.reduce((n, d) => n + d.updates, 0);

  // Conversion funnel
  const funnel = PIPELINE_STAGES.filter((s) => s !== "Closed Lost").map((stage) => ({
    stage,
    count: leads.filter((l) => l.history.some((h) => h.toStage === stage)).length,
  }));

  // Temperature distribution
  const tempData = (["Hot", "Warm", "Cold"] as const).map((t) => ({
    name: t,
    value: leads.filter((l) => l.temperature === t).length,
  }));
  const TEMP_COLOR: Record<string, string> = {
    Hot: GREEN,
    Warm: GREEN_SOFT,
    Cold: MINT_BORDER,
  };

  // Pending follow-up bucket counts
  const buckets = { overdue: 0, today: 0, soon: 0, later: 0 };
  for (const l of leads) {
    if (l.stage === "Closed Won" || l.stage === "Closed Lost") continue;
    const s = followUpStatus(l.followUpDate);
    if (s) buckets[s.kind] += 1;
  }

  const closed = leads.filter(
    (l) => l.stage === "Closed Won" || l.stage === "Closed Lost",
  ).length;
  const won = leads.filter((l) => l.stage === "Closed Won").length;
  const winRate = closed === 0 ? 0 : Math.round((won / closed) * 100);

  const kpis = [
    {
      label: "New Leads This Week",
      value: cmp.thisCreated,
      delta: pct(cmp.thisCreated, cmp.prevCreated),
      icon: TrendingUp,
    },
    {
      label: "Deals Won This Week",
      value: cmp.thisWon,
      delta: pct(cmp.thisWon, cmp.prevWon),
      icon: Trophy,
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      sub: `${won} won of ${closed} closed`,
      icon: Target,
    },
    {
      label: "Activity (7d)",
      value: totalActivity,
      sub: "stage updates this week",
      icon: Flame,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to dashboard
            </Link>
            <h1
              className="mt-1 text-xl font-semibold sm:text-2xl"
              style={{ color: GREEN }}
            >
              Performance Analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Your last 7 days at a glance.
            </p>
          </div>
          <div
            className="rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: MINT,
              borderColor: MINT_BORDER,
              color: GREEN,
            }}
          >
            {startThis.toLocaleDateString(undefined, { month: "short", day: "numeric" })}{" "}
            – {new Date(startThis.getTime() + 6 * 86400000).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {kpis.map((k) => {
            const trend =
              typeof k.delta === "number"
                ? k.delta > 0
                  ? "up"
                  : k.delta < 0
                    ? "down"
                    : "flat"
                : null;
            return (
              <div
                key={k.label}
                className="rounded-xl border p-4 shadow-sm"
                style={{ backgroundColor: "#FFFFFF", borderColor: MINT_BORDER }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                    {k.label}
                  </span>
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: MINT, color: GREEN }}
                  >
                    <k.icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: GREEN }}>
                  {k.value}
                </div>
                {trend ? (
                  <div
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium"
                    style={{
                      color:
                        trend === "up" ? GREEN : trend === "down" ? "#B23A48" : "#6b7280",
                    }}
                  >
                    {trend === "up" ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : trend === "down" ? (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    ) : null}
                    {Math.abs(k.delta!)}% vs last week
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly activity area chart */}
        <ChartCard
          title="Weekly Activity"
          subtitle="New leads and stage updates over the last 7 days"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={days} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gUpdates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN_SOFT} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GREEN_SOFT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={MINT} vertical={false} />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<NiceTooltip />} />
              <Area
                type="monotone"
                dataKey="created"
                name="New Leads"
                stroke={GREEN}
                strokeWidth={2}
                fill="url(#gCreated)"
              />
              <Area
                type="monotone"
                dataKey="updates"
                name="Stage Updates"
                stroke={GREEN_SOFT}
                strokeWidth={2}
                fill="url(#gUpdates)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <Legend
            items={[
              { color: GREEN, label: "New Leads" },
              { color: GREEN_SOFT, label: "Stage Updates" },
            ]}
          />
        </ChartCard>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Conversion funnel */}
          <ChartCard
            title="Pipeline Funnel"
            subtitle="How many leads have reached each stage"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={funnel}
                layout="vertical"
                margin={{ top: 5, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={MINT} horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip content={<NiceTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnel.map((f) => (
                    <Cell key={f.stage} fill={STAGE_TINT[f.stage] ?? GREEN} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Temperature distribution */}
          <ChartCard
            title="Lead Temperature Mix"
            subtitle="Distribution of all active and closed leads"
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={tempData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {tempData.map((t) => (
                      <Cell key={t.name} fill={TEMP_COLOR[t.name]} />
                    ))}
                  </Pie>
                  <Tooltip content={<NiceTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="w-full space-y-2 sm:max-w-[160px]">
                {tempData.map((t) => (
                  <li
                    key={t.name}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: MINT_BORDER, backgroundColor: "#FFFFFF" }}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: TEMP_COLOR[t.name] }}
                      />
                      <span className="font-medium" style={{ color: GREEN }}>
                        {t.name}
                      </span>
                    </span>
                    <span className="text-muted-foreground">{t.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ChartCard>
        </div>

        {/* Follow-up status summary */}
        <ChartCard
          title="Follow-Up Status"
          subtitle="Where your pending reminders stand right now"
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <BucketTile label="Overdue" value={buckets.overdue} accent="#B23A48" icon={Bell} />
            <BucketTile label="Today" value={buckets.today} accent={GREEN} icon={Bell} />
            <BucketTile label="This Week" value={buckets.soon} accent={GREEN_SOFT} icon={Bell} />
            <BucketTile label="Upcoming" value={buckets.later} accent="#6b7280" icon={Bell} />
          </div>
        </ChartCard>
      </main>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mt-4 rounded-xl border p-4 shadow-sm sm:p-5 ${className}`}
      style={{ backgroundColor: "#FFFFFF", borderColor: MINT_BORDER }}
    >
      <header className="mb-3">
        <h2 className="text-sm font-semibold sm:text-base" style={{ color: GREEN }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  );
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-4 px-2 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function NiceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-md"
      style={{ backgroundColor: "#FFFFFF", borderColor: MINT_BORDER, color: GREEN }}
    >
      {label && <div className="mb-1 font-semibold">{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey ?? p.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color ?? p.payload?.fill ?? GREEN }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function BucketTile({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ backgroundColor: MINT, borderColor: MINT_BORDER }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: GREEN }}>
          {label}
        </span>
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div className="mt-1 text-2xl font-semibold" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}
