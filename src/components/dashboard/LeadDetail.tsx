import { useState } from "react";
import { ArrowLeft, Mail, MapPin, Phone, Calendar, Tag, Bell } from "lucide-react";
import {
  CURRENT_USER,
  PIPELINE_STAGES,
  STAGE_BADGE,
  TEMP_BADGE,
  TEMP_DOT,
  formatDate,
  formatDateTime,
  formatFollowUp,
  followUpStatus,
  type Lead,
  type Stage,
  type Temperature,
} from "@/lib/leads-store";

const TEMPS: Temperature[] = ["Hot", "Warm", "Cold"];

export function LeadDetail({
  lead,
  onBack,
  onUpdate,
}: {
  lead: Lead;
  onBack: () => void;
  onUpdate: (lead: Lead) => void;
}) {
  const [stage, setStage] = useState<Stage>(lead.stage);
  const [temperature, setTemperature] = useState<Temperature>(lead.temperature);
  const [followUpDate, setFollowUpDate] = useState<string>(lead.followUpDate ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentIdx = PIPELINE_STAGES.indexOf(lead.stage);
  const isClosedLost = lead.stage === "Closed Lost";

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError("A note is required to save updates.");
      return;
    }
    const now = new Date().toISOString();
    const updated: Lead = {
      ...lead,
      stage,
      temperature,
      followUpDate: followUpDate || null,
      history: [
        ...lead.history,
        {
          id: crypto.randomUUID(),
          at: now,
          by: CURRENT_USER.name,
          fromStage: lead.stage,
          toStage: stage,
          fromTemperature: lead.temperature,
          toTemperature: temperature,
          note: note.trim(),
        },
      ],
    };
    onUpdate(updated);
    setNote("");
    setError(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </button>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
              {lead.name}
            </h1>
            <div className="mt-1 text-xs text-muted-foreground">{lead.id}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STAGE_BADGE[lead.stage]}`}>
              {lead.stage}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TEMP_BADGE[lead.temperature]}`}>
              <span className={`h-2 w-2 rounded-full ${TEMP_DOT[lead.temperature]}`} />
              {lead.temperature}
            </span>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <Info icon={Phone} label="Phone" value={lead.phone} />
          <Info icon={Mail} label="Email" value={lead.email || "—"} />
          <Info icon={MapPin} label="Location" value={lead.location || "—"} />
          <Info icon={Tag} label="Source" value={lead.source} />
          <Info icon={Calendar} label="Created" value={formatDate(lead.createdAt)} />
          <FollowUpInfo dateStr={lead.followUpDate ?? null} />
        </dl>
      </div>

      {/* Pipeline progress */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-foreground">Pipeline Progress</div>
        <div className="relative">
          <div className="absolute left-0 right-0 top-3 h-1 rounded-full bg-muted" />
          <div
            className={`absolute left-0 top-3 h-1 rounded-full transition-all ${
              isClosedLost ? "bg-rose-400" : "bg-[#004C3F]"
            }`}
            style={{
              width: `${((currentIdx + 1) / PIPELINE_STAGES.length) * 100}%`,
            }}
          />
          <ol className="relative grid grid-cols-7 gap-1">
            {PIPELINE_STAGES.map((s, i) => {
              const reached = i <= currentIdx;
              return (
                <li key={s} className="flex flex-col items-center text-center">
                  <span
                    className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-semibold ${
                      reached
                        ? isClosedLost
                          ? "border-rose-400 bg-rose-400 text-white"
                          : "border-[#004C3F] bg-[#004C3F] text-white"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="mt-2 hidden text-[10px] font-medium leading-tight text-muted-foreground sm:block">
                    {s}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="mt-3 text-xs text-muted-foreground sm:hidden">
          Currently at: <span className="font-medium text-foreground">{lead.stage}</span>
        </div>
      </div>

      {/* Update form */}
      <form onSubmit={save} className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-foreground">Update Lead Stage</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-foreground">New Stage</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as Stage)}
              className="input"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-foreground">Temperature</span>
            <select
              value={temperature}
              onChange={(e) => setTemperature(e.target.value as Temperature)}
              className="input"
            >
              {TEMPS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-foreground">
            Follow-Up Date
          </span>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="input"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-medium text-foreground">
            Note / Comment <span className="text-red-500">*</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (e.target.value.trim()) setError(null);
            }}
            rows={3}
            className="input resize-none"
            placeholder="Describe what happened in this interaction..."
          />
          {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={!note.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Update
          </button>
        </div>
      </form>

      {/* Activity history */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-foreground">Activity History</div>
        <ol className="relative space-y-5 border-l-2 border-border pl-6">
          {[...lead.history].reverse().map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[1.95rem] top-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {h.fromStage && (
                  <>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 font-medium ${STAGE_BADGE[h.fromStage]}`}>
                      {h.fromStage}
                    </span>
                    <span className="text-muted-foreground">→</span>
                  </>
                )}
                <span className={`inline-flex rounded-full border px-2 py-0.5 font-medium ${STAGE_BADGE[h.toStage]}`}>
                  {h.toStage}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium ${TEMP_BADGE[h.toTemperature]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${TEMP_DOT[h.toTemperature]}`} />
                  {h.toTemperature}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground">{h.note}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                {h.by} · {formatDateTime(h.at)}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

function FollowUpInfo({ dateStr }: { dateStr: string | null }) {
  const status = followUpStatus(dateStr);
  const tone =
    status?.kind === "overdue"
      ? "text-red-600"
      : status?.kind === "today"
        ? "text-amber-600"
        : status?.kind === "soon"
          ? "text-amber-700"
          : "text-foreground";
  const suffix =
    status?.kind === "overdue"
      ? ` · ${Math.abs(status.diffDays)}d overdue`
      : status?.kind === "today"
        ? " · today"
        : status?.kind === "soon"
          ? ` · in ${status.diffDays}d`
          : "";
  return (
    <div className="flex items-start gap-2">
      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Follow-Up</div>
        <div className={`truncate text-sm ${tone}`}>
          {formatFollowUp(dateStr)}
          {suffix}
        </div>
      </div>
    </div>
  );
}
