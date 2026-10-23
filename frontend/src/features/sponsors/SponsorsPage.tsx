import { useEffect, useMemo, useRef, useState } from "react";
import { cssVars } from "@/lib/css-vars";
import { subscribeTilt } from "@/features/team/lib/deviceTilt";
import TiltPrompt from "@/features/team/components/TiltPrompt";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SponsorCategory {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

interface Sponsor {
  id: string;
  name: string;
  categoryId: string;
  tier: string;
  logo: string;
  website?: string;
  description?: string;
}

interface TierInfo {
  label: string;
  color: string;
  order: number;
}

type TierConfig = Record<string, TierInfo>;

interface SponsorsData {
  categories: SponsorCategory[];
  sponsors: Sponsor[];
  tierConfig: TierConfig;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PANORAMA = "/assets/team/backgrounds/team-panorama";

// Spread out deterministically so the layout is stable between renders
const PETALS = Array.from({ length: 14 }, (_, i) =>
  cssVars({
    "--x": `${(i * 37) % 100}%`,
    "--size": `${10 + ((i * 5) % 9)}px`,
    "--blur": `${(i % 3) * 0.6}px`,
    "--fall": `${13 + ((i * 7) % 9)}s`,
    "--sway": `${3.2 + (i % 4) * 0.7}s`,
    "--delay": `${i * -1.9}s`,
  }),
);

/** Known sponsor logos keyed by sponsor id. */
const SPONSOR_LOGOS: Record<string, string> = {
  dominos: "/assets/sponsors/dominos_logo.png",
  "quarks-tech": "/assets/sponsors/quarks_logo.png",
  krafton: "/assets/sponsors/krafton_logo.png",
  unstop: "/assets/sponsors/unstop_logo.svg",
  "union-bank": "/assets/sponsors/union_bank_logo.svg",
  "canara-bank": "/assets/sponsors/canara_bank_logo.svg",
  nbcc: "/assets/sponsors/nbcc_logo.png",
  cisb: "/assets/sponsors/cisb_logo.png",
  sistema: "/assets/sponsors/sistema_logo.png",
  "the-kollektor": "/assets/sponsors/kollektor_logo.png",
};

/** Per-brand visual theme overrides for the card frame and glow. */
const BRAND_THEMES: Record<
  string,
  { glow: string; accent: string; frameBg: string; frameBorder: string; tag: string }
> = {
  "quarks-tech": {
    glow: "rgba(43, 182, 115, 0.55)",
    accent: "#2bb673",
    frameBg: "linear-gradient(140deg, #07171e 0%, #0d2830 50%, #081a20 100%)",
    frameBorder: "rgba(43, 182, 115, 0.35)",
    tag: "TITLE TECH PARTNER · UDGAM '26",
  },
  krafton: {
    glow: "rgba(243, 132, 43, 0.45)",
    accent: "#f3842b",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #f7f9fa 100%)",
    frameBorder: "rgba(243, 132, 43, 0.3)",
    tag: "OFFICIAL GAMING PARTNER · UDGAM '26",
  },
  unstop: {
    glow: "rgba(28, 73, 128, 0.45)",
    accent: "#1c4980",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #f0f4f9 100%)",
    frameBorder: "rgba(28, 73, 128, 0.3)",
    tag: "FREE FIRE & EFOOTBALL PARTNER · UDGAM '26",
  },
  dominos: {
    glow: "rgba(227, 24, 55, 0.45)",
    accent: "#e31837",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #f4f7fb 100%)",
    frameBorder: "rgba(0, 100, 145, 0.2)",
    tag: "OFFICIAL FOOD PARTNER · UDGAM '26",
  },
  "union-bank": {
    glow: "rgba(200, 16, 46, 0.4)",
    accent: "#c8102e",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #fdf2f4 100%)",
    frameBorder: "rgba(200, 16, 46, 0.25)",
    tag: "OFFICIAL CASH SPONSOR · UDGAM '26",
  },
  "canara-bank": {
    glow: "rgba(0, 102, 178, 0.4)",
    accent: "#0066b2",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #f0f7ff 100%)",
    frameBorder: "rgba(0, 102, 178, 0.25)",
    tag: "OFFICIAL CASH SPONSOR · UDGAM '26",
  },
  nbcc: {
    glow: "rgba(0, 75, 135, 0.4)",
    accent: "#004b87",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #f4f7fb 100%)",
    frameBorder: "rgba(0, 75, 135, 0.25)",
    tag: "OFFICIAL CASH SPONSOR · UDGAM '26",
  },
  cisb: {
    glow: "rgba(244, 170, 25, 0.45)",
    accent: "#f4aa19",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #fffbf2 100%)",
    frameBorder: "rgba(244, 170, 25, 0.3)",
    tag: "OFFICIAL CASH SPONSOR · UDGAM '26",
  },
  sistema: {
    glow: "rgba(8, 77, 86, 0.45)",
    accent: "#084d56",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #f0f7f8 100%)",
    frameBorder: "rgba(8, 77, 86, 0.25)",
    tag: "OFFICIAL CASH SPONSOR · UDGAM '26",
  },
  "the-kollektor": {
    glow: "rgba(212, 175, 55, 0.45)",
    accent: "#d4af37",
    frameBg: "linear-gradient(140deg, #ffffff 0%, #fbf9f2 100%)",
    frameBorder: "rgba(212, 175, 55, 0.3)",
    tag: "OFFICIAL CASH SPONSOR · UDGAM '26",
  },
};

const MAX_ROTATE_X = 14;
const MAX_ROTATE_Y = 12;

const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v: number, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number) =>
  round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

// ---------------------------------------------------------------------------
// SponsorsBackdrop
// ---------------------------------------------------------------------------

/**
 * Fixed single background locked to the upper blossom sky & flowers.
 * Stays permanently in place throughout the whole page (no scroll shifting),
 * with subtle mouse parallax and drifting sakura petals.
 */
function SponsorsBackdrop() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let frame = 0;

    const update = () => {
      frame = 0;
      if (finePointer && !reduced) {
        pointer.x += (pointer.tx - pointer.x) * 0.08;
        pointer.y += (pointer.ty - pointer.y) * 0.08;
        stage.style.setProperty("--mx", pointer.x.toFixed(4));
        stage.style.setProperty("--my", pointer.y.toFixed(4));
        if (Math.abs(pointer.tx - pointer.x) > 0.001 || Math.abs(pointer.ty - pointer.y) > 0.001)
          schedule();
      }
    };

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };

    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      if (finePointer) window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div className="sponsors-backdrop" ref={stageRef} aria-hidden="true">
      <div className="sb-world">
        <picture>
          <source media="(min-width: 1024px)" srcSet={`${PANORAMA}-2560.webp`} />
          <img
            src={`${PANORAMA}-1280.webp`}
            alt=""
            className="sb-panorama"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div className="sb-veil" />
      </div>
      <div className="sb-petals">
        {PETALS.map((style, i) => (
          <span key={i} className="sb-petal" style={style} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SponsorPassCard
// ---------------------------------------------------------------------------

interface SponsorPassCardProps {
  sponsor: Sponsor;
  tierLabel: string;
  tierColor: string;
  categoryIcon?: string;
  categoryLabel?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
}

function SponsorPassCard({
  sponsor,
  tierLabel,
  tierColor,
  categoryIcon,
  categoryLabel,
  enableTilt = true,
  enableMobileTilt = true,
}: SponsorPassCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const brand = BRAND_THEMES[sponsor.id] ?? {
    glow: "rgba(245, 183, 41, 0.45)",
    accent: tierColor,
    frameBg: "oklch(0.96 0.02 230)",
    frameBorder: "var(--border)",
    tag: `${tierLabel.toUpperCase()} · UDGAM '26`,
  };

  const logo = SPONSOR_LOGOS[sponsor.id];

  // rAF-based spring physics tilt engine
  const tiltEngine = useMemo(() => {
    if (!enableTilt) return null;

    let rafId: number | null = null;
    let running = false;
    let lastTs = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const DEFAULT_TAU = 0.12;

    const setVarsFromXY = (x: number, y: number) => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;

      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;
      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties: Record<string, string> = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 50) * MAX_ROTATE_X)}deg`,
        "--rotate-y": `${round((centerY / 50) * MAX_ROTATE_Y)}deg`,
      };
      for (const [k, v] of Object.entries(properties)) wrap.style.setProperty(k, v);
    };

    const step = (ts: number) => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1e3;
      lastTs = ts;
      const k = 1 - Math.exp(-dt / DEFAULT_TAU);
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVarsFromXY(currentX, currentY);
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setTarget(x: number, y: number) {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
    };
  }, [enableTilt]);

  // Mobile gyroscope tilt
  useEffect(() => {
    if (!enableMobileTilt || !tiltEngine) return undefined;
    return subscribeTilt((nx, ny) => {
      const shell = shellRef.current;
      if (!shell) return;
      const w = shell.clientWidth;
      const h = shell.clientHeight;
      tiltEngine.setTarget(w * 0.5 + nx * w * 0.45, h * 0.5 + ny * h * 0.45);
    });
  }, [enableMobileTilt, tiltEngine]);

  const handlePointerMove = (e: React.MouseEvent) => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;
    const rect = shell.getBoundingClientRect();
    tiltEngine.setTarget(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handlePointerLeave = () => {
    tiltEngine?.toCenter();
  };

  return (
    <div
      ref={wrapRef}
      className="sponsor-pass-card-wrapper"
      style={useMemo(
        () =>
          cssVars({
            "--behind-glow-color": brand.glow,
            "--tier-accent": brand.accent,
          }),
        [brand],
      )}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <div className="sponsor-behind-glow" aria-hidden="true" />
      <div ref={shellRef} className="sponsor-pass-shell">
        <article className={`sp-card tier-${sponsor.tier}`}>
          {/* Glare overlay */}
          <div className="sp-glare" aria-hidden="true" />

          {/* Decorative art (SVG wave) */}
          <div className="sp-art" aria-hidden="true">
            <svg
              className="sp-art-wave"
              viewBox="0 0 288 90"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0 14 C26 20 38 52 70 56 C110 62 170 40 288 8 L288 90 Z"
                fill="#fbe3e3"
              />
              <path d="M52 62 C110 86 170 60 250 48" stroke="#e08a92" strokeWidth="1" />
            </svg>
          </div>

          {/* Tag */}
          <div className="sp-tag">{brand.tag}</div>

          {/* Showcase frame with logo or fallback */}
          <div
            className="sp-showcase-frame"
            style={{ background: brand.frameBg, borderColor: brand.frameBorder }}
          >
            {logo ? (
              <img
                src={logo}
                alt={`${sponsor.name} official logo`}
                className={`sp-showcase-logo sp-logo-${sponsor.id}`}
                loading="lazy"
              />
            ) : (
              <div className="sp-showcase-fallback">
                <span className="sp-fallback-initials">
                  {sponsor.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="sp-showcase-overlay" aria-hidden="true" />
          </div>

          {/* Title */}
          <h3 className="sp-title">{sponsor.name}</h3>

          {/* Description */}
          <p className="sp-desc">{sponsor.description || ""}</p>

          {/* Website button */}
          {sponsor.website && (
            <a
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="sp-btn"
              style={{ "--btn-accent": brand.accent } as React.CSSProperties}
            >
              <span>Visit Official Website</span>
              <span className="sp-btn-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          )}
        </article>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategorySection
// ---------------------------------------------------------------------------

interface CategorySectionProps {
  category: SponsorCategory;
  sponsors: Sponsor[];
  tierConfig: TierConfig;
}

/** A category section with centered header and symmetrically aligned sponsor cards. */
function CategorySection({ category, sponsors, tierConfig }: CategorySectionProps) {
  const sorted = [...sponsors].sort((a, b) => tierConfig[a.tier].order - tierConfig[b.tier].order);

  return (
    <section className="sponsor-category-section" aria-label={category.label}>
      <div className="sponsor-category-header">
        <h2 className="sponsor-category-title">
          <span>{category.label}</span>
        </h2>
        <p className="sponsor-category-description">{category.description}</p>
      </div>

      <div className="sponsor-category-cards">
        {sorted.length > 0 ? (
          sorted.map((sponsor) => (
            <div key={sponsor.id} className="sponsors-card-slot">
              <SponsorPassCard
                sponsor={sponsor}
                tierLabel={tierConfig[sponsor.tier].label}
                tierColor={tierConfig[sponsor.tier].color}
                categoryLabel={category.shortLabel}
              />
            </div>
          ))
        ) : (
          <div className="sponsor-empty-category">
            <p className="sponsor-empty-text">
              Partners for {category.label} will be announced soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SponsorsPage
// ---------------------------------------------------------------------------

export default function SponsorsPage({ data }: { data: SponsorsData }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const quarks = data.sponsors.find((s) => s.id === "quarks-tech");
  const krafton = data.sponsors.find((s) => s.id === "krafton");
  const unstop = data.sponsors.find((s) => s.id === "unstop");
  const dominos = data.sponsors.find((s) => s.id === "dominos");

  const displayedCategories =
    activeCategory === "all"
      ? data.categories.filter(
          (cat) => cat.id !== "all" && data.sponsors.some((s) => s.categoryId === cat.id),
        )
      : data.categories.filter((cat) => cat.id === activeCategory);

  return (
    <div className="udgam-sponsors sponsors-page-root">
      <SponsorsBackdrop />

      <main className="sponsors-hierarchical-layout">
        {/* Header */}
        <header className="sponsors-page-header">
          <div className="sponsors-header-pill">FESTIVAL PARTNERS</div>
          <h1 className="sponsors-page-title">Our Sponsors</h1>
          <p className="sponsors-page-subtitle">
            Udgam 2K26 is proud to be powered by visionary industry leaders and beloved brands. Meet
            the official partners making the festival possible.
          </p>
        </header>

        {/* Category filter pills */}
        <nav className="sponsors-filters-bar" aria-label="Filter sponsors by category">
          {data.categories.map((cat) => (
            <button
              key={cat.id}
              className={`sponsor-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
            >
              <span>{cat.shortLabel}</span>
            </button>
          ))}
        </nav>

        {/* Featured partners (shown only in "All" view) */}
        {activeCategory === "all" && (quarks || krafton || unstop || dominos) && (
          <section className="sponsors-featured-section" aria-label="Featured Partners">
            <div className="sponsors-section-header">
              <h2 className="sponsors-section-heading">Featured Partners</h2>
              <p className="sponsors-section-sub">
                Official partners leading the technology, gaming, and festival experience
              </p>
            </div>
            <div className="sponsors-pair-row">
              {quarks && (
                <div className="sponsors-card-slot">
                  <SponsorPassCard
                    sponsor={quarks}
                    tierLabel={data.tierConfig[quarks.tier]?.label ?? "Title Sponsor"}
                    tierColor={data.tierConfig[quarks.tier]?.color ?? "#00c8ff"}
                    categoryLabel="Technology"
                  />
                </div>
              )}
              {krafton && (
                <div className="sponsors-card-slot">
                  <SponsorPassCard
                    sponsor={krafton}
                    tierLabel={data.tierConfig[krafton.tier]?.label ?? "Gaming Partner"}
                    tierColor={data.tierConfig[krafton.tier]?.color ?? "#ff5722"}
                    categoryLabel="Gaming"
                  />
                </div>
              )}
              {unstop && (
                <div className="sponsors-card-slot">
                  <SponsorPassCard
                    sponsor={unstop}
                    tierLabel={data.tierConfig[unstop.tier]?.label ?? "Gaming Partner"}
                    tierColor={data.tierConfig[unstop.tier]?.color ?? "#1c4980"}
                    categoryLabel="Gaming & Esports"
                  />
                </div>
              )}
              {dominos && (
                <div className="sponsors-card-slot">
                  <SponsorPassCard
                    sponsor={dominos}
                    tierLabel={data.tierConfig[dominos.tier]?.label ?? "Food Partner"}
                    tierColor={data.tierConfig[dominos.tier]?.color ?? "#e31837"}
                    categoryLabel="Food & Beverages"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Category sections */}
        <div className="sponsors-categories-container">
          {displayedCategories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              sponsors={data.sponsors.filter((s) => s.categoryId === cat.id)}
              tierConfig={data.tierConfig}
            />
          ))}
        </div>
      </main>

      <TiltPrompt />
    </div>
  );
}
