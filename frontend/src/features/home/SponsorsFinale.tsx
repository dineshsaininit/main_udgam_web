import { Link } from "@tanstack/react-router";
import { sponsors, tierConfig } from "@/lib/sponsors.functions";

type Sponsor = (typeof sponsors)[number];

// The title sponsor (Quarks) already has its own billboard in the 3D scene; this closing banner
// thanks everyone else. Two rows glide in opposite directions; hover pauses them.
const others = sponsors.filter((s) => s.tier !== "title");
const half = Math.ceil(others.length / 2);
const rows = [others.slice(0, half), others.slice(half)];
// logos whose image file has wide empty margins get a taller box, so they match the others
const TALL_LOGOS = new Set(["dominos"]);

function SponsorTile({ sponsor, hidden }: { sponsor: Sponsor; hidden?: boolean }) {
  const tier = tierConfig[sponsor.tier];
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="sponsor-tile group flex h-[120px] w-[210px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-5 shadow-[0_8px_30px_rgba(216,27,75,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(216,27,75,0.28)] sm:w-[240px]"
    >
      <img
        src={sponsor.logo}
        alt={hidden ? "" : sponsor.name}
        loading="lazy"
        className={`${TALL_LOGOS.has(sponsor.id) ? "h-[76px] -my-3" : "h-12"} w-full object-contain transition duration-300 group-hover:scale-105`}
      />
      <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#7a1c3e] uppercase">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: tier?.color ?? "#d81b4b" }}
        />
        {tier?.label ?? "Partner"}
      </span>
    </a>
  );
}

export function SponsorsFinale() {
  return (
    <section className="pointer-events-auto relative px-4 pt-10 pb-28 sm:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/50 bg-white/30 py-10 shadow-[0_20px_60px_rgba(122,28,62,0.18)] backdrop-blur-xl sm:py-14">
        <div className="px-6 text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] text-[#d81b4b] uppercase">
            Udgam 2K26 is made possible by
          </p>
          <h2
            className="mt-2 font-['Outfit',sans-serif] text-4xl font-black tracking-tight sm:text-5xl"
            style={{
              background: "linear-gradient(180deg, #7a1c3e 0%, #d81b4b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Our Sponsors &amp; Partners
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {rows.map((row, i) => (
            <div key={i} className="sponsor-marquee">
              <div
                className={`sponsor-track ${i % 2 ? "reverse" : ""}`}
                style={{ "--sponsor-duration": `${row.length * 7}s` } as React.CSSProperties}
              >
                {/* the list twice, so the loop is seamless; the copy is hidden from screen readers */}
                {row.map((s) => (
                  <SponsorTile key={s.id} sponsor={s} />
                ))}
                {row.map((s) => (
                  <SponsorTile key={`${s.id}-copy`} sponsor={s} hidden />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Link
            to="/sponsors"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#d81b4b] to-[#ff5c87] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(216,27,75,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(216,27,75,0.45)]"
          >
            Meet all our sponsors <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
