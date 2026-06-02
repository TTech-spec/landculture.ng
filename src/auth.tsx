import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ProfileStatus } from "@/lib/supabase";

/* ============================================================================
   PALETTE
============================================================================ */
const C = {
  green: "#1B4D3E",
  greenMid: "#2E6B55",
  greenLight: "#3A8A6A",
  mint: "#EAF4EF",
  mintDark: "#C8E6D8",
  fieldBg: "#EEF5F1",
  ink: "#1A1A1A",
  label: "#1F2A24",
  sub: "#7A8F85",
  border: "transparent",
  white: "#FFFFFF",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  placeholder: "#9EB5A8",
};

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
   SHARED STYLES
============================================================================ */
const FONT = "'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif";

const mobileWrap: React.CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#D6E8DF",
  fontFamily: FONT,
  padding: "16px",
  boxSizing: "border-box",
};

const phoneShell: React.CSSProperties = {
  width: "100%",
  maxWidth: 390,
  minHeight: 720,
  borderRadius: 40,
  overflow: "hidden",
  boxShadow: "0 30px 80px rgba(0,0,0,0.25), 0 0 0 8px #1A1A1A, 0 0 0 10px #3A3A3A",
  position: "relative",
  background: C.white,
  display: "flex",
  flexDirection: "column",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  height: 54,
  borderRadius: 32,
  border: "none",
  background: C.green,
  color: C.white,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONT,
  letterSpacing: 0.3,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "opacity .2s, transform .15s",
  boxShadow: "0 6px 20px rgba(27,77,62,0.35)",
};

const secondaryBtn: React.CSSProperties = {
  width: "100%",
  height: 50,
  borderRadius: 32,
  border: `2px solid ${C.mintDark}`,
  background: "transparent",
  color: C.green,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: FONT,
  transition: "background .2s",
};

const spinnerStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: "50%",
  border: "2.5px solid rgba(255,255,255,.3)",
  borderTopColor: "#fff",
  animation: "spin .7s linear infinite",
  display: "inline-block",
  flexShrink: 0,
};

