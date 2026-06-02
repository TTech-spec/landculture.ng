import { PIPELINE_STAGES, type Lead, type Stage } from "@/lib/leads-store";

type Filter = "All" | Stage;

export function StageFilter({
  leads,
  value,
  onChange,
}: {
  leads: Lead[];
  value: Filter;
  onChange: (v: Filter) => void;
}) {
  const tabs: Filter[] = ["All", ...PIPELINE_STAGES];
  const countFor = (t: Filter) =>
    t === "All" ? leads.length : leads.filter((l) => l.stage === t).length;

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max items-center gap-2">
        {tabs.map((t) => {
          const active = value === t;
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {t}
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {countFor(t)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
