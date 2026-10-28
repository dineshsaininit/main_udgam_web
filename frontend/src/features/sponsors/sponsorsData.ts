// Content for the Sponsors page (/sponsors).
//
// To add a sponsor: put its logo in public/assets/sponsors/logos/ (PNG) and add one entry to
// SPONSORS. The rotating frame, the All Partners grid and the filters all update from this list.
//
// The home page's sponsor banner reads its own list from src/lib/sponsors.functions.ts, so editing
// this file only changes the Sponsors page.

export interface PageSponsor {
  name: string;
  /** Role, used for accessibility labels; not shown on the page. */
  tag: string;
  /** Filter group in "All Partners". */
  category: string;
  /** Path under /public. */
  logo: string;
  /** Official website; leave "" to show the logo without a link (listed after linked sponsors). */
  url: string;
  /** Light logo that needs a dark panel behind it. */
  dark?: boolean;
}

const LOGOS = "/assets/sponsors/logos";

export const CONTACT_EMAIL = "udgam@nitsikkim.ac.in";

export const UDGAM_LOGO = "/assets/sponsors/udgam_logo.webp";

export const SPONSORS: PageSponsor[] = [
  {
    name: "Quarks Technosoft",
    tag: "Title Tech Partner",
    category: "Technology",
    logo: `${LOGOS}/quarks_logo.png`,
    url: "https://www.qtsolv.com/",
    dark: true,
  },
  {
    name: "Domino's Pizza",
    tag: "Official Food Partner",
    category: "Food & Drinks",
    logo: `${LOGOS}/dominos_logo.png`,
    url: "https://www.dominos.co.in/",
  },
  {
    name: "Union Bank of India",
    tag: "Banking Partner",
    category: "Banking & Finance",
    logo: `${LOGOS}/union_bank_logo.png`,
    url: "https://www.unionbankofindia.bank.in/en/home",
  },
  {
    name: "Canara Bank",
    tag: "Banking Partner",
    category: "Banking & Finance",
    logo: `${LOGOS}/canara_bank_logo.png`,
    url: "https://www.canarabank.bank.in/",
  },
  {
    name: "NBCC (India) Limited",
    tag: "Sponsor",
    category: "Corporate",
    logo: `${LOGOS}/nbcc_logo.png`,
    url: "https://www.nbccindia.in/",
  },
  {
    name: "CISB",
    tag: "Sponsor",
    category: "Corporate",
    logo: `${LOGOS}/cisb_logo.png`,
    url: "https://cisb.co.in/",
  },
  {
    name: "Sikkim Express",
    tag: "Media Partner",
    category: "Media",
    logo: `${LOGOS}/sikkim_express_logo.png`,
    url: "https://www.sikkimexpress.com/",
  },
  {
    name: "Unstop",
    tag: "E-Gaming Partner",
    category: "E-Gaming",
    logo: `${LOGOS}/unstop_logo.png`,
    url: "https://unstop.com/",
  },
  {
    name: "Krafton India Esports",
    tag: "E-Gaming Partner",
    category: "E-Gaming",
    logo: `${LOGOS}/krafton_india_esports_logo.png`,
    url: "https://kraftonindiaesports.com/",
  },
  {
    name: "Sistema Smart Tech",
    tag: "Sponsor",
    category: "Technology",
    logo: `${LOGOS}/sistema_smart_tech_logo.png`,
    url: "",
  },
  {
    name: "The Kollektor",
    tag: "Sponsor",
    category: "Lifestyle",
    logo: `${LOGOS}/kollektor_logo.png`,
    url: "https://thekollektor.com/",
  },
  {
    name: "Ravongla Star",
    tag: "Hospitality Partner",
    category: "Hospitality",
    logo: `${LOGOS}/ravongla_star_logo.png`,
    url: "https://www.facebook.com/ravongla/",
  },
  {
    name: "The Alnus Ravangla",
    tag: "Hospitality Partner",
    category: "Hospitality",
    logo: `${LOGOS}/alnus_ravangla_logo.png`,
    url: "https://www.facebook.com/thealnus.ravangla/",
  },
  {
    name: "The Waffle Stop",
    tag: "Food Partner",
    category: "Food & Drinks",
    logo: `${LOGOS}/waffle_stop_logo.png`,
    url: "",
  },
];

/** Display order: sponsors with a website first, those without one last (otherwise list order). */
export const ORDERED_SPONSORS: PageSponsor[] = SPONSORS.map((s, i) => ({ s, i }))
  .sort((a, b) => Number(!a.s.url) - Number(!b.s.url) || a.i - b.i)
  .map(({ s }) => s);

export interface FestStat {
  value: number;
  suffix: string;
  label: string;
  /** Shown once the count-up reaches `value`, e.g. "1.5K". */
  short?: string;
}

// Shown in "Why Partner With Udgam". Footfall is confirmed; check the others before launch.
export const STATS: FestStat[] = [
  { value: 3, suffix: "", label: "Days of fest" },
  { value: 40, suffix: "+", label: "Events" },
  { value: 1500, suffix: "", label: "Footfall", short: "1.5K" },
  { value: 25000, suffix: "+", label: "Social reach", short: "25K" },
];

/** Options for "Interested in" on the enquiry form. */
export const PACKAGES = [
  { key: "title", name: "Title Partner" },
  { key: "platinum", name: "Platinum" },
  { key: "gold", name: "Gold" },
  { key: "silver", name: "Silver" },
  { key: "partner", name: "Official Partner" },
  { key: "custom", name: "Something custom" },
] as const;