/* ============================================================================
   BOTANICL HERO HEADER
============================================================================ */
function BotanicalHeader({
  back,
  onBack,
}: {
  back?: boolean;
  onBack?: () => void;
}) {
  return (
    <div style={{ position: "relative", height: 240, flexShrink: 0 }}>
      {/* Leaf background using CSS gradient + SVG pattern to simulate lush foliage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 30%, #0D3B2C 0%, transparent 55%),
            radial-gradient(ellipse at 80% 10%, #1B5C40 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, #0A2E20 0%, transparent 60%),
            radial-gradient(ellipse at 10% 90%, #163D2B 0%, transparent 45%),
            radial-gradient(ellipse at 90% 70%, #1A4D35 0%, transparent 50%),
            #0F3826
          `,
          overflow: "hidden",
        }}
      >
        {/* SVG leaf shapes */}
        <svg
          viewBox="0 0 390 240"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Large back leaves */}
          <ellipse cx="60" cy="60" rx="90" ry="40" fill="#0D3B2C" transform="rotate(-30 60 60)" opacity="0.9"/>
          <ellipse cx="330" cy="40" rx="80" ry="35" fill="#1A5E3F" transform="rotate(25 330 40)" opacity="0.85"/>
          <ellipse cx="200" cy="20" rx="70" ry="30" fill="#143D2B" transform="rotate(10 200 20)" opacity="0.8"/>
          <ellipse cx="20" cy="180" rx="100" ry="38" fill="#0C3525" transform="rotate(-20 20 180)" opacity="0.9"/>
          <ellipse cx="370" cy="160" rx="85" ry="32" fill="#184D35" transform="rotate(35 370 160)" opacity="0.85"/>
          {/* Mid leaves */}
          <ellipse cx="100" cy="100" rx="65" ry="28" fill="#1B5C40" transform="rotate(-45 100 100)" opacity="0.7"/>
          <ellipse cx="280" cy="90" rx="75" ry="30" fill="#165438" transform="rotate(15 280 90)" opacity="0.75"/>
          <ellipse cx="160" cy="190" rx="80" ry="35" fill="#12402E" transform="rotate(-10 160 190)" opacity="0.8"/>
          <ellipse cx="320" cy="200" rx="60" ry="25" fill="#1D6045" transform="rotate(40 320 200)" opacity="0.7"/>
          {/* Leaf veins */}
          <line x1="60" y1="40" x2="60" y2="80" stroke="#0A2E20" strokeWidth="1.5" opacity="0.5"/>
          <line x1="100" y1="85" x2="100" y2="115" stroke="#0A2E20" strokeWidth="1.5" opacity="0.4"/>
          <line x1="280" y1="75" x2="280" y2="105" stroke="#0A2E20" strokeWidth="1.5" opacity="0.4"/>
          {/* Front accent leaves */}
          <ellipse cx="0" cy="120" rx="70" ry="28" fill="#22704F" transform="rotate(-35 0 120)" opacity="0.65"/>
          <ellipse cx="390" cy="100" rx="65" ry="26" fill="#1F6548" transform="rotate(30 390 100)" opacity="0.6"/>
          <ellipse cx="195" cy="230" rx="120" ry="42" fill="#0E3526" transform="rotate(5 195 230)" opacity="0.85"/>
          {/* Highlight leaves */}
          <ellipse cx="80" cy="30" rx="45" ry="18" fill="#2E8A60" transform="rotate(-25 80 30)" opacity="0.45"/>
          <ellipse cx="310" cy="50" rx="50" ry="20" fill="#2A7A58" transform="rotate(20 310 50)" opacity="0.4"/>
        </svg>

        {/* Decorative leaf detail (floating accent) */}
        <div
          style={{
            position: "absolute",
            right: 20,
            bottom: 30,
            width: 60,
            height: 80,
          }}
        >
          <svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30 75 C30 75 0 50 5 25 C10 5 30 0 30 0 C30 0 50 5 55 25 C60 50 30 75 30 75Z"
              fill="#3AAD72"
              opacity="0.85"
            />
            <line x1="30" y1="5" x2="30" y2="72" stroke="#1B6040" strokeWidth="1.5" opacity="0.6"/>
            <line x1="30" y1="25" x2="12" y2="38" stroke="#1B6040" strokeWidth="1" opacity="0.5"/>
            <line x1="30" y1="35" x2="48" y2="45" stroke="#1B6040" strokeWidth="1" opacity="0.5"/>
            <line x1="30" y1="45" x2="15" y2="55" stroke="#1B6040" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
      </div>

      {/* Wave cutout bottom */}
      <div
        style={{
          position: "absolute",
          bottom: -1,
          left: 0,
          right: 0,
          height: 60,
          background: C.white,
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
        }}
      />

      {/* Back button */}
      {back && (
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 52,
            left: 20,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            zIndex: 10,
          }}
        >
          ‹
        </button>
      )}
    </div>
  );
}

