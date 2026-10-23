import { createServerFn } from "@tanstack/react-start";

// Sponsor data for the sponsors page. Static for now; this is where a database plugs in.

export const sponsorCategories = [
  {
    id: "all",
    label: "All Sponsors",
    shortLabel: "All",
    icon: "",
    description: "Every brand and partner that makes Udgam 2026 possible.",
  },
  {
    id: "tech",
    label: "Technology",
    shortLabel: "Technology",
    icon: "",
    description:
      "Visionary tech leaders powering hackathons, stage production, and digital infrastructure.",
  },
  {
    id: "gaming",
    label: "Gaming & Esports",
    shortLabel: "Gaming & Esports",
    icon: "",
    description:
      "Official gaming and esports partners powering championships, Free Fire, eFootball, BGMI, and Real Cricket tournaments at Udgam 2026.",
  },
  {
    id: "cash",
    label: "Cash Sponsors",
    shortLabel: "Cash Sponsors",
    icon: "",
    description:
      "Valued institutional, banking, infrastructure, and corporate partners providing vital cash sponsorship for Udgam 2026.",
  },
  {
    id: "food",
    label: "Food & Beverages",
    shortLabel: "Food & Drinks",
    icon: "",
    description:
      "Culinary partners keeping festival delegates and attendees energized throughout Udgam.",
  },
];

export const sponsors = [
  {
    id: "quarks-tech",
    name: "Quarks Technosoft",
    categoryId: "tech",
    tier: "title",
    logo: "/assets/sponsors/quarks_logo.png",
    website: "https://www.qtsolv.com",
    description:
      "Title technology partner powering the digital experience, hackathons, and campus tech infrastructure.",
  },
  {
    id: "krafton",
    name: "Krafton",
    categoryId: "gaming",
    tier: "gaming",
    logo: "/assets/sponsors/krafton_logo.png",
    website: "https://krafton.in",
    description:
      "Official gaming partner for BGMI (₹12,000 prize pool) and Real Cricket (₹3,000 prize pool) tournaments at Udgam 2K26.",
  },
  {
    id: "unstop",
    name: "Unstop",
    categoryId: "gaming",
    tier: "gaming",
    logo: "/assets/sponsors/unstop_logo.svg",
    website: "https://unstop.com",
    description:
      "Official esports partner and platform powering Free Fire and eFootball championships at Udgam 2K26.",
  },
  {
    id: "dominos",
    name: "Domino's Pizza",
    categoryId: "food",
    tier: "gold",
    logo: "/assets/sponsors/dominos_logo.png",
    website: "https://www.dominos.co.in",
    description:
      "Official food partner for Udgam 2K26 — keeping the fest fuelled with hot pizza, sides, and refreshments.",
  },
  {
    id: "union-bank",
    name: "Union Bank of India",
    categoryId: "cash",
    tier: "cash",
    logo: "/assets/sponsors/union_bank_logo.svg",
    website: "https://www.unionbankofindia.co.in",
    description:
      "Official cash sponsor and premier public sector banking partner supporting cultural vitality and student excellence at Udgam 2K26.",
  },
  {
    id: "canara-bank",
    name: "Canara Bank",
    categoryId: "cash",
    tier: "cash",
    logo: "/assets/sponsors/canara_bank_logo.svg",
    website: "https://canarabank.com",
    description:
      "Official cash sponsor and leading financial institution empowering campus youth initiatives and festivities at Udgam 2K26.",
  },
  {
    id: "nbcc",
    name: "NBCC (India) Limited",
    categoryId: "cash",
    tier: "cash",
    logo: "/assets/sponsors/nbcc_logo.png",
    website: "https://www.nbccindia.in",
    description:
      "Official cash sponsor and Navratna CPSE enterprise fostering innovation, infrastructure, and technical brilliance at Udgam 2K26.",
  },
  {
    id: "cisb",
    name: "CISB Services Ltd.",
    categoryId: "cash",
    tier: "cash",
    logo: "/assets/sponsors/cisb_logo.png",
    website: "https://cisb.co.in",
    description:
      "Official cash sponsor and comprehensive security & facility management partner supporting seamless festival operations at Udgam 2K26.",
  },
  {
    id: "sistema",
    name: "Sistema Smart Technologies Ltd.",
    categoryId: "cash",
    tier: "cash",
    logo: "/assets/sponsors/sistema_logo.png",
    website: "https://sistema.com",
    description:
      "Official cash sponsor delivering smart technological solutions, digital capabilities, and festival enablement at Udgam 2K26.",
  },
  {
    id: "the-kollektor",
    name: "The Kollektor",
    categoryId: "cash",
    tier: "cash",
    logo: "/assets/sponsors/kollektor_logo.png",
    website: "https://thekollektor.com",
    description:
      "Official cash sponsor and premier merchandise & collectibles destination fueling youth pop culture and gaming fandom at Udgam 2K26.",
  },
];

export const tierConfig: Record<string, { label: string; color: string; order: number }> = {
  title: { label: "Title Sponsor", color: "#FFD700", order: 0 },
  platinum: { label: "Platinum Sponsor", color: "#E5E4E2", order: 1 },
  gaming: { label: "Gaming Partner", color: "#FF5722", order: 2 },
  gold: { label: "Gold Sponsor", color: "#F5B729", order: 3 },
  silver: { label: "Silver Sponsor", color: "#C0C0C0", order: 4 },
  bronze: { label: "Bronze Sponsor", color: "#CD7F32", order: 5 },
  cash: { label: "Cash Sponsor", color: "#10B981", order: 6 },
};

export const getSponsors = createServerFn({ method: "GET" }).handler(async () => ({
  categories: sponsorCategories,
  sponsors,
  tierConfig,
}));
