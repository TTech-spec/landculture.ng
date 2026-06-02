export const PIPELINE_STAGES = [
  "Lead",
  "Pre-Qualified",
  "Qualified",
  "Inspection Booked",
  "Inspection Completed",
  "Closed Won",
  "Closed Lost",
] as const;

export type Stage = (typeof PIPELINE_STAGES)[number];
export type Temperature = "Hot" | "Warm" | "Cold";
export type LeadSource =
  | "Referral"
  | "Walk-in"
  | "Social Media"
  | "Cold Call"
  | "Online Ad";

export interface ActivityEntry {
  id: string;
  at: string; // ISO
  by: string;
  fromStage: Stage | null;
  toStage: Stage;
  fromTemperature: Temperature | null;
  toTemperature: Temperature;
  note: string;
}

export interface Lead {
  id: string; // LID-XXXX
  name: string;
  phone: string;
  email: string;
  location: string;
  source: LeadSource;
  temperature: Temperature;
  stage: Stage;
  createdAt: string; // ISO
  notes: string;
  followUpDate?: string | null; // ISO date (YYYY-MM-DD)
  history: ActivityEntry[];
}

export function followUpStatus(dateStr?: string | null) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diffDays < 0) return { kind: "overdue" as const, diffDays };
  if (diffDays === 0) return { kind: "today" as const, diffDays };
  if (diffDays <= 7) return { kind: "soon" as const, diffDays };
  return { kind: "later" as const, diffDays };
}

