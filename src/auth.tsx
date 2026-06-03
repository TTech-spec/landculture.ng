import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { ProfileStatus } from "@/lib/supabase";

/* ============================================================================
   PALETTE — shared across mobile + desktop
============================================================================ */
const C = {
  green:       "#004C3F",   // dark teal-green — headings, buttons, accents
  greenMid:    "#00604F",   // hover
  greenLight:  "#E2F3ED",   // mint tint (mobile fields, badges)
  greenBorder: "#A8D5C4",   // mint border
  greenIcon:   "#007A63",   // icon inside mobile field
  ink:         "#0F1F1B",   // desktop heading (near-black)
  inkDeep:     "#003530",   // mobile heading
  sub:         "#4A7068",   // secondary text
  subSoft:     "#8FA39E",   // muted labels / dividers
  dBorder:     "#E3E8E6",   // desktop input border (light gray-green)
  dBorderFocus:"#004C3F",
  link:        "#004C3F",
  white:       "#FFFFFF",
  off:         "#FAFBFA",   // desktop page bg (subtle)
  error:       "#C0392B",
  errorBg:     "#FEF2F2",
  success:     "#004C3F",
  successBg:   "#E2F3ED",
  warning:     "#A0520A",
  warningBg:   "#FEF8EC",
  placeholder: "#7FADA3",
  placeholderD:"#B7C2BE",   // desktop placeholder (cooler/lighter)
};

/* Hero photo — dewy grass at sunrise, used across desktop + mobile */
const HERO_PHOTO = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop";

/* ============================================================================
   RESPONSIVE HOOK — single source of truth for layout choice
============================================================================ */
function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

/* ============================================================================
   DECORATIVE LEAF SPRIG (mobile heading accent)
============================================================================ */
const LeafSprig = () => (
  <svg width="52" height="56" viewBox="0 0 52 56" fill="none" style={{ flexShrink: 0 }}>
    <ellipse cx="26" cy="28" rx="14" ry="22" fill="#007A63" transform="rotate(-20 26 28)" />
    <ellipse cx="26" cy="28" rx="5"  ry="17" fill="#004C3F" transform="rotate(-20 26 28)" />
    <line x1="26" y1="50" x2="26" y2="10" stroke="#003530" strokeWidth="1.5"
      strokeLinecap="round" transform="rotate(-20 26 28)" />
    <ellipse cx="38" cy="22" rx="10" ry="17" fill="#00604F" transform="rotate(15 38 22)" />
    <ellipse cx="38" cy="22" rx="3.5" ry="12" fill="#007A63" transform="rotate(15 38 22)" />
    <line x1="38" y1="38" x2="38" y2="8" stroke="#004C3F" strokeWidth="1.2"
      strokeLinecap="round" transform="rotate(15 38 22)" />
  </svg>
);

/* ============================================================================
   BRAND LOGO — recreated as inline SVG so no asset hosting is needed.
   Two dark-green building silhouettes with a mint "L" backdrop.
============================================================================ */
function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * (110 / 120)}
      viewBox="0 0 120 110"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: "block" }}
      aria-label="Brand logo"
    >
      {/* Mint L: tall vertical bar + horizontal foot extending right */}
      <polygon points="46,10 60,10 60,84 102,84 102,100 46,100" fill="#D6EBE2" />
      {/* Left dark-green building (peak at upper-right) */}
      <polygon points="22,42 46,22 46,100 22,100" fill={C.green} />
      {/* Right dark-green building (peak at upper-left) */}
      <polygon points="60,22 84,42 84,84 60,84" fill={C.green} />
    </svg>
  );
}

/* ============================================================================
   TYPES & CONSTANTS (unchanged — workflow contract)
============================================================================ */
export interface User {
  id: string;
  email: string;
  name: string;
  branch: string;
  team: string;
  phone: string;
  role: string;
}

interface AuthFlowProps {
  onSuccess: (user: User) => void;
}

type Screen = "login" | "register" | "pending" | "rejected";

const BRANCHES = [
  "Sango Branch",
];

const TEAMS = [
  "Success Team",
  "Achievers Team",
];

const ROLES = [
  "Sales Representative",
  "Branch Manager",
  "Team Lead",
  "Deputy Branch Manager",
];

