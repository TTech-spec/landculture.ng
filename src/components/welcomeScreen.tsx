import React, { useState, useEffect } from "react";

/**
 * Wellness Real Estate — Welcome / Onboarding screen
 * Matches the reference UI: full-bleed hero, top-left headline,
 * bottom subtext, floating badge, pill CTA, and arrow navigation.
 *
 * Palette:
 *   Dark green  #004C3F
 *   Light mint  #E2F3ED
 *   Background  #FFFFFF
 */

const COLORS = {
  green: "#004C3F",
  mint: "#E2F3ED",
  white: "#FFFFFF",
};

const SLIDES = [
  {
    headline: ["Live where", "the air", "feels green"],
    sub: "Homes built around light, calm, and clean air.",
    badge: "Wellness",
  },
  {
    headline: ["Spaces that", "breathe", "with you"],
    sub: "Biophilic design in every room you settle into.",
    badge: "Serene",
  },
  {
    headline: ["Find your", "quiet", "corner"],
    sub: "Curated residences where nature lives indoors.",
    badge: "Rooted",
  },
];

interface WelcomePageProps {
  onGetStarted?: () => void;
}

export default function WelcomePage({ onGetStarted }: WelcomePageProps) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slide = SLIDES[index];

  const next = () => setIndex((i) => (i + 1) % SLIDES.length);
  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.mint,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        @keyframes riseIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50%      { transform: translateY(-7px) rotate(-3deg); }
        }
        @keyframes slowZoom {
          from { transform: scale(1.08); }
          to   { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .rise { animation: riseIn 0.7s cubic-bezier(.2,.8,.2,1) both; }
        .hero-img { animation: slowZoom 8s ease-out both; }
        .badge { animation: floatBadge 3.2s ease-in-out infinite; }

        .nav-btn {
          transition: transform .2s ease, background .25s ease, color .25s ease;
        }
        .nav-btn:hover { transform: scale(1.08); }
        .nav-btn:active { transform: scale(.94); }

        .cta {
          transition: transform .25s ease, box-shadow .3s ease;
          position: relative;
          overflow: hidden;
        }
        .cta:hover { transform: translateY(-2px); }
        .cta:active { transform: translateY(0); }
        .cta::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.25) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: shimmer 3.5s linear infinite;
        }
      `}</style>

      {/* Phone frame */}
      <div
        style={{
          position: "relative",
          width: 340,
          height: 720,
          borderRadius: 46,
          overflow: "hidden",
          background: COLORS.green,
          boxShadow:
            "0 30px 80px rgba(0,76,63,.35), 0 4px 16px rgba(0,0,0,.2)",
          border: `1px solid rgba(255,255,255,.08)`,
        }}
      >
        {/* Hero image */}
        <div
          key={index}
          className="hero-img"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=900&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Green tint + gradient for legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,76,63,.55) 0%, rgba(0,76,63,.18) 38%, rgba(0,76,63,.30) 64%, rgba(0,76,63,.88) 100%)",
          }}
        />

        {/* Status bar */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 22px 0",
            color: COLORS.white,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: .3,
          }}
        >
          <span>11:30</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}>
            <span>▮▮▮▯</span>
            <span>᳁</span>
            <span>▰</span>
          </span>
        </div>

        {/* Headline (top-left) */}
        <div style={{ position: "relative", padding: "26px 22px 0" }}>
          {slide.headline.map((line, i) => (
            <h1
              key={`${index}-${i}`}
              className="rise"
              style={{
                margin: 0,
                color: COLORS.white,
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: 40,
                lineHeight: 1.02,
                letterSpacing: -0.5,
                animationDelay: `${0.08 * i}s`,
              }}
            >
              {line}
            </h1>
          ))}
        </div>

        {/* Bottom content block */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "0 22px 26px",
          }}
        >
          <p
            className="rise"
            style={{
              color: COLORS.mint,
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.4,
              margin: "0 0 14px",
              maxWidth: 240,
              animationDelay: ".25s",
            }}
          >
            {slide.sub}
          </p>

          {/* Floating badge */}
          <div
            className="badge rise"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#C9F25E",
              color: COLORS.green,
              padding: "8px 14px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 22,
              boxShadow: "0 8px 20px rgba(0,0,0,.25)",
              animationDelay: ".35s",
            }}
          >
            <span aria-hidden>🌿</span>
            {slide.badge}
          </div>

          {/* CTA row */}
          <div
            className="rise"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              animationDelay: ".4s",
            }}
          >
            <button
              className="cta"
              onClick={onGetStarted ?? next}
              style={{
                flex: 1,
                height: 56,
                borderRadius: 32,
                border: "none",
                background: COLORS.white,
                color: COLORS.green,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: "0 10px 30px rgba(0,0,0,.25)",
              }}
            >
              Get started
            </button>

            <button
              className="nav-btn"
              onClick={prev}
              aria-label="Previous"
              style={navBtnStyle(false)}
            >
              ←
            </button>
            <button
              className="nav-btn"
              onClick={next}
              aria-label="Next"
              style={navBtnStyle(true)}
            >
              →
            </button>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 16, justifyContent: "center" }}>
            {SLIDES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? 22 : 7,
                  height: 7,
                  borderRadius: 999,
                  background: i === index ? COLORS.mint : "rgba(226,243,237,.35)",
                  transition: "width .3s ease, background .3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function navBtnStyle(filled: boolean): React.CSSProperties {
  return {
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: filled ? "none" : `1.5px solid rgba(226,243,237,.5)`,
    background: filled ? COLORS.green : "rgba(226,243,237,.12)",
    color: COLORS.white,
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(6px)",
  };
}