export function formatFollowUp(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// All stage badges use the brand palette: mint surface + dark green text.
// Stages differ in saturation/weight so they're still distinguishable.
export const STAGE_BADGE: Record<Stage, string> = {
  Lead: "bg-[#F3FAF7] text-[#1F7A66] border-[#C7E6DB]",
  "Pre-Qualified": "bg-[#E2F3ED] text-[#1F7A66] border-[#C7E6DB]",
  Qualified: "bg-[#E2F3ED] text-[#004C3F] border-[#C7E6DB]",
  "Inspection Booked": "bg-[#CDEADF] text-[#004C3F] border-[#A7D6C5]",
  "Inspection Completed": "bg-[#A7D6C5] text-[#004C3F] border-[#7FB3A2]",
  "Closed Won": "bg-[#004C3F] text-white border-[#004C3F]",
  "Closed Lost": "bg-white text-[#6b7280] border-[#D1D5DB]",
};

export const TEMP_DOT: Record<Temperature, string> = {
  Hot: "bg-red-500",
  Warm: "bg-amber-500",
  Cold: "bg-sky-500",
};

export const TEMP_BADGE: Record<Temperature, string> = {
  Hot: "bg-red-50 text-red-700 border-red-200",
  Warm: "bg-amber-50 text-amber-800 border-amber-200",
  Cold: "bg-sky-50 text-sky-700 border-sky-200",
};

let counter = 1000;
export function generateLeadId() {
  counter += 1;
  return `LID-${counter}`;
}

export const CURRENT_USER = {
  name: "Adaeze Okafor",
  initials: "AO",
  branch: "Lagos – Lekki Branch",
  role: "Sales Representative",
};

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();
const daysFromNow = (d: number) => {
  const dt = new Date(now + d * 86_400_000);
  return dt.toISOString().slice(0, 10);
};

export const seedLeads: Lead[] = [
  {
    id: generateLeadId(),
    name: "Chinedu Eze",
    phone: "+234 802 345 1122",
    email: "chinedu.eze@example.com",
    location: "Lekki, Lagos",
    source: "Referral",
    temperature: "Hot",
    stage: "Qualified",
    createdAt: daysAgo(6),
    followUpDate: daysFromNow(2),
    notes: "Looking for a 3-bedroom unit, budget ready.",
    history: [
      {
        id: "h1",
        at: daysAgo(6),
        by: CURRENT_USER.name,
        fromStage: null,
        toStage: "Lead",
        fromTemperature: null,
        toTemperature: "Warm",
        note: "Initial inquiry via referral from existing client.",
      },
      {
        id: "h2",
        at: daysAgo(4),
        by: CURRENT_USER.name,
        fromStage: "Lead",
        toStage: "Pre-Qualified",
        fromTemperature: "Warm",
        toTemperature: "Warm",
        note: "Confirmed budget range and timeline.",
      },
      {
        id: "h3",
        at: daysAgo(1),
        by: CURRENT_USER.name,
        fromStage: "Pre-Qualified",
        toStage: "Qualified",
        fromTemperature: "Warm",
        toTemperature: "Hot",
        note: "Pre-approval letter received, ready to inspect.",
      },
    ],
  },
  {
    id: generateLeadId(),
    name: "Funmi Adebayo",
    phone: "+234 803 998 7654",
    email: "funmi.a@example.com",
    location: "Ikeja, Lagos",
    source: "Social Media",
    temperature: "Warm",
    stage: "Inspection Booked",
    createdAt: daysAgo(10),
    followUpDate: daysFromNow(0),
    notes: "Inspection scheduled for next Saturday.",
    history: [
      {
        id: "h1",
        at: daysAgo(10),
        by: CURRENT_USER.name,
        fromStage: null,
        toStage: "Lead",
        fromTemperature: null,
        toTemperature: "Cold",
        note: "Reached out via Instagram DM.",
      },
      {
        id: "h2",
        at: daysAgo(3),
        by: CURRENT_USER.name,
        fromStage: "Lead",
        toStage: "Inspection Booked",
        fromTemperature: "Cold",
        toTemperature: "Warm",
        note: "Booked Saturday inspection at the Ikeja property.",
      },
    ],
  },
  {
    id: generateLeadId(),
    name: "Tobi Williams",
    phone: "+234 805 221 4488",
    email: "tobi.w@example.com",
    location: "Yaba, Lagos",
    source: "Walk-in",
    temperature: "Cold",
    stage: "Lead",
    createdAt: daysAgo(2),
    followUpDate: daysFromNow(-1),
    notes: "Walked into branch, still researching options.",
    history: [
      {
        id: "h1",
        at: daysAgo(2),
        by: CURRENT_USER.name,
        fromStage: null,
        toStage: "Lead",
        fromTemperature: null,
        toTemperature: "Cold",
        note: "Walk-in inquiry, gathering info.",
      },
    ],
  },
  {
    id: generateLeadId(),
    name: "Ngozi Umeh",
    phone: "+234 807 112 3399",
    email: "ngozi.u@example.com",
    location: "Victoria Island, Lagos",
    source: "Online Ad",
    temperature: "Hot",
    stage: "Closed Won",
    createdAt: daysAgo(30),
    notes: "Deal closed successfully.",
    history: [
      {
        id: "h1",
        at: daysAgo(30),
        by: CURRENT_USER.name,
        fromStage: null,
        toStage: "Lead",
        fromTemperature: null,
        toTemperature: "Warm",
        note: "Clicked Facebook ad and filled inquiry form.",
      },
      {
        id: "h2",
        at: daysAgo(20),
        by: CURRENT_USER.name,
        fromStage: "Lead",
        toStage: "Inspection Completed",
        fromTemperature: "Warm",
        toTemperature: "Hot",
        note: "Completed inspection, very interested.",
      },
      {
        id: "h3",
        at: daysAgo(8),
        by: CURRENT_USER.name,
        fromStage: "Inspection Completed",
        toStage: "Closed Won",
        fromTemperature: "Hot",
        toTemperature: "Hot",
        note: "Signed agreement and made initial deposit.",
      },
    ],
  },
  {
    id: generateLeadId(),
    name: "Emeka Obi",
    phone: "+234 809 555 7711",
    email: "emeka.obi@example.com",
    location: "Surulere, Lagos",
    source: "Cold Call",
    temperature: "Cold",
    stage: "Closed Lost",
    createdAt: daysAgo(40),
    notes: "Chose a competitor.",
    history: [
      {
        id: "h1",
        at: daysAgo(40),
        by: CURRENT_USER.name,
        fromStage: null,
        toStage: "Lead",
        fromTemperature: null,
        toTemperature: "Cold",
        note: "Cold call introduction.",
      },
      {
        id: "h2",
        at: daysAgo(15),
        by: CURRENT_USER.name,
        fromStage: "Lead",
        toStage: "Closed Lost",
        fromTemperature: "Cold",
        toTemperature: "Cold",
        note: "Went with a competing offer.",
      },
    ],
  },
  {
    id: generateLeadId(),
    name: "Aisha Bello",
    phone: "+234 810 884 2200",
    email: "aisha.b@example.com",
    location: "Ajah, Lagos",
    source: "Referral",
    temperature: "Warm",
    stage: "Inspection Completed",
    createdAt: daysAgo(14),
    followUpDate: daysFromNow(5),
    notes: "Awaiting decision after inspection.",
    history: [
      {
        id: "h1",
        at: daysAgo(14),
        by: CURRENT_USER.name,
        fromStage: null,
        toStage: "Lead",
        fromTemperature: null,
        toTemperature: "Warm",
        note: "Referred by Ngozi Umeh.",
      },
      {
        id: "h2",
        at: daysAgo(7),
        by: CURRENT_USER.name,
        fromStage: "Lead",
        toStage: "Inspection Booked",
        fromTemperature: "Warm",
        toTemperature: "Warm",
        note: "Scheduled inspection.",
      },
      {
        id: "h3",
        at: daysAgo(2),
        by: CURRENT_USER.name,
        fromStage: "Inspection Booked",
        toStage: "Inspection Completed",
        fromTemperature: "Warm",
        toTemperature: "Warm",
        note: "Inspection done, considering offer.",
      },
    ],
  },
];

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