/* ============================================================================
   SPINNER
============================================================================ */
const spinnerStyle: React.CSSProperties = {
  width: 16, height: 16, borderRadius: "50%",
  border: "2.5px solid rgba(255,255,255,.35)",
  borderTopColor: "#fff",
  animation: "mSpin .7s linear infinite",
  display: "inline-block", flexShrink: 0,
};

/* ============================================================================
   ALERT BANNER (shared)
============================================================================ */
function Alert({ type, message }: { type: "error" | "warning" | "success"; message: string }) {
  const s = {
    error:   { bg: C.errorBg,   border: "#F5C6CB",      text: C.error,   icon: "✕" },
    warning: { bg: C.warningBg, border: "#FDDFA6",      text: C.warning, icon: "⚠" },
    success: { bg: C.successBg, border: C.greenBorder,  text: C.success, icon: "✓" },
  }[type];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 12, padding: "10px 14px",
      display: "flex", gap: 8, alignItems: "flex-start",
      marginBottom: 16,
    }}>
      <span style={{ color: s.text, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{s.icon}</span>
      <p style={{ margin: 0, fontSize: 13, color: s.text, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

/* ============================================================================
   SHARED ICONS
============================================================================ */
const UserIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const MailIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const PhoneIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 10a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>);
const MapIcon   = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const TeamIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>);
const LockIcon  = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>);

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* Social brand glyphs (visual only — used on desktop social buttons) */
const GoogleGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.2C41.8 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
  </svg>
);
const AppleGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 13.27c-.03-2.94 2.4-4.35 2.5-4.42-1.36-2-3.49-2.27-4.25-2.3-1.81-.18-3.53 1.07-4.45 1.07-.93 0-2.34-1.04-3.85-1.01-1.98.03-3.81 1.15-4.83 2.92-2.06 3.57-.53 8.85 1.49 11.74.98 1.41 2.15 3 3.66 2.94 1.47-.06 2.03-.95 3.81-.95 1.78 0 2.27.95 3.82.92 1.58-.03 2.58-1.44 3.55-2.86 1.12-1.64 1.58-3.23 1.6-3.32-.03-.02-3.07-1.18-3.05-4.73zM14.21 4.61c.81-.98 1.36-2.34 1.21-3.69-1.17.05-2.58.78-3.41 1.76-.75.86-1.41 2.25-1.23 3.57 1.3.1 2.62-.66 3.43-1.64z"/>
  </svg>
);

/* ============================================================================
   MOBILE FIELD — mint-tinted, icon prefix, pill-rounded
============================================================================ */
function MField({
  icon, type = "text", value, onChange, placeholder, disabled, rightNode,
}: {
  icon: React.ReactNode; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
  rightNode?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: C.greenLight,
      border: `1.5px solid ${focused ? C.green : C.greenBorder}`,
      borderRadius: 14, padding: "0 14px", height: 52,
      transition: "border-color .2s",
    }}>
      <span style={{ color: C.greenIcon, display: "flex", flexShrink: 0, fontSize: 18 }}>{icon}</span>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: "none", background: "transparent", outline: "none",
          fontSize: 14, color: C.inkDeep, fontFamily: "inherit",
        }}
      />
      {rightNode && <span style={{ color: C.sub, display: "flex", flexShrink: 0 }}>{rightNode}</span>}
    </div>
  );
}

/* ============================================================================
   MOBILE SELECT
============================================================================ */
function MSelect({
  icon, value, onChange, options, placeholder = "Select…", disabled,
}: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: C.greenLight, border: `1.5px solid ${C.greenBorder}`,
      borderRadius: 14, padding: "0 14px", height: 52, position: "relative",
    }}>
      <span style={{ color: C.greenIcon, display: "flex", flexShrink: 0, fontSize: 18 }}>{icon}</span>
      <select
        value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        style={{
          flex: 1, border: "none", background: "transparent", outline: "none",
          fontSize: 14, color: value ? C.inkDeep : C.placeholder,
          fontFamily: "inherit", appearance: "none", cursor: "pointer",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2.5"
        style={{ flexShrink: 0, pointerEvents: "none" }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

/* ============================================================================
   DESKTOP FIELD — label above, thin outlined input (matches reference image)
============================================================================ */
function DField({
  label, type = "text", value, onChange, placeholder, disabled, rightNode,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
  rightNode?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: 0.1 }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center",
        background: C.white,
        border: `1.5px solid ${focused ? C.dBorderFocus : C.dBorder}`,
        borderRadius: 10, padding: "0 14px", height: 44,
        transition: "border-color .15s, box-shadow .15s",
        boxShadow: focused ? `0 0 0 3px ${C.greenLight}` : "none",
      }}>
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontSize: 14, color: C.ink, fontFamily: "inherit",
          }}
        />
        {rightNode && <span style={{ color: C.sub, display: "flex", flexShrink: 0, marginLeft: 8 }}>{rightNode}</span>}
      </div>
    </div>
  );
}

