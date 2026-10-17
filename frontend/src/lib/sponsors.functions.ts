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
    id: "dominos",
    name: "Domino's Pizza",
    categoryId: "food",
    tier: "gold",
    logo: "/assets/sponsors/dominos_logo.png",
    website: "https://www.dominos.co.in",
    description:
      "Official food partner for Udgam 2K26 — keeping the fest fuelled with hot pizza, sides, and refreshments.",
  },
];

export const tierConfig: Record<string, { label: string; color: string; order: number }> = {
  title: { label: "Title Sponsor", color: "#FFD700", order: 0 },
  platinum: { label: "Platinum Sponsor", color: "#E5E4E2", order: 1 },
  gold: { label: "Gold Sponsor", color: "#F5B729", order: 2 },
  silver: { label: "Silver Sponsor", color: "#C0C0C0", order: 3 },
  bronze: { label: "Bronze Sponsor", color: "#CD7F32", order: 4 },
};

export const getSponsors = createServerFn({ method: "GET" }).handler(async () => ({
  categories: sponsorCategories,
  sponsors,
  tierConfig,
}));
