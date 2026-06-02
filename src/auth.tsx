import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ProfileStatus } from "@/lib/supabase";

/* ============================================================================
   PALETTE — matches the reference photo-hero mobile design
============================================================================ */
const C = {
  green:       "#2D5016",   // deep olive — headings, button
  greenMid:    "#3B6B1A",   // hover state
  greenLight:  "#EAF2E0",   // field background tint
  greenBorder: "#C5DCAA",   // field border
  greenIcon:   "#5A8A30",   // icon inside field
  ink:         "#1C2B0E",   // headings
  sub:         "#6B7A5E",   // subheadings / placeholder
  link:        "#2D5016",   // "Sign up" / "Sign in"
  white:       "#FFFFFF",
  error:       "#C0392B",
  errorBg:     "#FEF2F2",
  success:     "#2D5016",
  successBg:   "#EAF2E0",
  warning:     "#A0520A",
  warningBg:   "#FEF8EC",
  placeholder: "#9BAD86",
};

/* Lush tropical leaf photo — top hero */
const LEAF_PHOTO = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=900&auto=format&fit=crop";

/* Small leaf sprig SVG used as a decorative element near the heading */
const LeafSprig = () => (
  <svg width="52" height="56" viewBox="0 0 52 56" fill="none" style={{ flexShrink: 0 }}>
    <ellipse cx="26" cy="28" rx="14" ry="22" fill="#4A7C25" transform="rotate(-20 26 28)" />
    <ellipse cx="26" cy="28" rx="5"  ry="17" fill="#3B6B1A" transform="rotate(-20 26 28)" />
    <line x1="26" y1="50" x2="26" y2="10" stroke="#2D5016" strokeWidth="1.5"
      strokeLinecap="round" transform="rotate(-20 26 28)" />
    <ellipse cx="38" cy="22" rx="10" ry="17" fill="#5A8A30" transform="rotate(15 38 22)" />
    <ellipse cx="38" cy="22" rx="3.5" ry="12" fill="#4A7C25" transform="rotate(15 38 22)" />
    <line x1="38" y1="38" x2="38" y2="8" stroke="#3B6B1A" strokeWidth="1.2"
      strokeLinecap="round" transform="rotate(15 38 22)" />
  </svg>
);

export interface User {
  id: string;
  email: string;
  name: string;
  branch: string;
  team: string;
  phone: string;
}

interface AuthFlowProps {
  onSuccess: (user: User) => void;
}

type Screen = "login" | "register" | "pending" | "rejected";

/* ============================================================================
   BRANCHES & TEAMS
============================================================================ */
const BRANCHES = [
  "Sango Branch",
];

const TEAMS = [
  "Success Team",
  "Achievers Team",
];

/* ============================================================================
   SPINNER
============================================================================ */
const spinnerStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: "2.5px solid rgba(255,255,255,.35)",
  borderTopColor: "#fff",
  animation: "mSpin .7s linear infinite",
  display: "inline-block",
  flexShrink: 0,
};

/* ============================================================================
   ALERT BANNER
============================================================================ */
function Alert({ type, message }: { type: "error" | "warning" | "success"; message: string }) {
  const s = {
    error:   { bg: C.errorBg,   border: "#F5C6CB", text: C.error,   icon: "✕" },
    warning: { bg: C.warningBg, border: "#FDDFA6", text: C.warning, icon: "⚠" },
    success: { bg: C.successBg, border: C.greenBorder, text: C.success, icon: "✓" },
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
   MOBILE FIELD — mint-tinted background, icon prefix, pill-ish shape
============================================================================ */
function MField({
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  rightNode,
}: {
  icon: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rightNode?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: C.greenLight,
      border: `1.5px solid ${focused ? C.green : C.greenBorder}`,
      borderRadius: 14,
      padding: "0 14px",
      height: 52,
      transition: "border-color .2s",
    }}>
      <span style={{ color: C.greenIcon, display: "flex", flexShrink: 0, fontSize: 18 }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          border: "none",
          background: "transparent",
          outline: "none",
          fontSize: 14,
          color: C.ink,
          fontFamily: "inherit",
        }}
      />
      {rightNode && <span style={{ color: C.sub, display: "flex", flexShrink: 0 }}>{rightNode}</span>}
    </div>
  );
}