/* ============================================================================
   DESKTOP SELECT
============================================================================ */
function DSelect({
  label, value, onChange, options, placeholder = "Select…", disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.ink, letterSpacing: 0.1 }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center",
        background: C.white, border: `1.5px solid ${C.dBorder}`,
        borderRadius: 10, padding: "0 14px", height: 44, position: "relative",
      }}>
        <select
          value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontSize: 14, color: value ? C.ink : C.placeholderD,
            fontFamily: "inherit", appearance: "none", cursor: "pointer",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2.5"
          style={{ flexShrink: 0, pointerEvents: "none" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}

/* ============================================================================
   SOCIAL BUTTON (desktop only — visual element; does not alter auth workflow)
============================================================================ */
function SocialBtn({
  icon, label, onClick, disabled,
}: {
  icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button" onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        flex: 1, height: 46, borderRadius: 10,
        border: `1.5px solid ${hover ? C.green : C.dBorder}`,
        background: C.white, color: C.ink,
        fontSize: 14, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "border-color .15s, transform .1s",
        transform: hover && !disabled ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      {icon}{label}
    </button>
  );
}

/* ============================================================================
   MOBILE SHELL — hero photo top, white card slides up
============================================================================ */
function MobileShell({
  children, scrollable = false,
}: { children: React.ReactNode; scrollable?: boolean }) {
  return (
    <div style={{
      minHeight: "100vh", width: "100%", position: "relative",
      fontFamily: "'Nunito', 'Plus Jakarta Sans', system-ui, sans-serif",
      background: "#004C3F", display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <SharedStyles />

      {/* HERO PHOTO */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "48%",
        backgroundImage: `url('${HERO_PHOTO}')`,
        backgroundSize: "cover", backgroundPosition: "center top",
        animation: "photoFade .6s ease both",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,76,63,0.45) 0%, rgba(0,53,48,0.65) 100%)",
        }} />

        {/* Floating brand logo badge */}
        <div style={{
          position: "absolute", top: 22, left: 22,
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(6px)",
        }}>
          <Logo size={34} />
        </div>
      </div>

      {/* WHITE CARD */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, top: "35%",
        background: C.white,
        borderTopLeftRadius: 36, borderTopRightRadius: 36,
        padding: scrollable ? "32px 28px 40px" : "32px 28px 36px",
        overflowY: scrollable ? "auto" : "visible",
        animation: "cardUp .5s cubic-bezier(.2,.8,.2,1) both",
        display: "flex", flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ============================================================================
   DESKTOP SHELL — 50/50 two-column, form left, full-bleed photo right
============================================================================ */
function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh", width: "100%", display: "flex",
      fontFamily: "'Nunito', 'Plus Jakarta Sans', system-ui, sans-serif",
      background: C.off,
    }}>
      <SharedStyles />

      {/* LEFT — form column */}
      <div style={{
        flex: "1 1 50%", display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "48px 32px",
        animation: "fadeInUp .5s ease both",
        position: "relative",
      }}>
        {/* Top-left brand mark, anchored to the column (not the form) */}
        <div style={{
          position: "absolute", top: 36, left: 48,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Logo size={38} />
        </div>

        <div style={{ width: "100%", maxWidth: 420 }}>
          {children}
        </div>
      </div>

      {/* RIGHT — hero photo */}
      <div style={{
        flex: "1 1 50%",
        backgroundImage: `url('${HERO_PHOTO}')`,
        backgroundSize: "cover", backgroundPosition: "center",
        position: "relative",
        animation: "photoFade .6s ease both",
      }}>
        {/* subtle tint for cohesion */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(0,76,63,0.05) 0%, rgba(0,76,63,0.15) 100%)",
        }} />
      </div>
    </div>
  );
}

