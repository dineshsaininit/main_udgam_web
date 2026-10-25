import { memo, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { cssVars } from "@/lib/css-vars";
import { createSponsorRing, type SponsorRing } from "./sponsorRing";
import {
  CONTACT_EMAIL,
  ORDERED_SPONSORS,
  PACKAGES,
  STATS,
  UDGAM_LOGO,
  type FestStat,
  type PageSponsor,
} from "./sponsorsData";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smoothly scroll to a section on this page instead of changing the route's hash. */
function jumpTo(id: string) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };
}

// Deterministic "random" numbers, so server and client render the same petals.
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const PETALS = Array.from({ length: 26 }, (_, i) =>
  cssVars({
    "--x": `${(rand(i, 1) * 100).toFixed(2)}%`,
    "--size": `${(10 + rand(i, 2) * 14).toFixed(1)}px`,
    "--delay": `${(-rand(i, 3) * 16).toFixed(2)}s`,
    "--dur": `${(11 + rand(i, 4) * 10).toFixed(2)}s`,
    "--sway": `${(2.4 + rand(i, 5) * 2.2).toFixed(2)}s`,
  }),
);

// ---------------------------------------------------------------------------
// Backdrop
// ---------------------------------------------------------------------------

function Backdrop() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__image" />
      <div className="bg__veil" />
      <div className="bg__glow bg__glow--rose" />
      <div className="bg__glow bg__glow--sky" />
      <div className="petals">
        {PETALS.map((style, i) => (
          <span key={i} className="petal" style={style}>
            <span className="petal__inner" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rotating sponsor frame
// ---------------------------------------------------------------------------

// Memoised so the frame's DOM (which the ring engine manages) is never re-rendered by React.
const RingFrame = memo(function RingFrame({ apiRef }: { apiRef: { current: SponsorRing | null } }) {
  const ringRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const center = centerRef.current;
    if (!ring || !center) return undefined;
    const api = createSponsorRing(ring, center, ORDERED_SPONSORS);
    apiRef.current = api;
    return () => {
      api?.destroy();
      apiRef.current = null;
    };
  }, [apiRef]);

  return (
    <div className="sp-ring" ref={ringRef} role="list" aria-label="Sponsor logos">
      <div className="sp-ring__center" ref={centerRef} aria-hidden="true">
        <img
          className="sp-ring__logo"
          src={UDGAM_LOGO}
          alt=""
          width={1100}
          height={692}
          decoding="async"
        />
      </div>
    </div>
  );
});

function Showcase() {
  const apiRef = useRef<SponsorRing | null>(null);
  const [paused, setPaused] = useState(false);

  const togglePause = () => {
    const next = apiRef.current ? apiRef.current.toggle() : !paused;
    setPaused(next);
  };

  return (
    <section className="section showcase-section" aria-label="Sponsor logo showcase">
      <div className={`showcase${paused ? " is-paused" : ""}`}>
        <span className="showcase__corner showcase__corner--tl" aria-hidden="true">
          ✿
        </span>
        <div className="showcase__head">
          <p className="showcase__label">Proudly partnered with</p>
          <div className="showcase__tools">
            <button
              className="showcase__btn"
              type="button"
              aria-pressed={paused}
              aria-label={paused ? "Resume sliding" : "Pause sliding"}
              onClick={togglePause}
            >
              <svg
                className="icon-pause"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
              <svg
                className="icon-play"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="showcase__body">
          <RingFrame apiRef={apiRef} />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// All partners
// ---------------------------------------------------------------------------

function PartnerTile({ sponsor }: { sponsor: PageSponsor }) {
  return (
    <article className={`tile${sponsor.dark ? " tile--dark" : ""}`}>
      <div className="tile__logo">
        <img src={sponsor.logo} alt={`${sponsor.name} logo`} loading="lazy" decoding="async" />
      </div>
      <div className="tile__meta">
        <h3 className="tile__name">{sponsor.name}</h3>
      </div>
      {sponsor.url && (
        <a
          className="btn btn--primary btn--sm tile__link"
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
        >
          Visit Website <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}

function AllPartners() {
  const categories = useMemo(
    () => ["All", ...new Set(ORDERED_SPONSORS.map((s) => s.category))],
    [],
  );
  const [active, setActive] = useState("All");
  const shown = ORDERED_SPONSORS.filter((s) => active === "All" || s.category === active);

  return (
    <section className="section" id="partners">
      <div className="section__head">
        <h2 className="section-title">
          <span>All Partners</span>
        </h2>
      </div>
      <div className="filters" role="tablist" aria-label="Filter sponsors by category">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active === cat}
            onClick={() => setActive(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid">
        {shown.map((s) => (
          <PartnerTile key={s.name} sponsor={s} />
        ))}
        {shown.length === 0 && <p className="grid__empty">No partners in this category yet.</p>}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Why partner: stats
// ---------------------------------------------------------------------------

const formatStat = (st: FestStat, value: number) =>
  (st.short && value >= st.value ? st.short : Math.round(value).toLocaleString("en-IN")) +
  st.suffix;

function WhyPartner() {
  const hostRef = useRef<HTMLDivElement>(null);
  // The server render shows the final numbers; on the client they count up when scrolled into view.
  const [progress, setProgress] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion() || !("IntersectionObserver" in window)) return undefined;
    if (host.getBoundingClientRect().top < window.innerHeight) return undefined; // already on screen

    setVisible(false);
    setProgress(0);
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setVisible(true);
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / 1400);
          setProgress(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(host);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section-title">
          <span>Why Partner With Udgam</span>
        </h2>
        <p className="section-sub">
          Three days of music, art, culture and technology on a campus full of young, engaged
          audiences.
        </p>
      </div>
      <div className="stats" ref={hostRef}>
        {STATS.map((st, i) => (
          <div
            key={st.label}
            className={`stat glass reveal${visible ? " is-visible" : ""}`}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="stat__value">{formatStat(st, st.value * progress)}</div>
            <div className="stat__label">{st.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Enquiry form
// ---------------------------------------------------------------------------

const REQUIRED = ["name", "org", "email"] as const;

function Enquiry() {
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<{ text: string; kind: "" | "is-success" | "is-error" }>({
    text: "Opens your email app with the details pre-filled.",
    kind: "",
  });

  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Sponsorship enquiry — Udgam 2K26")}`;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const bad = new Set<string>();
    for (const name of REQUIRED) {
      const input = form.elements.namedItem(name) as HTMLInputElement | null;
      if (!input || !input.checkValidity() || input.value.trim() === "") bad.add(name);
    }
    setInvalid(bad);
    if (bad.size) {
      setNote({
        text: "Please fill in your name, organisation and a valid email.",
        kind: "is-error",
      });
      return;
    }
    const d = new FormData(form);
    const get = (k: string) => String(d.get(k) ?? "").trim();
    const pkg = PACKAGES.find((p) => p.key === get("tier"))?.name ?? "Custom package";
    const subject = `Sponsorship enquiry — ${get("org")} × Udgam 2K26 (${pkg})`;
    const body = [
      "Hello Udgam team,",
      "",
      `Name: ${get("name")}`,
      `Organisation: ${get("org")}`,
      `Email: ${get("email")}`,
      `Interested in: ${pkg}`,
      "",
      get("message") || "(no message)",
      "",
      "— Sent from the Udgam 2K26 sponsors page",
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNote({
      text: `Opening your email app… if nothing happens, write to us directly at ${CONTACT_EMAIL}`,
      kind: "is-success",
    });
  };

  const field = (name: string) => `field${invalid.has(name) ? " is-invalid" : ""}`;

  return (
    <section className="section cta" id="partner">
      <div className="cta__card glass">
        <div className="cta__copy">
          <span className="kicker">Partner With Us</span>
          <h2 className="title-gradient">Let your brand bloom at Udgam 2K26</h2>
          <p>
            Tell us a little about your organisation and the kind of partnership you have in mind.
            Our sponsorship team will get back to you with a tailored proposal and the official
            brochure.
          </p>
          <ul className="cta__points">
            <li>Custom packages for every budget</li>
            <li>Co-branded events and stalls</li>
            <li>Clear deliverables and post-fest report</li>
          </ul>
          <a className="cta__mail" href={mailHref}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            <span>{CONTACT_EMAIL}</span>
          </a>
        </div>

        <form className="cta__form" noValidate onSubmit={onSubmit}>
          <div className={field("name")}>
            <label htmlFor="sp-name">Your name</label>
            <input
              id="sp-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Adarsh"
            />
          </div>
          <div className={field("org")}>
            <label htmlFor="sp-org">Organisation</label>
            <input
              id="sp-org"
              name="org"
              type="text"
              autoComplete="organization"
              required
              placeholder="Blossom Pvt. Ltd."
            />
          </div>
          <div className={field("email")}>
            <label htmlFor="sp-email">Work email</label>
            <input
              id="sp-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
            />
          </div>
          <div className="field">
            <label htmlFor="sp-tier">Interested in</label>
            <select id="sp-tier" name="tier" defaultValue={PACKAGES[0].key}>
              {PACKAGES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field field--full">
            <label htmlFor="sp-msg">Message</label>
            <textarea
              id="sp-msg"
              name="message"
              rows={4}
              placeholder="Tell us about your goals for Udgam 2K26…"
            />
          </div>
          <div className="field field--full cta__actions">
            <button className="btn btn--primary" type="submit">
              Send Enquiry <span aria-hidden="true">↗</span>
            </button>
            <p className={`cta__note${note.kind ? ` ${note.kind}` : ""}`} role="status">
              {note.text}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SponsorsPage() {
  return (
    <div className="udgam-sponsors">
      <Backdrop />
      <main>
        <section className="hero">
          <span className="kicker">Festival Partners</span>
          <h1 className="title-gradient">Our Sponsors</h1>
          <p className="lede">
            Udgam 2K26 is proud to be powered by visionary industry leaders and beloved brands. Meet
            the official partners making the festival possible, and discover how your brand can
            bloom with us.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#partner" onClick={jumpTo("partner")}>
              Become a Sponsor <span aria-hidden="true">✿</span>
            </a>
            <a className="btn btn--ghost" href="#partners" onClick={jumpTo("partners")}>
              Meet the Partners
            </a>
          </div>
        </section>

        <Showcase />
        <AllPartners />
        <WhyPartner />
        <Enquiry />
      </main>
    </div>
  );
}
