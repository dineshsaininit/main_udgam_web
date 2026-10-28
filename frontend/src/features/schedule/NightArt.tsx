import type { CSSProperties } from "react";

import type { NightArt as NightArtKind } from "./scheduleData";

// Animated, code-drawn artwork for each night act: no photos, no people.
// All motion lives in schedule.css (prefixed "art-"); sizes use container units
// so every piece fills whatever card it sits in.

// Deterministic integer PRNG so server and client draw the same scene.
const prng = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const v = (vars: Record<string, string | number>) => vars as CSSProperties;

export function NightArt({ kind }: { kind: NightArtKind }) {
  switch (kind) {
    case "concert":
      return <Concert />;
    case "band":
      return <Band />;
    case "kathak":
      return <Kathak />;
    case "folk":
      return <Folk />;
    case "runway":
      return <Runway />;
    case "dj":
      return <Dj />;
  }
}

const LASER_COLORS = ["#f6a9c8", "#b79cff", "#9fdcff", "#ff7fb0"];
const r1 = prng(7);
const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  left: (r1() * 100).toFixed(1),
  delay: (r1() * -8).toFixed(2),
  dur: (5 + r1() * 5).toFixed(2),
  color: LASER_COLORS[i % LASER_COLORS.length]!,
  rot: Math.round(r1() * 360),
}));

function Concert() {
  return (
    <div className="art art-concert" aria-hidden>
      <div className="art-haze" />
      <div className="art-lasers">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            style={v({
              "--a": `${-65 + i * 10}deg`,
              "--c": LASER_COLORS[i % LASER_COLORS.length]!,
              animationDelay: `${(i % 4) * -0.9}s`,
            })}
          />
        ))}
      </div>
      <div className="art-rings">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * -1}s` }} />
        ))}
      </div>
      <div className="art-truss">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * -0.35}s` }} />
        ))}
      </div>
      <div className="art-confetti">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            style={v({
              left: `${c.left}%`,
              background: c.color,
              rotate: `${c.rot}deg`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
            })}
          />
        ))}
      </div>
      <div className="art-stagefloor" />
    </div>
  );
}

// One wavelength of a sine is 100 units; two copies let the path scroll seamlessly.
const wave = (amp: number, mid: number) => {
  let d = `M0 ${mid}`;
  for (let x = 0; x < 400; x += 50)
    d += ` Q${x + 25} ${mid + (x % 100 ? amp : -amp)} ${x + 50} ${mid}`;
  return d;
};

function Band() {
  return (
    <div className="art art-band" aria-hidden>
      <div className="art-haze" />
      <svg className="art-waves" viewBox="0 0 200 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="art-wave-g" x1="0" x2="1">
            <stop offset="0" stopColor="#9fdcff" />
            <stop offset="0.5" stopColor="#b79cff" />
            <stop offset="1" stopColor="#f6a9c8" />
          </linearGradient>
        </defs>
        {[
          [18, 50, 1.6],
          [10, 50, 1],
          [26, 50, 0.6],
        ].map(([amp, mid, w], i) => (
          <path
            key={i}
            d={wave(amp!, mid!)}
            stroke="url(#art-wave-g)"
            strokeWidth={w}
            fill="none"
            style={{ animationDuration: `${3 + i * 1.3}s`, opacity: 1 - i * 0.25 }}
          />
        ))}
      </svg>
      <div className="art-amps">
        {[0, 1].map((i) => (
          <div key={i} className="art-amp">
            <span className="art-amp__tweeter" />
            <span className="art-amp__woofer" />
          </div>
        ))}
      </div>
    </div>
  );
}

function petalRing(count: number, radius: number, rx: number, ry: number) {
  return Array.from({ length: count }, (_, i) => {
    const deg = (360 / count) * i;
    return <ellipse key={i} cx="0" cy={-radius} rx={rx} ry={ry} transform={`rotate(${deg})`} />;
  });
}

