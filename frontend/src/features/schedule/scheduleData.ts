// Udgam 2K26 event flow, transcribed from the organisers' "Event flow" sheet.
// Times are 24h "HH:MM" in IST. An end earlier than its start runs past midnight.

export type ScheduleView = "day" | "night";
export type Period = "morning" | "afternoon" | "evening" | "night";

export interface ScheduleEvent {
  name: string;
  start: string;
  end: string;
  venue: string;
}

export interface FestDay {
  day: number;
  /** YYYY-MM-DD */
  date: string;
}

export const FEST_DAYS: FestDay[] = [
  { day: 0, date: "2026-10-29" },
  { day: 1, date: "2026-10-30" },
  { day: 2, date: "2026-10-31" },
  { day: 3, date: "2026-11-01" },
];

export const DAY_SCHEDULE: Record<number, ScheduleEvent[]> = {
  0: [
    { name: "Wall Painting", start: "14:00", end: "17:30", venue: "Campus" },
    { name: "BGMI", start: "14:00", end: "17:00", venue: "Shed 2" },
    { name: "Real Cricket", start: "16:00", end: "17:00", venue: "Shed 2" },
    { name: "Food Fiesta", start: "14:00", end: "17:00", venue: "Girls' Mess + Civil Dept." },
    { name: "Housie Bingo", start: "17:00", end: "18:00", venue: "Basketball Ground" },
    { name: "Singing Competition", start: "17:00", end: "18:15", venue: "MPH" },
    { name: "MLBB", start: "17:00", end: "18:45", venue: "Shed 2" },
    { name: "Dance Competition", start: "18:15", end: "19:30", venue: "MPH" },
    { name: "Free Fire", start: "18:45", end: "20:15", venue: "Shed 2" },
  ],
  1: [
    { name: "Rangoli", start: "09:00", end: "10:30", venue: "Campus" },
    { name: "BGMI", start: "09:00", end: "12:00", venue: "MPH" },
    { name: "Real Cricket", start: "11:00", end: "12:00", venue: "MPH" },
    { name: "E-Football", start: "09:00", end: "10:30", venue: "Shed 2" },
    { name: "Balloon Burst", start: "11:00", end: "12:15", venue: "Basketball Ground" },
    { name: "Three Leg Tie", start: "12:15", end: "13:30", venue: "Basketball Ground" },
    {
      name: "Spoil the T-Shirt",
      start: "13:30",
      end: "16:30",
      venue: "Basketball + Volleyball Ground",
    },
    { name: "Guess the Juice", start: "15:30", end: "16:30", venue: "Shed 2" },
  ],
  2: [
    {
      name: "Food Eating Challenge",
      start: "10:30",
      end: "11:30",
      venue: "Civil Dept. / Girls' Mess",
    },
    { name: "Dumb Charades", start: "11:30", end: "12:30", venue: "MPH" },
    { name: "Spoil the T-Shirt", start: "12:30", end: "14:00", venue: "Basketball Ground" },
    { name: "Free Fire", start: "14:00", end: "15:30", venue: "Shed 2" },
    { name: "Squid Game", start: "14:30", end: "16:30", venue: "Basketball Ground" },
  ],
  3: [
    { name: "IPL Auction", start: "09:00", end: "11:00", venue: "Football Ground" },
    { name: "Cup Pong", start: "10:00", end: "11:00", venue: "Basketball Ground" },
    { name: "String Maze", start: "11:00", end: "12:30", venue: "Shed 2" },
    { name: "Antakshari", start: "11:00", end: "12:00", venue: "MPH" },
    {
      name: "Balloon Between Two People",
      start: "12:00",
      end: "13:30",
      venue: "Basketball Ground",
    },
    { name: "Treasure Hunt", start: "13:30", end: "15:30", venue: "MPH" },
    { name: "Musical Chair", start: "15:30", end: "16:30", venue: "Volleyball Ground" },
  ],
};

export interface NightHighlight {
  name: string;
  tag: string;
  blurb: string;
  /** which animated artwork the card draws (no photos of people) */
  art: NightArt;
}

export type NightArt = "concert" | "band" | "kathak" | "folk" | "runway" | "dj";

// The main acts from the "UDGAM 2k26 Night Schedule" sheet. The night page shows these
// highlights only, not the minute-by-minute running order. The first one is the headliner.
export const NIGHT_HIGHLIGHTS: NightHighlight[] = [
  {
    name: "Adnan's Live",
    tag: "Headliner",
    blurb: "The headline live set of Udgam 2K26. Lights down, phones up, voices loud.",
    art: "concert",
  },
  {
    name: "The Mirroz",
    tag: "Live Band",
    blurb: "A full band on the main stage: big riffs, bigger choruses.",
    art: "band",
  },
  {
    name: "Pallabi De",
    tag: "Kathak",
    blurb: "Classical Kathak: spins, footwork and storytelling under the stage lights.",
    art: "kathak",
  },
  {
    name: "Manoj Rai & Group",
    tag: "Live Music",
    blurb: "Manoj Rai and Group open Udgam's nights.",
    art: "folk",
  },
  {
    name: "Ramp Walk",
    tag: "Fashion",
    blurb: "Udgam's runway, where tradition walks into the spotlight.",
    art: "runway",
  },
  {
    name: "DJ Night",
    tag: "Two Nights",
    blurb: "Two DJ nights to close out the fest. Bring your loudest friends.",
    art: "dj",
  },
];

export function toMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Start and end in minutes from the day's midnight; an end past midnight is pushed into the next day. */
export function spanOf(event: ScheduleEvent): [number, number] {
  const start = toMinutes(event.start);
  let end = toMinutes(event.end);
  if (end <= start) end += 24 * 60;
  return [start, end];
}

export function periodOf(minutes: number): Period {
  const h = (minutes % (24 * 60)) / 60;
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 16) return "afternoon";
  if (h < 19) return "evening";
  return "night";
}

export function formatTime(minutes: number): string {
  const m = minutes % (24 * 60);
  const h = Math.floor(m / 60);
  const suffix = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m % 60).padStart(2, "0")} ${suffix}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const IST_OFFSET = "+05:30";
const DAY_MS = 24 * 60 * 60 * 1000;

export function dayStartMs(date: string): number {
  return Date.parse(`${date}T00:00:00${IST_OFFSET}`);
}

/** The fest day whose IST calendar date contains `now`, if any. */
export function festDayAt(now: number): number | undefined {
  return FEST_DAYS.find((d) => now >= dayStartMs(d.date) && now < dayStartMs(d.date) + DAY_MS)?.day;
}

export function sortedEvents(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort((a, b) => {
    const [as, ae] = spanOf(a);
    const [bs, be] = spanOf(b);
    return as - bs || ae - be;
  });
}
