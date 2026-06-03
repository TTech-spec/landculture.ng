import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/dashboard/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Users,
  Trophy,
  Target,
  Phone,
  Mail,
  Calendar,
  FileText,
  ArrowRightLeft,
  Search,
  Plus,
  Pencil,
  MessageSquare,
} from "lucide-react";
import {
  reps,
  leads as seedLeads,
  activities as seedActivities,
  type Stage,
  type Temperature,
  type Lead,
  type Activity,
  type LeadNote,
  type PlotSize,
} from "@/lib/mock-data";

const PLOT_SIZES: PlotSize[] = ["450sqm", "300sqm", "225sqm", "150sqm", "100sqm"];

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Team Lead Sales Dashboard" },
      { name: "description", content: "Monitor your sales team's pipeline, activity, and performance." },
    ],
  }),
  component: Dashboard,
});

const stageColors: Record<Stage, string> = {
  lead: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  pre_qualified: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  qualified: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  inspection_booked: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  inspection_completed: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  won: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  lost: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  customer: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
};

const tempColors: Record<Temperature, string> = {
  hot: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  warm: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  cold: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
};

const STAGES: Stage[] = ["lead", "pre_qualified", "qualified", "inspection_booked", "inspection_completed", "won", "lost", "customer"];
const TEMPS: Temperature[] = ["hot", "warm", "cold"];
const STAGE_LABEL: Record<Stage, string> = {
  lead: "Lead",
  pre_qualified: "Pre-qualified",
  qualified: "Qualified",
  inspection_booked: "Inspection Booked",
  inspection_completed: "Inspection Completed",
  won: "Closed Won",
  lost: "Closed Lost",
  customer: "Customer",
};
const TEAM_LEAD_NAME = "Team Lead";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function TimeAgo({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const compute = () => {
      const diff = (Date.now() - new Date(iso).getTime()) / 1000;
      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    };
    setText(compute());
  }, [iso]);
  return <span suppressHydrationWarning>{text || "\u00A0"}</span>;
}

const activityIcon = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  stage_change: ArrowRightLeft,
};

type LeadDraft = {
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  value: number;
  totalAmount: number;
  stage: Stage;
  temperature: Temperature;
  ownerId: string;
  note?: string;
  numberOfPlots?: number;
  plotSize?: PlotSize | "";
};

const emptyDraft = (): LeadDraft => ({
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "Website",
  value: 0,
  totalAmount: 0,
  stage: "lead",
  temperature: "warm",
  ownerId: reps[0].id,
  note: "",
  numberOfPlots: undefined,
  plotSize: "",
});