function Kathak() {
  return (
    <div className="art art-kathak" aria-hidden>
      <div className="art-haze" />
      <svg className="art-mandala" viewBox="-100 -100 200 200">
        <defs>
          <radialGradient id="art-core-g">
            <stop offset="0" stopColor="#fff4f8" />
            <stop offset="0.5" stopColor="#ffc3d9" />
            <stop offset="1" stopColor="#cf4f8d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g
          className="art-spin art-spin--slow"
          fill="none"
          stroke="#ffd27f"
          strokeWidth="0.8"
          opacity="0.85"
        >
          {petalRing(16, 70, 9, 22)}
        </g>
        <g
          className="art-spin art-spin--rev"
          fill="rgba(246,169,200,0.22)"
          stroke="#f6a9c8"
          strokeWidth="0.9"
        >
          {petalRing(12, 46, 9, 18)}
        </g>
        <g
          className="art-spin art-spin--fast"
          fill="rgba(183,156,255,0.3)"
          stroke="#d8c8ff"
          strokeWidth="0.8"
        >
          {petalRing(8, 24, 7, 13)}
        </g>
        <g className="art-spin art-spin--rev">
          {Array.from({ length: 28 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 28;
            return (
              <circle
                key={i}
                className="art-bell"
                cx={(Math.cos(a) * 92).toFixed(2)}
                cy={(Math.sin(a) * 92).toFixed(2)}
                r="2.4"
                style={{ animationDelay: `${(i % 7) * -0.3}s` }}
              />
            );
          })}
        </g>
        <circle r="16" fill="url(#art-core-g)" />
      </svg>
    </div>
  );
}

const FLAG_COLORS = ["#4f7fe0", "#f4f1ff", "#e2475f", "#3fae6a", "#f4c542"];
const r2 = prng(41);
const NOTES = Array.from({ length: 12 }, (_, i) => ({
  left: (8 + r2() * 84).toFixed(1),
  delay: (r2() * -9).toFixed(2),
  dur: (6 + r2() * 5).toFixed(2),
  glyph: i % 3 === 0 ? "♫" : i % 3 === 1 ? "♪" : "♬",
  size: (0.8 + r2() * 0.9).toFixed(2),
}));

function Folk() {
  return (
    <div className="art art-folk" aria-hidden>
      <div className="art-moon" />
      <svg className="art-hills" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice">
        <path
          d="M0 120 L60 70 L110 100 L170 40 L230 95 L290 55 L350 90 L400 65 L400 200 L0 200Z"
          fill="#3b2561"
        />
        <path
          d="M0 150 L80 110 L150 140 L220 100 L300 145 L360 115 L400 130 L400 200 L0 200Z"
          fill="#2a1a48"
        />
        <path
          d="M0 175 C80 160 150 185 230 168 C300 154 350 178 400 170 L400 200 L0 200Z"
          fill="#1a1030"
        />
      </svg>
      <div className="art-flags">
        {Array.from({ length: 11 }, (_, i) => (
          <span
            key={i}
            style={{
              background: FLAG_COLORS[i % FLAG_COLORS.length],
              left: `${4 + i * 8.8}%`,
              top: `${18 + Math.sin((i / 10) * Math.PI) * 9}%`,
              animationDelay: `${i * -0.2}s`,
            }}
          />
        ))}
      </div>
      <div className="art-notes">
        {NOTES.map((n, i) => (
          <span
            key={i}
            style={{
              left: `${n.left}%`,
              fontSize: `${n.size}rem`,
              animationDelay: `${n.delay}s`,
              animationDuration: `${n.dur}s`,
            }}
          >
            {n.glyph}
          </span>
        ))}
      </div>
    </div>
  );
}

const r3 = prng(99);
const FLASHES = Array.from({ length: 16 }, (_, i) => ({
  left: i % 2 ? (70 + r3() * 26).toFixed(1) : (4 + r3() * 26).toFixed(1),
  top: (8 + r3() * 45).toFixed(1),
  delay: (r3() * -5).toFixed(2),
  dur: (2.5 + r3() * 3).toFixed(2),
}));

function Runway() {
  return (
    <div className="art art-runway" aria-hidden>
      <div className="art-spot" />
      <div className="art-track">
        <div className="art-track__lights" />
      </div>
      <div className="art-flashes">
        {FLASHES.map((f, i) => (
          <span
            key={i}
            style={{
              left: `${f.left}%`,
              top: `${f.top}%`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.dur}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Dj() {
  return (
    <div className="art art-dj" aria-hidden>
      <div className="art-grid" />
      <div className="art-sun" />
      <div className="art-deck">
        <div className="art-vinyl">
          <span className="art-vinyl__label" />
        </div>
        <span className="art-arm" />
      </div>
      <div className="art-eq">
        {Array.from({ length: 16 }, (_, i) => (
          <i key={i} style={{ animationDelay: `${((i * 37) % 11) * -0.1}s` }} />
        ))}
      </div>
    </div>
  );
}