/* ============================================================================
   GLOBAL STYLES (font import, keyframes, placeholder color)
============================================================================ */
function SharedStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
      @keyframes mSpin { to { transform: rotate(360deg); } }
      @keyframes cardUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes fadeInUp { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes photoFade { from { opacity: 0; } to { opacity: 1; } }
      input::placeholder { color: ${C.placeholder}; }
      input:disabled, select:disabled { opacity: 0.65; cursor: not-allowed; }
    `}</style>
  );
}

/* ============================================================================
   "OR" DIVIDER (desktop)
============================================================================ */
function OrDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0 18px" }}>
      <div style={{ flex: 1, height: 1, background: C.dBorder }} />
      <span style={{ fontSize: 12, color: C.subSoft, fontWeight: 600, letterSpacing: 0.5 }}>Or</span>
      <div style={{ flex: 1, height: 1, background: C.dBorder }} />
    </div>
  );
}

/* ============================================================================
   LOGIN FORM — renders desktop OR mobile based on viewport
============================================================================ */
function LoginForm({
  onSuccess, onSwitchToRegister, onPending, onRejected,
}: {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onPending: (email: string) => void;
  onRejected: () => void;
}) {
  const isMobile = useIsMobile();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Login failed. Please try again.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("*").eq("id", authData.user.id).single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Profile not found. Please register first or contact your admin.");
      }

      const status = profile.status as ProfileStatus;
      if (status === "pending")  { await supabase.auth.signOut(); onPending(email.trim().toLowerCase()); return; }
      if (status === "rejected") { await supabase.auth.signOut(); onRejected(); return; }
      if (status !== "approved") { await supabase.auth.signOut(); throw new Error("Your account status is invalid. Contact your admin."); }

      onSuccess({
        id: authData.user.id, email: authData.user.email ?? "",
        name: profile.name, branch: profile.branch,
        team: profile.team,  phone: profile.phone,
        role: profile.role,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message;
        if (msg.includes("Invalid login credentials")) setError("Incorrect email or password.");
        else if (msg.includes("Email not confirmed")) setError("Please verify your email first.");
        else setError(msg);
      } else setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handleSocial = () => setError("Social sign-in isn't enabled yet. Please use email and password.");

  /* ─────────────── DESKTOP ─────────────── */
  if (!isMobile) {
    return (
      <DesktopShell>
        <h1 style={{
          margin: "0 0 8px", fontSize: 36, fontWeight: 800,
          color: C.ink, letterSpacing: -0.8, lineHeight: 1.1,
        }}>
          Welcome Back
        </h1>
        <p style={{ margin: "0 0 32px", fontSize: 14, color: C.sub }}>
          Login to your account to continue
        </p>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DField label="Email address" type="email"
            value={email} onChange={setEmail}
            placeholder="you@example.com" disabled={loading} />

          <DField label="Password"
            type={showPw ? "text" : "password"}
            value={password} onChange={setPassword}
            placeholder="Enter your password" disabled={loading}
            rightNode={
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.sub, display: "flex" }}>
                <EyeIcon open={showPw} />
              </button>
            }
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.sub, cursor: "pointer" }}>
              <input type="checkbox" checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: C.green, width: 15, height: 15, cursor: "pointer" }} />
              Remember me
            </label>
            <button type="button" style={{
              background: "none", border: "none", padding: 0,
              fontSize: 13, fontWeight: 700, color: C.green,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading}
            style={{
              marginTop: 10, height: 48, borderRadius: 10,
              border: "none", background: C.green, color: C.white,
              fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit", transition: "background .15s",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = C.greenMid; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.green; }}
          >
            {loading ? <><span style={spinnerStyle} />Signing in…</> : "Login"}
          </button>
        </form>

        <OrDivider />

        <div style={{ display: "flex", gap: 12 }}>
          <SocialBtn icon={<GoogleGlyph />} label="Sign in with Google" onClick={handleSocial} disabled={loading} />
          <SocialBtn icon={<AppleGlyph />}  label="Sign in with Apple"  onClick={handleSocial} disabled={loading} />
        </div>

        <p style={{ marginTop: 28, fontSize: 13, color: C.sub, textAlign: "center" }}>
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} disabled={loading}
            style={{
              background: "none", border: "none", color: C.green, fontWeight: 700,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0,
            }}>
            Sign up
          </button>
        </p>
      </DesktopShell>
    );
  }

  /* ─────────────── MOBILE ─────────────── */
  return (
    <MobileShell>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: C.green, letterSpacing: -0.5, lineHeight: 1.15 }}>
            Welcome Back
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: C.sub }}>Login to your account</p>
        </div>
        <LeafSprig />
      </div>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <MField icon={<MailIcon />} type="email"
          value={email} onChange={setEmail}
          placeholder="Email address" disabled={loading} />

        <MField icon={<LockIcon />}
          type={showPw ? "text" : "password"}
          value={password} onChange={setPassword}
          placeholder="Password" disabled={loading}
          rightNode={
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.sub, display: "flex" }}>
              <EyeIcon open={showPw} />
            </button>
          }
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.sub, cursor: "pointer" }}>
            <span style={{
              width: 16, height: 16, borderRadius: "50%",
              border: `2px solid ${C.greenBorder}`, background: C.greenLight,
              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="9" height="9" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="3" fill={C.green} />
              </svg>
            </span>
            Remember Me
          </label>
          <button type="button" style={{
            background: "none", border: "none", fontSize: 12, fontWeight: 700,
            color: C.green, cursor: "pointer", fontFamily: "inherit", padding: 0,
          }}>
            Forgot Password?
          </button>
        </div>

        <button type="submit" disabled={loading}
          style={{
            marginTop: 12, height: 54, borderRadius: 999, border: "none",
            background: C.green, color: C.white, fontSize: 16, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit", letterSpacing: 0.3,
          }}>
          {loading ? <><span style={spinnerStyle} />Signing in…</> : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 22, fontSize: 13, color: C.sub, textAlign: "center" }}>
        Don't have account?{" "}
        <button onClick={onSwitchToRegister} disabled={loading}
          style={{
            background: "none", border: "none", color: C.green, fontWeight: 800,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0,
            textDecoration: "underline", textDecorationColor: C.greenBorder,
          }}>
          Sign up
        </button>
      </p>
    </MobileShell>
  );
}

/* ============================================================================
   REGISTER FORM
============================================================================ */
function RegisterForm({
  onRegistered, onSwitchToLogin,
}: {
  onRegistered: (email: string) => void;
  onSwitchToLogin: () => void;
}) {
  const isMobile = useIsMobile();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [branch,   setBranch]   = useState("");
  const [team,     setTeam]     = useState("");
  const [role,     setRole]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [agree,    setAgree]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name || !email || !phone || !branch || !team || !role || !password || !confirm) {
      setError("Please fill in all required fields."); return;
    }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: { data: { name: name.trim(), phone: phone.trim(), branch, team, role } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed. Please try again.");

      // Profile is created by the database trigger on auth.users — just sign out.
      await supabase.auth.signOut();
      setSuccess("Registration submitted! Awaiting admin approval.");
      setTimeout(() => onRegistered(email.trim().toLowerCase()), 800);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handleSocial = () => setError("Social sign-up isn't enabled yet. Please use the form below.");

  /* ─────────────── DESKTOP ─────────────── */
  if (!isMobile) {
    return (
      <DesktopShell>
        <h1 style={{
          margin: "0 0 8px", fontSize: 36, fontWeight: 800,
          color: C.ink, letterSpacing: -0.8, lineHeight: 1.1,
        }}>
          Get Started Now
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: C.sub }}>
          Create an account to access the Sales Dashboard
        </p>

        {error   && <Alert type="error"   message={error}   />}
        {success && <Alert type="success" message={success} />}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <DField label="Name" value={name} onChange={setName}
            placeholder="Enter your name" disabled={loading} />

          <DField label="Email address" type="email"
            value={email} onChange={setEmail}
            placeholder="you@example.com" disabled={loading} />

          <DField label="Phone" type="tel"
            value={phone} onChange={setPhone}
            placeholder="+234 801 234 5678" disabled={loading} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <DSelect label="Branch"
              value={branch} onChange={setBranch}
              options={BRANCHES} placeholder="Select branch"
              disabled={loading} />
            <DSelect label="Team"
              value={team} onChange={setTeam}
              options={TEAMS} placeholder="Select team"
              disabled={loading} />
          </div>

          <DSelect label="Role"
            value={role} onChange={setRole}
            options={ROLES} placeholder="Select your role"
            disabled={loading} />

          <DField label="Password"
            type={showPw ? "text" : "password"}
            value={password} onChange={setPassword}
            placeholder="At least 8 characters" disabled={loading}
            rightNode={
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.sub, display: "flex" }}>
                <EyeIcon open={showPw} />
              </button>
            }
          />

          <DField label="Confirm password" type="password"
            value={confirm} onChange={setConfirm}
            placeholder="Re-enter your password" disabled={loading} />

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.sub, cursor: "pointer", marginTop: 4 }}>
            <input type="checkbox" checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ accentColor: C.green, width: 15, height: 15, cursor: "pointer" }} />
            I agree to the{" "}
            <a href="#" onClick={(e) => e.preventDefault()}
              style={{ color: C.green, fontWeight: 700, textDecoration: "none" }}>
              terms & policy
            </a>
          </label>

          <button type="submit" disabled={loading}
            style={{
              marginTop: 8, height: 48, borderRadius: 10,
              border: "none", background: C.green, color: C.white,
              fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit", transition: "background .15s",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = C.greenMid; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.green; }}
          >
            {loading ? <><span style={spinnerStyle} />Creating account…</> : "Signup"}
          </button>
        </form>

        <OrDivider />

        <div style={{ display: "flex", gap: 12 }}>
          <SocialBtn icon={<GoogleGlyph />} label="Sign in with Google" onClick={handleSocial} disabled={loading} />
          <SocialBtn icon={<AppleGlyph />}  label="Sign in with Apple"  onClick={handleSocial} disabled={loading} />
        </div>

        <p style={{ marginTop: 24, fontSize: 13, color: C.sub, textAlign: "center" }}>
          Have an account?{" "}
          <button onClick={onSwitchToLogin} disabled={loading}
            style={{
              background: "none", border: "none", color: C.green, fontWeight: 700,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0,
            }}>
            Sign in
          </button>
        </p>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: C.subSoft, textAlign: "center", lineHeight: 1.5 }}>
          Account requires admin approval before you can log in.
        </p>
      </DesktopShell>
    );
  }

  /* ─────────────── MOBILE ─────────────── */
  return (
    <MobileShell scrollable>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, color: C.green, letterSpacing: -0.5, lineHeight: 1.15 }}>
            Create Account
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: C.sub }}>Register to access the Sales Dashboard</p>
        </div>
        <LeafSprig />
      </div>

      {error   && <Alert type="error"   message={error}   />}
      {success && <Alert type="success" message={success} />}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <MField icon={<UserIcon />}  value={name}  onChange={setName}  placeholder="Full name"           disabled={loading} />
        <MField icon={<MailIcon />}  type="email" value={email} onChange={setEmail} placeholder="Email address"       disabled={loading} />
        <MField icon={<PhoneIcon />} type="tel"   value={phone} onChange={setPhone} placeholder="+234 801 234 5678"   disabled={loading} />

        <MSelect icon={<MapIcon />}  value={branch} onChange={setBranch} options={BRANCHES} placeholder="Select branch…" disabled={loading} />
        <MSelect icon={<TeamIcon />} value={team}   onChange={setTeam}   options={TEAMS}    placeholder="Select team…"   disabled={loading} />
        <MSelect icon={<TeamIcon />} value={role}   onChange={setRole}   options={ROLES}    placeholder="Select role…"   disabled={loading} />

        <MField icon={<LockIcon />}
          type={showPw ? "text" : "password"}
          value={password} onChange={setPassword}
          placeholder="Password (min. 8 chars)" disabled={loading}
          rightNode={
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.sub, display: "flex" }}>
              <EyeIcon open={showPw} />
            </button>
          }
        />
        <MField icon={<LockIcon />} type="password"
          value={confirm} onChange={setConfirm}
          placeholder="Confirm password" disabled={loading} />

        <button type="submit" disabled={loading}
          style={{
            marginTop: 10, height: 54, borderRadius: 999, border: "none",
            background: C.green, color: C.white, fontSize: 16, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit", letterSpacing: 0.3,
          }}>
          {loading ? <><span style={spinnerStyle} />Creating account…</> : "Create Account"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13, color: C.sub, textAlign: "center" }}>
        Already have an account?{" "}
        <button onClick={onSwitchToLogin} disabled={loading}
          style={{
            background: "none", border: "none", color: C.green, fontWeight: 800,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 0,
            textDecoration: "underline", textDecorationColor: C.greenBorder,
          }}>
          Sign in
        </button>
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: C.placeholder, textAlign: "center", lineHeight: 1.5 }}>
        Account requires admin approval before you can log in.
      </p>
    </MobileShell>
  );
}

/* ============================================================================
   PENDING SCREEN
============================================================================ */
function PendingScreen({ email, onBackToLogin }: { email: string; onBackToLogin: () => void }) {
  const isMobile = useIsMobile();

  const content = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20, paddingTop: 8 }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: C.greenLight, border: `2px solid ${C.greenBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
      }}>⏳</div>
      <div>
        <h2 style={{ margin: "0 0 10px", fontSize: isMobile ? 22 : 26, fontWeight: 900, color: C.green }}>
          Awaiting Approval
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
          Your account for <strong style={{ color: C.green }}>{email}</strong> has been submitted and is pending review.
          You'll be able to log in once approved.
        </p>
      </div>
      <div style={{
        background: C.greenLight, border: `1px solid ${C.greenBorder}`,
        borderRadius: 14, padding: "14px 18px", width: "100%", textAlign: "left",
      }}>
        <p style={{ margin: 0, fontSize: 12, color: C.green, lineHeight: 1.65 }}>
          📧 Contact your admin or team lead for urgent access. This typically takes 1–2 business days.
        </p>
      </div>
      <button onClick={onBackToLogin} style={{
        width: "100%", height: isMobile ? 54 : 48,
        borderRadius: isMobile ? 999 : 10,
        border: `2px solid ${C.greenBorder}`, background: C.white,
        color: C.green, fontSize: 15, fontWeight: 800,
        cursor: "pointer", fontFamily: "inherit",
      }}>
        Back to Login
      </button>
    </div>
  );

  return isMobile ? <MobileShell>{content}</MobileShell> : <DesktopShell>{content}</DesktopShell>;
}