/* ============================================================================
   MOBILE SELECT — same tinted style
============================================================================ */
function MSelect({
  icon,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: C.greenLight,
      border: `1.5px solid ${C.greenBorder}`,
      borderRadius: 14, padding: "0 14px", height: 52,
      position: "relative",
    }}>
      <span style={{ color: C.greenIcon, display: "flex", flexShrink: 0, fontSize: 18 }}>{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          flex: 1, border: "none", background: "transparent", outline: "none",
          fontSize: 14, color: value ? C.ink : C.placeholder,
          fontFamily: "inherit", appearance: "none", cursor: "pointer",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {/* chevron */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.sub} strokeWidth="2.5"
        style={{ flexShrink: 0, pointerEvents: "none" }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

/* ============================================================================
   MOBILE SHELL — photo hero top, white card slides up
============================================================================ */
function MobileShell({
  children,
  scrollable = false,
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      position: "relative",
      fontFamily: "'Nunito', 'Plus Jakarta Sans', system-ui, sans-serif",
      background: "#1A2E0A",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes mSpin { to { transform: rotate(360deg); } }
        @keyframes cardUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes photoFade { from { opacity: 0; } to { opacity: 1; } }
        input::placeholder { color: ${C.placeholder}; }
        input:disabled, select:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      {/* ── HERO PHOTO ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "48%",
        backgroundImage: `url('${LEAF_PHOTO}')`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        animation: "photoFade .6s ease both",
      }} />

      {/* ── WHITE CARD PANEL ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        top: "35%",
        background: C.white,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: scrollable ? "32px 28px 40px" : "32px 28px 36px",
        overflowY: scrollable ? "auto" : "visible",
        animation: "cardUp .5s cubic-bezier(.2,.8,.2,1) both",
        display: "flex",
        flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ============================================================================
   EYE ICON — for password toggle
============================================================================ */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* ============================================================================
   LOGIN FORM
============================================================================ */
function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onPending,
  onRejected,
}: {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onPending: (email: string) => void;
  onRejected: () => void;
}) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
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
        id: authData.user.id,
        email: authData.user.email ?? "",
        name: profile.name, branch: profile.branch,
        team: profile.team,  phone: profile.phone,
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

  return (
    <MobileShell>
      {/* Heading row */}
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
        {/* Email field */}
        <MField
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Email address"
          disabled={loading}
        />

        {/* Password field with eye toggle */}
        <MField
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          }
          type={showPw ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Password"
          disabled={loading}
          rightNode={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.sub, display: "flex" }}
            >
              <EyeIcon open={showPw} />
            </button>
          }
        />

        {/* Remember me / Forgot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.sub, cursor: "pointer" }}>
            <span style={{
              width: 16, height: 16, borderRadius: "50%",
              border: `2px solid ${C.greenBorder}`,
              background: C.greenLight,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="9" height="9" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="3" fill={C.green} />
              </svg>
            </span>
            Remember Me
          </label>
          <button type="button" style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, color: C.green, cursor: "pointer", fontFamily: "inherit", padding: 0 }}>
            Forgot Password?
          </button>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            height: 54,
            borderRadius: 999,
            border: "none",
            background: C.green,
            color: C.white,
            fontSize: 16,
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit",
            letterSpacing: 0.3,
          }}
        >
          {loading ? <><span style={spinnerStyle} />Signing in…</> : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 22, fontSize: 13, color: C.sub, textAlign: "center" }}>
        Don't have account?{" "}
        <button
          onClick={onSwitchToRegister}
          disabled={loading}
          style={{
            background: "none", border: "none",
            color: C.green, fontWeight: 800, fontSize: 13,
            cursor: "pointer", fontFamily: "inherit", padding: 0,
            textDecoration: "underline", textDecorationColor: C.greenBorder,
          }}
        >
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
  onRegistered,
  onSwitchToLogin,
}: {
  onRegistered: (email: string) => void;
  onSwitchToLogin: () => void;
}) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [branch,   setBranch]   = useState("");
  const [team,     setTeam]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name || !email || !phone || !branch || !team || !password || !confirm) {
      setError("Please fill in all required fields."); return;
    }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
        options: { data: { name, phone, branch, team } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed. Please try again.");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        branch, team, status: "pending",
      });
      if (profileError) throw profileError;

      await supabase.auth.signOut();
      setSuccess("Registration successful!");
      setTimeout(() => onRegistered(email.trim().toLowerCase()), 800);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 10a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
  const MapIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  const TeamIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
  const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );

  return (
    <MobileShell scrollable>
      {/* Heading */}
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
        <MField icon={<UserIcon />}  value={name}     onChange={setName}     placeholder="Full name"           disabled={loading} />
        <MField icon={<MailIcon />}  type="email" value={email}    onChange={setEmail}    placeholder="Email address"       disabled={loading} />
        <MField icon={<PhoneIcon />} type="tel"   value={phone}    onChange={setPhone}    placeholder="+234 801 234 5678"   disabled={loading} />

        <MSelect
          icon={<MapIcon />}
          value={branch} onChange={setBranch}
          options={BRANCHES} placeholder="Select branch…"
          disabled={loading}
        />
        <MSelect
          icon={<TeamIcon />}
          value={team} onChange={setTeam}
          options={TEAMS} placeholder="Select team…"
          disabled={loading}
        />

        <MField
          icon={<LockIcon />}
          type={showPw ? "text" : "password"}
          value={password} onChange={setPassword}
          placeholder="Password (min. 8 chars)"
          disabled={loading}
          rightNode={
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.sub, display: "flex" }}>
              <EyeIcon open={showPw} />
            </button>
          }
        />
        <MField
          icon={<LockIcon />}
          type="password"
          value={confirm} onChange={setConfirm}
          placeholder="Confirm password"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 10,
            height: 54, borderRadius: 999,
            border: "none", background: C.green,
            color: C.white, fontSize: 16, fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "inherit", letterSpacing: 0.3,
          }}
        >
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
  return (
    <MobileShell>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20, paddingTop: 8 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: C.greenLight, border: `2px solid ${C.greenBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
        }}>⏳</div>
        <div>
          <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: C.green }}>Awaiting Approval</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
            Your account for <strong style={{ color: C.green }}>{email}</strong> has been submitted and is pending review. You'll be able to log in once approved.
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
          width: "100%", height: 54, borderRadius: 999,
          border: `2px solid ${C.greenBorder}`, background: C.white,
          color: C.green, fontSize: 15, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Back to Login
        </button>
      </div>
    </MobileShell>
  );
}

/* ============================================================================
   REJECTED SCREEN
============================================================================ */
function RejectedScreen({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <MobileShell>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20, paddingTop: 8 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "#FEF2F2", border: "2px solid #FECACA",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: C.error,
        }}>✕</div>
        <div>
          <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: C.ink }}>Access Denied</h2>
          <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
            Your registration request was not approved. Please contact your team lead or admin for assistance.
          </p>
        </div>
        <button onClick={onBackToLogin} style={{
          width: "100%", height: 54, borderRadius: 999,
          border: `2px solid ${C.greenBorder}`, background: C.white,
          color: C.green, fontSize: 15, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Back to Login
        </button>
      </div>
    </MobileShell>
  );
}

/* ============================================================================
   MAIN AUTH FLOW
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