/* ============================================================================
   FIELD COMPONENT — Soft mint pill style
============================================================================ */
function Field({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  disabled,
  rightIcon,
  onRightIconClick,
}: {
  label?: string;
  icon?: React.ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: label ? 6 : 0 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}{required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div
        style={{
          height: 52,
          borderRadius: 14,
          background: C.fieldBg,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          border: `2px solid ${focused ? C.greenMid : "transparent"}`,
          transition: "border-color .2s",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {icon && (
          <span style={{ color: C.greenMid, fontSize: 16, flexShrink: 0, opacity: 0.8 }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 14,
            fontWeight: 500,
            color: C.ink,
            fontFamily: FONT,
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.sub,
              fontSize: 16,
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   SELECT FIELD
============================================================================ */
function SelectField({
  label,
  icon,
  value,
  onChange,
  options,
  required,
  disabled,
}: {
  label?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: label ? 6 : 0 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}{required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div
        style={{
          height: 52,
          borderRadius: 14,
          background: C.fieldBg,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          border: `2px solid transparent`,
        }}
      >
        {icon && (
          <span style={{ color: C.greenMid, fontSize: 16, flexShrink: 0, opacity: 0.8 }}>{icon}</span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 14,
            fontWeight: 500,
            color: value ? C.ink : C.placeholder,
            fontFamily: FONT,
            cursor: disabled ? "not-allowed" : "pointer",
            appearance: "none",
          }}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span style={{ color: C.sub, fontSize: 12 }}>▾</span>
      </div>
    </div>
  );
}

/* ============================================================================
   ALERT BANNER
============================================================================ */
function Alert({ type, message }: { type: "error" | "warning" | "success"; message: string }) {
  const s = {
    error: { bg: C.errorBg, text: C.error, icon: "✕" },
    warning: { bg: C.warningBg, text: C.warning, icon: "⚠" },
    success: { bg: C.mint, text: C.green, icon: "✓" },
  }[type];
  return (
    <div style={{ background: s.bg, borderRadius: 12, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ color: s.text, fontWeight: 700, flexShrink: 0, fontSize: 14 }}>{s.icon}</span>
      <p style={{ margin: 0, fontSize: 13, color: s.text, lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}

/* ============================================================================
   BRANCHES & TEAMS
============================================================================ */
const BRANCHES = [
  "Lagos – Lekki Branch",
  "Lagos – Ikeja Branch",
  "Lagos – Victoria Island Branch",
  "Abuja – Maitama Branch",
  "Abuja – Wuse Branch",
  "Port Harcourt Branch",
  "Enugu Branch",
  "Kano Branch",
];

const TEAMS = [
  "Sales Team A",
  "Sales Team B",
  "Sales Team C",
  "Premium Sales",
  "Corporate Sales",
];

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
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
      if (status === "pending") { await supabase.auth.signOut(); onPending(email.trim().toLowerCase()); return; }
      if (status === "rejected") { await supabase.auth.signOut(); onRejected(); return; }
      if (status !== "approved") { await supabase.auth.signOut(); throw new Error("Your account status is invalid. Contact your admin."); }

      onSuccess({ id: authData.user.id, email: authData.user.email ?? "", name: profile.name, branch: profile.branch, team: profile.team, phone: profile.phone });
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message;
        if (msg.includes("Invalid login credentials")) setError("Incorrect email or password. Please try again.");
        else if (msg.includes("Email not confirmed")) setError("Please verify your email before logging in.");
        else setError(msg);
      } else setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={mobileWrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div style={phoneShell}>
        <BotanicalHeader />

        {/* Content Card */}
        <div style={{ flex: 1, padding: "4px 28px 32px", display: "flex", flexDirection: "column", animation: "fadeUp .4s ease both" }}>
          {/* Title */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.ink, fontFamily: FONT, lineHeight: 1.2 }}>
                Welcom Back
              </h1>
              {/* Small leaf accent */}
              <svg width="28" height="36" viewBox="0 0 28 36" style={{ flexShrink: 0 }}>
                <path d="M14 34 C14 34 1 22 2 11 C3 3 14 0 14 0 C14 0 25 3 26 11 C27 22 14 34 14 34Z" fill="#3AAD72" opacity="0.9"/>
                <line x1="14" y1="2" x2="14" y2="32" stroke="#1B6040" strokeWidth="1.2" opacity="0.5"/>
                <line x1="14" y1="12" x2="6" y2="18" stroke="#1B6040" strokeWidth="1" opacity="0.4"/>
                <line x1="14" y1="19" x2="22" y2="24" stroke="#1B6040" strokeWidth="1" opacity="0.4"/>
              </svg>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.sub }}>Login to your account</p>
          </div>

          {error && <div style={{ marginBottom: 14 }}><Alert type="error" message={error} /></div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field
              icon="👤"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Full Name"
              required
              disabled={loading}
            />
            <Field
              icon="🔒"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              disabled={loading}
              rightIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPw
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              }
              onRightIconClick={() => setShowPw(!showPw)}
            />

            {/* Remember Me + Forgot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: C.sub, fontWeight: 500 }}>
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    border: `2px solid ${rememberMe ? C.greenMid : C.mintDark}`,
                    background: rememberMe ? C.greenMid : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all .15s",
                    flexShrink: 0,
                  }}
                >
                  {rememberMe && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                Remember Me
              </label>
              <button
                type="button"
                style={{ background: "none", border: "none", color: C.green, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT, padding: 0 }}
              >
                Forgot Password ?
              </button>
            </div>

            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={{ ...primaryBtn, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? <><span style={spinnerStyle} /> Signing in…</> : "Login"}
              </button>
            </div>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.sub }}>
            Don't have account?{" "}
            <button
              onClick={onSwitchToRegister}
              disabled={loading}
              style={{ background: "none", border: "none", color: C.green, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: FONT, padding: 0 }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branch, setBranch] = useState("");
  const [team, setTeam] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name || !email || !phone || !branch || !team || !password || !confirm) { setError("Please fill in all required fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { name, phone, branch, team } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed. Please try again.");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        branch, team,
        status: "pending",
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

  return (
    <div style={mobileWrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div style={{ ...phoneShell, minHeight: 820 }}>
        <BotanicalHeader back onBack={onSwitchToLogin} />

        <div style={{ flex: 1, padding: "4px 28px 32px", display: "flex", flexDirection: "column", animation: "fadeUp .4s ease both", overflowY: "auto" }}>
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.ink, fontFamily: FONT }}>Create Account</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.sub }}>Register to access the Sales Dashboard</p>
          </div>

          {error && <div style={{ marginBottom: 12 }}><Alert type="error" message={error} /></div>}
          {success && <div style={{ marginBottom: 12 }}><Alert type="success" message={success} /></div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <Field icon="👤" value={name} onChange={setName} placeholder="Full Name" required disabled={loading} />
            <Field icon="✉️" type="email" value={email} onChange={setEmail} placeholder="Email Address" required disabled={loading} />
            <Field icon="📱" type="tel" value={phone} onChange={setPhone} placeholder="+234 801 234 5678" required disabled={loading} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <SelectField
                icon="🏢"
                value={branch}
                onChange={setBranch}
                options={BRANCHES.map((b) => ({ value: b, label: b }))}
                required
                disabled={loading}
              />
              <SelectField
                icon="👥"
                value={team}
                onChange={setTeam}
                options={TEAMS.map((t) => ({ value: t, label: t }))}
                required
                disabled={loading}
              />
            </div>
            <Field
              icon="🔒"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Password (min. 8 chars)"
              required
              disabled={loading}
              rightIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPw
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                  }
                </svg>
              }
              onRightIconClick={() => setShowPw(!showPw)}
            />
            <Field icon="🔒" type="password" value={confirm} onChange={setConfirm} placeholder="Confirm Password" required disabled={loading} />

            <div style={{ marginTop: 6 }}>
              <button
                type="submit"
                disabled={loading}
                style={{ ...primaryBtn, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? <><span style={spinnerStyle} /> Registering…</> : "Create Account"}
              </button>
            </div>
          </form>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.sub }}>
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              disabled={loading}
              style={{ background: "none", border: "none", color: C.green, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: FONT, padding: 0 }}
            >
              Sign in
            </button>
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 11, color: C.placeholder, textAlign: "center", lineHeight: 1.5 }}>
            Your account requires admin approval before login.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   PENDING SCREEN
============================================================================ */
function PendingScreen({ email, onBackToLogin }: { email: string; onBackToLogin: () => void }) {
  return (
    <div style={mobileWrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={phoneShell}>
        <BotanicalHeader back onBack={onBackToLogin} />
        <div style={{ flex: 1, padding: "20px 28px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>⏳</div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.ink, fontFamily: FONT }}>Awaiting Approval</h2>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: C.sub, lineHeight: 1.6 }}>
              Account for <strong>{email}</strong> is pending admin review. You'll be able to log in once approved.
            </p>
          </div>
          <div style={{ background: C.mint, border: `1px solid ${C.mintDark}`, borderRadius: 14, padding: "14px 16px", width: "100%" }}>
            <p style={{ margin: 0, fontSize: 13, color: C.green, lineHeight: 1.6 }}>
              📧 Contact your admin or team lead if you need urgent access. This typically takes 1–2 business days.
            </p>
          </div>
          <button onClick={onBackToLogin} style={secondaryBtn}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   REJECTED SCREEN
============================================================================ */
function RejectedScreen({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <div style={mobileWrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={phoneShell}>
        <BotanicalHeader back onBack={onBackToLogin} />
        <div style={{ flex: 1, padding: "20px 28px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: C.error }}>✕</div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.ink, fontFamily: FONT }}>Access Denied</h2>
            <p style={{ margin: "8px 0 0", fontSize: 14, color: C.sub, lineHeight: 1.6 }}>
              Your registration request was not approved. Please contact your team lead or admin for assistance.
            </p>
          </div>
          <button onClick={onBackToLogin} style={secondaryBtn}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN AUTH FLOW
============================================================================ */
export default function AuthFlow({ onSuccess }: AuthFlowProps) {
  const [screen, setScreen] = useState<Screen>("login");
  const [pendingEmail, setPendingEmail] = useState("");

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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