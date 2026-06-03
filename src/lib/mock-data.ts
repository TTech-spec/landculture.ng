export type Stage =
  | "lead"
  | "pre_qualified"
  | "qualified"
  | "inspection_booked"
  | "inspection_completed"
  | "won"
  | "lost"
  | "customer";
export type Temperature = "hot" | "warm" | "cold";

export type Rep = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  activeLeads: number;
  wonThisMonth: number;
  quotaPct: number;
};

export type LeadNote = {
  id: string;
  author: string;
  text: string;
  at: string;
};

export type PlotSize = "450sqm" | "300sqm" | "225sqm" | "150sqm" | "100sqm";

export type Lead = {
  id: string;
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
  updatedAt: string;
  createdAt: string;
  nextFollowUp?: string;
  notes: LeadNote[];
  numberOfPlots?: number;
  plotSize?: PlotSize;
};

export type Activity = {
  id: string;
  repId: string;
  leadId?: string;
  type: "call" | "email" | "meeting" | "note" | "stage_change";
  leadName: string;
  detail: string;
  at: string;
};

export const TEAM_LEAD_ID = "tl1";

export const reps: Rep[] = [
  { id: TEAM_LEAD_ID, name: "Taylor Reed (You)", avatar: "TR", email: "taylor@acme.com", activeLeads: 3, wonThisMonth: 2, quotaPct: 90 },
  { id: "r1", name: "Ava Martinez", avatar: "AM", email: "ava@acme.com", activeLeads: 8, wonThisMonth: 4, quotaPct: 82 },
  { id: "r2", name: "Liam Chen", avatar: "LC", email: "liam@acme.com", activeLeads: 6, wonThisMonth: 3, quotaPct: 67 },
  { id: "r3", name: "Sofia Patel", avatar: "SP", email: "sofia@acme.com", activeLeads: 7, wonThisMonth: 5, quotaPct: 104 },
  { id: "r4", name: "Noah Williams", avatar: "NW", email: "noah@acme.com", activeLeads: 5, wonThisMonth: 2, quotaPct: 48 },
  { id: "r5", name: "Emma Johnson", avatar: "EJ", email: "emma@acme.com", activeLeads: 4, wonThisMonth: 3, quotaPct: 71 },
];

const companies = ["Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries", "Wayne Enterprises", "Hooli", "Pied Piper", "Soylent", "Massive Dynamic", "Wonka Inc", "Tyrell Corp", "Cyberdyne", "Aperture", "Black Mesa"];
const firstNames = ["John", "Sarah", "Mike", "Jessica", "David", "Laura", "Chris", "Anna", "Tom", "Nina"];
const lastNames = ["Smith", "Brown", "Davis", "Wilson", "Taylor", "Anderson", "Thomas", "Moore", "Lee", "Clark"];
const sources = ["Website", "Referral", "LinkedIn", "Cold call", "Trade show", "Inbound email"];
const sampleNotes = [
  "Decision maker, very engaged on the call.",
  "Wants to evaluate alongside two competitors.",
  "Asked for a tailored proposal by end of week.",
  "Budget approved, waiting on legal review.",
  "Out of office until next Monday — follow up then.",
  "Mentioned expansion plans in Q3, big opportunity.",
];
const stagesArr: Stage[] = ["lead", "pre_qualified", "qualified", "inspection_booked", "inspection_completed", "won", "lost", "customer"];
const tempsArr: Temperature[] = ["hot", "warm", "cold"];

const SEED_EPOCH = 1717200000000;

export const leads: Lead[] = Array.from({ length: 30 }, (_, i) => {
  const stage = stagesArr[i % stagesArr.length];
  const owner = reps[i % reps.length];
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 3) % lastNames.length];
  const company = companies[i % companies.length];
  const notes: LeadNote[] = [
    {
      id: `n${i}-1`,
      author: owner.name,
      text: sampleNotes[i % sampleNotes.length],
      at: new Date(SEED_EPOCH - i * 86400000).toISOString(),
    },
  ];
  if (i % 3 === 0) {
    notes.push({
      id: `n${i}-2`,
      author: owner.name,
      text: sampleNotes[(i + 2) % sampleNotes.length],
      at: new Date(SEED_EPOCH - i * 86400000 + 3600000).toISOString(),
    });
  }
  return {
    id: `l${i + 1}`,
    name: `${first} ${last}`,
    company,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    phone: `+1 (555) ${String(100 + i).padStart(3, "0")}-${String(1000 + i * 7).slice(-4)}`,
    source: sources[i % sources.length],
    value: 5000 + ((i * 1337) % 95000),
    totalAmount: (5000 + ((i * 1337) % 95000)) * (3 + (i % 4)),
    stage,
    temperature: tempsArr[i % tempsArr.length],
    ownerId: owner.id,
    createdAt: new Date(SEED_EPOCH - (30 - i) * 86400000).toISOString(),
    updatedAt: new Date(SEED_EPOCH - i * 1000 * 60 * 60 * 3).toISOString(),
    nextFollowUp:
      stage !== "won" && stage !== "lost"
        ? new Date(SEED_EPOCH + ((i % 7) - 2) * 86400000).toISOString()
        : undefined,
    notes,
  };
});

export const activities: Activity[] = Array.from({ length: 14 }, (_, i) => {
  const rep = reps[i % reps.length];
  const lead = leads[(i * 2) % leads.length];
  const types: Activity["type"][] = ["call", "email", "meeting", "note", "stage_change"];
  const type = types[i % types.length];
  const detail: Record<Activity["type"], string> = {
    call: "Logged a 12-min discovery call",
    email: "Sent follow-up email with pricing",
    meeting: "Booked demo for next Tuesday",
    note: "Decision maker out until Friday",
    stage_change: "Moved to Proposal",
  };
  return {
    id: `a${i + 1}`,
    repId: rep.id,
    leadId: lead.id,
    type,
    leadName: `${lead.name} · ${lead.company}`,
    detail: detail[type],
    at: new Date(SEED_EPOCH - i * 1000 * 60 * 47).toISOString(),
  };
});
