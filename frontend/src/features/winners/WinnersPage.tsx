import { WINNER_CATEGORIES, type WinnerCategory, type Winner } from "./winnersData";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MEDAL: Record<1 | 2 | 3, { emoji: string; label: string; className: string }> = {
  1: { emoji: "🥇", label: "1st Place", className: "medal--gold" },
  2: { emoji: "🥈", label: "2nd Place", className: "medal--silver" },
  3: { emoji: "🥉", label: "3rd Place", className: "medal--bronze" },
};

// ---------------------------------------------------------------------------
// Backdrop (reuses the same cherry-blossom style as other pages)
// ---------------------------------------------------------------------------

function Backdrop() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__image" />
      <div className="bg__veil" />
      <div className="bg__glow bg__glow--rose" />
      <div className="bg__glow bg__glow--sky" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Winner card
// ---------------------------------------------------------------------------

function WinnerCard({ winner }: { winner: Winner }) {
  const medal = MEDAL[winner.position];
  return (
    <div className={`winner-card glass ${medal.className}`}>
      <span className="winner-card__medal" aria-label={medal.label}>
        {medal.emoji}
      </span>
      <div className="winner-card__info">
        <span className="winner-card__position">{medal.label}</span>
        <h3 className="winner-card__name">{winner.name}</h3>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category section
// ---------------------------------------------------------------------------

function CategorySection({ category }: { category: WinnerCategory }) {
  return (
    <section className="section">
      <div className="section__head">
        <h2 className="section-title">
          <span>
            {category.emoji} {category.title}
          </span>
        </h2>
      </div>
      <div className="winners-grid">
        {category.winners.map((w) => (
          <WinnerCard key={`${category.title}-${w.position}`} winner={w} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WinnersPage() {
  return (
    <div className="udgam-winners">
      <Backdrop />
      <main>
        <section className="hero">
          <span className="kicker">Udgam 2K26</span>
          <h1 className="title-gradient">Competition Winners</h1>
          <p className="lede">
            Congratulations to all the talented performers who lit up the stage at Udgam 2K26! Here
            are the champions of this year's competitions.
          </p>
        </section>

        {WINNER_CATEGORIES.map((cat) => (
          <CategorySection key={cat.title} category={cat} />
        ))}
      </main>
    </div>
  );
}