function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [activities, setActivities] = useState<Activity[]>(seedActivities);

  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [temp, setTemp] = useState<string>("all");
  const [owner, setOwner] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(8);

  const [viewingLeadId, setViewingLeadId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewingRep, setViewingRep] = useState<string | null>(null);

  const viewingLead = viewingLeadId ? leads.find((l) => l.id === viewingLeadId) ?? null : null;

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (stage === "all" || l.stage === stage) &&
          (temp === "all" || l.temperature === temp) &&
          (owner === "all" || l.ownerId === owner) &&
          (q === "" || `${l.name} ${l.company}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [leads, q, stage, temp, owner],
  );

  useEffect(() => {
    setVisibleCount(8);
  }, [q, stage, temp, owner]);

  const visibleLeads = filtered.slice(0, visibleCount);

  const kpis = useMemo(() => {
    const active = leads.filter((l) => l.stage !== "won" && l.stage !== "lost");
    const won = leads.filter((l) => l.stage === "won");
    return {
      pipelineValue: active.reduce((s, l) => s + l.value, 0),
      activeLeads: active.length,
      wonThisMonth: won.length,
      conversionRate: leads.length ? Math.round((won.length / leads.length) * 100) : 0,
    };
  }, [leads]);

  const followUps = useMemo(
    () =>
      leads
        .filter((l) => l.nextFollowUp)
        .sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime()),
    [leads],
  );

  function handleCreate(draft: LeadDraft) {
    const now = new Date().toISOString();
    const { note, plotSize, ...rest } = draft;
    const owner = reps.find((r) => r.id === draft.ownerId);
    const initialNotes: LeadNote[] = note && note.trim()
      ? [{ id: `n${Date.now()}`, author: owner?.name ?? "Team Lead", text: note.trim(), at: now }]
      : [];
    const lead: Lead = {
      id: `l${Date.now()}`,
      ...rest,
      plotSize: plotSize ? plotSize : undefined,
      createdAt: now,
      updatedAt: now,
      nextFollowUp: new Date(Date.now() + 2 * 86400000).toISOString(),
      notes: initialNotes,
    };
    setLeads((prev) => [lead, ...prev]);
    setActivities((prev) => [
      {
        id: `a${Date.now()}`,
        repId: draft.ownerId,
        leadId: lead.id,
        type: "note",
        leadName: `${lead.name} · ${lead.company}`,
        detail: note && note.trim() ? `New lead added — ${note.trim().slice(0, 60)}` : "New lead added",
        at: now,
      },
      ...prev,
    ]);
    setCreating(false);
  }

  function handleUpdate(id: string, draft: LeadDraft) {
    const prevLead = leads.find((l) => l.id === id);
    const { note: _note, plotSize, ...rest } = draft;
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...rest, plotSize: plotSize ? plotSize : undefined, updatedAt: new Date().toISOString() } : l)),
    );
    if (prevLead && prevLead.stage !== draft.stage) {
      setActivities((prev) => [
        {
          id: `a${Date.now()}`,
          repId: draft.ownerId,
          leadId: id,
          type: "stage_change",
          leadName: `${draft.name} · ${draft.company}`,
          detail: `Moved from ${STAGE_LABEL[prevLead.stage]} to ${STAGE_LABEL[draft.stage]}`,
          at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setEditing(null);
  }

  function handleAddNote(leadId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const note: LeadNote = {
      id: `n${Date.now()}`,
      author: TEAM_LEAD_NAME,
      text: trimmed,
      at: new Date().toISOString(),
    };
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes: [note, ...l.notes] } : l)),
    );
    setActivities((prev) => [
      {
        id: `a${Date.now()}`,
        repId: lead.ownerId,
        leadId,
        type: "note",
        leadName: `${lead.name} · ${lead.company}`,
        detail: `Team Lead added a comment`,
        at: note.at,
      },
      ...prev,
    ]);
  }

  const repDetail = viewingRep ? reps.find((r) => r.id === viewingRep) ?? null : null;
  const repLeads = repDetail ? leads.filter((l) => l.ownerId === repDetail.id) : [];
  const repActivities = repDetail ? activities.filter((a) => a.repId === repDetail.id) : [];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <header className="border-b bg-card">
        <div className="mx-auto max-w-[1400px] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Team Pipeline</h1>
            <p className="text-sm text-muted-foreground">Team Alpha · {reps.length} reps</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4 mr-1" /> Add Lead
            </Button>
            <Avatar>
              <AvatarFallback>TR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={TrendingUp} label="Pipeline value" value={fmt(kpis.pipelineValue)} />
          <KpiCard icon={Users} label="Active leads" value={kpis.activeLeads.toString()} />
          <KpiCard icon={Trophy} label="Won this month" value={kpis.wonThisMonth.toString()} />
          <KpiCard icon={Target} label="Conversion rate" value={`${kpis.conversionRate}%`} />
        </div>

        <Card>
          <CardContent className="pt-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search lead or company..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <FilterSelect
              value={stage}
              onChange={setStage}
              placeholder="Stage"
              options={[["all", "All stages"], ...STAGES.map((s) => [s, s] as [string, string])]}
            />
            <FilterSelect
              value={temp}
              onChange={setTemp}
              placeholder="Temperature"
              options={[["all", "All temps"], ...TEMPS.map((t) => [t, t] as [string, string])]}
            />
            <FilterSelect
              value={owner}
              onChange={setOwner}
              placeholder="Owner"
              options={[["all", "All reps"], ...reps.map((r) => [r.id, r.name] as [string, string])]}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="pipeline">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="reps">Reps</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="mt-4 space-y-6">
            <PerformanceCharts leads={leads} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leads ({filtered.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    No leads match your filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Lead</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Temp</TableHead>
                          <TableHead className="text-right">Initial payment</TableHead>
                          <TableHead className="text-right">Total amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleLeads.map((l) => {
                          const r = reps.find((r) => r.id === l.ownerId)!;
                          return (
                            <TableRow
                              key={l.id}
                              className="cursor-pointer"
                              onClick={() => setViewingLeadId(l.id)}
                            >
                              <TableCell>
                                <div className="font-medium">{l.name}</div>
                                <div className="text-xs text-muted-foreground">{l.company}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-6 text-xs">
                                    <AvatarFallback>{r.avatar}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{r.name.split(" ")[0]}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={stageColors[l.stage]} variant="secondary">
                                  {STAGE_LABEL[l.stage]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={tempColors[l.temperature]}>
                                  {l.temperature}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">{fmt(l.value)}</TableCell>
                              <TableCell className="text-right font-semibold">{fmt(l.totalAmount)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      <tfoot>
                        <tr className="border-t bg-muted/40">
                          <td colSpan={4} className="px-4 py-2 text-sm font-medium text-muted-foreground">
                            Totals ({filtered.length})
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-semibold">
                            {fmt(filtered.reduce((s, l) => s + l.value, 0))}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-semibold">
                            {fmt(filtered.reduce((s, l) => s + l.totalAmount, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                )}
                {filtered.length > 8 && (
                  <div className="flex items-center justify-center gap-3 border-t p-4">
                    <span className="text-xs text-muted-foreground">
                      Showing {visibleLeads.length} of {filtered.length}
                    </span>
                    {visibleCount < filtered.length && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setVisibleCount((c) => c + 8)}
                        >
                          See more
                        </Button>
                        {filtered.length - visibleCount > 8 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVisibleCount(filtered.length)}
                          >
                            Show all
                          </Button>
                        )}
                      </>
                    )}
                    {visibleCount > 8 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVisibleCount(8)}
                      >
                        See less
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reps" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reps.map((r) => (
                <Card
                  key={r.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setViewingRep(r.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarFallback>{r.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <div className="text-muted-foreground text-xs">Active leads</div>
                        <div className="font-semibold">{r.activeLeads}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Won (month)</div>
                        <div className="font-semibold">{r.wonThisMonth}</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Quota</span>
                        <span className="font-medium">{r.quotaPct}%</span>
                      </div>
                      <Progress value={Math.min(r.quotaPct, 100)} />
                    </div>
                    <div className="mt-3 text-xs text-primary">View details →</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="followups" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming follow-ups</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {followUps.map((l) => {
                      const r = reps.find((r) => r.id === l.ownerId)!;
                      const due = new Date(l.nextFollowUp!);
                      return (
                        <TableRow
                          key={l.id}
                          className="cursor-pointer"
                          onClick={() => setViewingLeadId(l.id)}
                        >
                          <TableCell>
                            <div className="font-medium">{l.name}</div>
                            <div className="text-xs text-muted-foreground">{l.company}</div>
                          </TableCell>
                          <TableCell>{r.name}</TableCell>
                          <TableCell>
                            <Badge className={stageColors[l.stage]} variant="secondary">
                              {STAGE_LABEL[l.stage]}
                            </Badge>
                          </TableCell>
                          <TableCell suppressHydrationWarning>{due.toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <LeadFormDialog
        open={creating}
        onOpenChange={(o) => !o && setCreating(false)}
        title="Add my personal lead"
        initial={emptyDraft()}
        onSubmit={handleCreate}
      />
      <LeadFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title="Edit lead"
        initial={
          editing
            ? {
                name: editing.name,
                company: editing.company,
                email: editing.email,
                phone: editing.phone,
                source: editing.source,
                value: editing.value,
                totalAmount: editing.totalAmount,
                stage: editing.stage,
                temperature: editing.temperature,
                ownerId: editing.ownerId,
                numberOfPlots: editing.numberOfPlots,
                plotSize: editing.plotSize ?? "",
              }
            : emptyDraft()
        }
        onSubmit={(d) => editing && handleUpdate(editing.id, d)}
      />

      <LeadDetailDialog
        lead={viewingLead}
        activities={activities}
        onClose={() => setViewingLeadId(null)}
        onEdit={(l) => {
          setViewingLeadId(null);
          setEditing(l);
        }}
        onAddNote={handleAddNote}
      />

      <Dialog open={!!repDetail} onOpenChange={(o) => !o && setViewingRep(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {repDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{repDetail.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{repDetail.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">{repDetail.email}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3 my-2">
                <StatBox label="Active leads" value={repDetail.activeLeads.toString()} />
                <StatBox label="Won this month" value={repDetail.wonThisMonth.toString()} />
                <StatBox label="Quota" value={`${repDetail.quotaPct}%`} />
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Leads ({repLeads.length})</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Temp</TableHead>
                        <TableHead className="text-right">Initial payment</TableHead>
                        <TableHead className="text-right">Total amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repLeads.map((l) => (
                        <TableRow
                          key={l.id}
                          className="cursor-pointer"
                          onClick={() => {
                            setViewingRep(null);
                            setViewingLeadId(l.id);
                          }}
                        >
                          <TableCell>
                            <div className="font-medium">{l.name}</div>
                            <div className="text-xs text-muted-foreground">{l.company}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={stageColors[l.stage]} variant="secondary">
                              {STAGE_LABEL[l.stage]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={tempColors[l.temperature]}>
                              {l.temperature}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{fmt(l.value)}</TableCell>
                          <TableCell className="text-right font-semibold">{fmt(l.totalAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Activity</h3>
                <div className="space-y-3">
                  {repActivities.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No recent activity.</div>
                  ) : (
                    repActivities.map((a) => {
                      const Icon = activityIcon[a.type];
                      return (
                        <div key={a.id} className="flex gap-3">
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Icon className="size-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm">{a.detail}</div>
                            <button
                              type="button"
                              onClick={() => {
                                if (!a.leadId) return;
                                setViewingRep(null);
                                setViewingLeadId(a.leadId);
                              }}
                              className="text-xs text-muted-foreground truncate text-left hover:text-primary"
                            >
                              {a.leadName}
                            </button>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              <TimeAgo iso={a.at} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LeadDetailDialog({
  lead,
  activities,
  onClose,
  onEdit,
  onAddNote,
}: {
  lead: Lead | null;
  activities: Activity[];
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onAddNote: (leadId: string, text: string) => void;
}) {
  const [comment, setComment] = useState("");
  useEffect(() => {
    setComment("");
  }, [lead?.id]);

  const open = !!lead;
  const leadActivities = lead ? activities.filter((a) => a.leadId === lead.id) : [];
  const owner = lead ? reps.find((r) => r.id === lead.ownerId) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {lead && owner && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-lg">{lead.name}</DialogTitle>
                  <div className="text-sm text-muted-foreground">{lead.company}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => onEdit(lead)}>
                  <Pencil className="size-4 mr-1" /> Edit
                </Button>
              </div>
              <div className="flex gap-2 pt-2">
                <Badge className={stageColors[lead.stage]} variant="secondary">
                  {STAGE_LABEL[lead.stage]}
                </Badge>
                <Badge variant="outline" className={tempColors[lead.temperature]}>
                  {lead.temperature}
                </Badge>
                <Badge variant="outline">{lead.source}</Badge>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailRow icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
              <DetailRow icon={Phone} label="Phone" value={lead.phone} href={`tel:${lead.phone}`} />
              <DetailRow icon={Target} label="Initial payment" value={fmt(lead.value)} />
              <DetailRow icon={TrendingUp} label="Total amount" value={fmt(lead.totalAmount)} />
              <DetailRow icon={Users} label="Owner" value={owner.name} />
              <DetailRow icon={Target} label="Number of plots" value={lead.numberOfPlots ? String(lead.numberOfPlots) : "—"} />
              <DetailRow icon={Target} label="Plot size" value={lead.plotSize ?? "—"} />
              <DetailRow
                icon={Calendar}
                label="Next follow-up"
                value={lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : "—"}
              />
              <DetailRow
                icon={FileText}
                label="Created"
                value={new Date(lead.createdAt).toLocaleDateString()}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="size-4" /> Comments ({lead.notes.length})
              </h3>
              <div className="space-y-2 mb-3">
                <Textarea
                  placeholder="Add a comment about this lead..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[70px]"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={!comment.trim()}
                    onClick={() => {
                      onAddNote(lead.id, comment);
                      setComment("");
                    }}
                  >
                    Post comment
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {lead.notes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No comments yet.</div>
                ) : (
                  lead.notes.map((n) => (
                    <div key={n.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-medium text-foreground">{n.author}</span>
                        <TimeAgo iso={n.at} />
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{n.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold mb-2">Activity history</h3>
              <div className="space-y-3">
                {leadActivities.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No activity logged for this lead yet.</div>
                ) : (
                  leadActivities.map((a) => {
                    const Icon = activityIcon[a.type];
                    const rep = reps.find((r) => r.id === a.repId);
                    return (
                      <div key={a.id} className="flex gap-3">
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Icon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-medium">{rep?.name.split(" ")[0] ?? "—"}</span> · {a.detail}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <TimeAgo iso={a.at} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        {href ? (
          <a href={href} className="text-sm font-medium text-primary hover:underline break-all">
            {value}
          </a>
        ) : (
          <div className="text-sm font-medium break-all">{value}</div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function LeadFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial: LeadDraft;
  onSubmit: (draft: LeadDraft) => void;
}) {
  const [draft, setDraft] = useState<LeadDraft>(initial);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(initial);
  }

  const valid = draft.name.trim() && draft.company.trim() && (draft.note ?? "").trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Contact name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <Label>Product</Label>
            <Input
              value={draft.company}
              onChange={(e) => setDraft({ ...draft, company: e.target.value })}
              placeholder="Product name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="jane@acme.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Source</Label>
              <Input
                value={draft.source}
                onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                placeholder="Website"
              />
            </div>
            <div>
              <Label>Initial payment (NGN)</Label>
              <Input
                type="number"
                value={draft.value === 0 ? "" : draft.value}
                onChange={(e) => setDraft({ ...draft, value: e.target.value === "" ? 0 : Number(e.target.value) || 0 })}
                placeholder="Leave blank if unknown"
              />
            </div>
          </div>
          <div>
            <Label>Total amount (NGN)</Label>
            <Input
              type="number"
              value={draft.totalAmount === 0 ? "" : draft.totalAmount}
              onChange={(e) => setDraft({ ...draft, totalAmount: e.target.value === "" ? 0 : Number(e.target.value) || 0 })}
              placeholder="Leave blank if unknown"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Number of plots</Label>
              <Input
                type="number"
                min={0}
                value={draft.numberOfPlots ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    numberOfPlots: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value) || 0),
                  })
                }
                placeholder="Leave blank if unknown"
              />
            </div>
            <div>
              <Label>Plot size</Label>
              <Select
                value={draft.plotSize ?? ""}
                onValueChange={(v) => setDraft({ ...draft, plotSize: v as PlotSize })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {PLOT_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Stage</Label>
              <Select value={draft.stage} onValueChange={(v) => setDraft({ ...draft, stage: v as Stage })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STAGE_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Temperature</Label>
              <Select
                value={draft.temperature}
                onValueChange={(v) => setDraft({ ...draft, temperature: v as Temperature })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Owner</Label>
            <Select value={draft.ownerId} onValueChange={(v) => setDraft({ ...draft, ownerId: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reps.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Note <span className="text-destructive">*</span></Label>
            <Textarea
              value={draft.note ?? ""}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              placeholder="Initial note about this lead (context, conversation, next steps)…"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!valid} onClick={() => onSubmit(draft)}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STAGE_HEX: Record<Stage, string> = {
  lead: "#3b82f6",
  pre_qualified: "#6366f1",
  qualified: "#8b5cf6",
  inspection_booked: "#f59e0b",
  inspection_completed: "#fb923c",
  won: "#10b981",
  lost: "#f43f5e",
  customer: "#14b8a6",
};

function PerformanceCharts({ leads }: { leads: Lead[] }) {
  const perRep = reps.map((r) => {
    const own = leads.filter((l) => l.ownerId === r.id);
    return {
      name: r.name.split(" ")[0],
      won: own.filter((l) => l.stage === "won").length,
      active: own.filter((l) => l.stage !== "won" && l.stage !== "lost").length,
      revenue: own.filter((l) => l.stage === "won").reduce((s, l) => s + l.totalAmount, 0),
    };
  });

  const byStage = STAGES.map((s) => ({
    stage: STAGE_LABEL[s],
    count: leads.filter((l) => l.stage === s).length,
    fill: STAGE_HEX[s],
  }));

  const compact = (n: number) =>
    new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Team performance</CardTitle>
          <p className="text-xs text-muted-foreground">Won vs active leads and revenue per rep</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perRep} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v: number) => `$${compact(v)}`}
                />
                <Tooltip
                  formatter={(v: number, name: string) =>
                    name === "revenue" ? fmt(v) : v.toString()
                  }
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="active" name="Active" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="won" name="Won" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline by stage</CardTitle>
          <p className="text-xs text-muted-foreground">Distribution of all leads</p>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStage}
                  dataKey="count"
                  nameKey="stage"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {byStage.map((d) => (
                    <Cell key={d.stage} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 whitespace-nowrap text-[clamp(0.95rem,4.4vw,1.25rem)] font-semibold leading-tight">
              {value}
            </div>
          </div>
          <div className="size-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