/* ============================================================================
   REJECTED SCREEN
============================================================================ */
function RejectedScreen({ onBackToLogin }: { onBackToLogin: () => void }) {
  const isMobile = useIsMobile();

  const content = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20, paddingTop: 8 }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "#FEF2F2", border: "2px solid #FECACA",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, color: C.error,
      }}>✕</div>
      <div>
        <h2 style={{ margin: "0 0 10px", fontSize: isMobile ? 22 : 26, fontWeight: 900, color: C.ink }}>
          Access Denied
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
          Your registration request was not approved. Please contact your team lead or admin for assistance.
        </p>
      </div>
      <button onClick={onBackToLogin} style={{
        width: "100%", height: isMobile ? 54 : 48,
        borderRadius: isMobile ? 999 : 10,
        border: `2px solid ${C.greenBorder}`, background: C.white,
        color: C.green, fontSize: 15, fontWeight: 800,
        cursor: "pointer", fontFamily: "inherit",
      }}>
        Back to Login
      </button>
    </div>
  );

  return isMobile ? <MobileShell>{content}</MobileShell> : <DesktopShell>{content}</DesktopShell>;
}

/* ============================================================================
   MAIN AUTH FLOW (workflow unchanged)
============================================================================ */
export default function AuthFlow({ onSuccess }: AuthFlowProps) {
  const [screen, setScreen]             = useState<Screen>("login");
  const [pendingEmail, setPendingEmail] = useState("");

  return (
    <>
      {screen === "login" && (
        <LoginForm
          onSuccess={onSuccess}
          onSwitchToRegister={() => setScreen("register")}
          onPending={(email) => { setPendingEmail(email); setScreen("pending"); }}
          onRejected={() => setScreen("rejected")}
        />
      )}
      {screen === "register" && (
        <RegisterForm
          onRegistered={(email) => { setPendingEmail(email); setScreen("pending"); }}
          onSwitchToLogin={() => setScreen("login")}
        />
      )}
      {screen === "pending" && (
        <PendingScreen email={pendingEmail} onBackToLogin={() => setScreen("login")} />
      )}
      {screen === "rejected" && (
        <RejectedScreen onBackToLogin={() => setScreen("login")} />
      )}
    </>
  );
}