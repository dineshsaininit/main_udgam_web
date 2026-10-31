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
    { name: "Wall Painting", start: "09:00", end: "15:00", venue: "Campus" },
    { name: "Spoil the T-Shirt", start: "10:30", end: "14:30", venue: "Basketball Ground" },
    { name: "Dumb Charades", start: "11:30", end: "12:30", venue: "MPH" },
    {
      name: "Food Eating Challenge",
      start: "12:30",
      end: "13:30",
      venue: "Civil Dept. / Girls' Mess",
    },
    { name: "Free Fire", start: "13:30", end: "15:00", venue: "Shed 2" },
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

export interface NightProgramme {
  night: number;
  /** YYYY-MM-DD */
  date: string;
  theme: string;
  host: string;
  events: ScheduleEvent[];
}

// The evening programme of each night, from the "UDGAM 2k26 Night Schedule" sheet. A night
// gets its own tab under Night (next to Headliners) as soon as it is listed here.
export const NIGHT_PROGRAMMES: NightProgramme[] = [
  {
    night: 1,
    date: "2026-10-30",
    theme: "Cultural Night",
    host: "Mudit Sharma & Anuska Mandal",
    events: [
      { name: "Gathering at the Venue", start: "16:45", end: "17:00", venue: "Football Ground" },
      { name: "Arrival of Guests", start: "17:00", end: "17:10", venue: "Football Ground" },
      {
        name: "Lamp Lighting & Saraswati Vandana",
        start: "17:10",
        end: "17:15",
        venue: "Football Ground",
      },
      {
        name: "Felicitation of the Guest of Honour, Chief Guest and guests by Director Sir, and of Director Sir by DSW",
        start: "17:15",
        end: "17:25",
        venue: "Football Ground",
      },
      {
        name: "Briefing of UDGAM by the UDGAM 2K26 President",
        start: "17:25",
        end: "17:30",
        venue: "Football Ground",
      },
      {
        name: "Inaugural Speech by Honourable Director Sir",
        start: "17:30",
        end: "17:35",
        venue: "Football Ground",
      },
      {
        name: "Student Performance: Nim Deeki Sherpa (Yoga Artistic)",
        start: "17:35",
        end: "17:40",
        venue: "Football Ground",
      },
      { name: "Pallabi De (Kathak)", start: "17:40", end: "19:40", venue: "Football Ground" },
      {
        name: "Speech by the Guest of Honour",
        start: "19:40",
        end: "19:50",
        venue: "Football Ground",
      },
      {
        name: "Speech by the Honourable Chief Guest",
        start: "19:50",
        end: "20:00",
        venue: "Football Ground",
      },
      {
        name: "Dr. Manoj Rai & Reeyaz Band",
        start: "20:00",
        end: "21:30",
        venue: "Football Ground",
      },
    ],
  },
  {
    night: 2,
    date: "2026-10-31",
    theme: "Formal Night",
    host: "Sujal Prasad & Nim Deeki",
    events: [
      { name: "Gathering at the Venue", start: "16:45", end: "17:00", venue: "Football Ground" },
      { name: "Arrival of Guests", start: "17:00", end: "17:10", venue: "Football Ground" },
      {
        name: "Lamp Lighting & Saraswati Vandana",
        start: "17:10",
        end: "17:15",
        venue: "Football Ground",
      },
      {
        name: "Felicitation of Guest of Honour, Chief Guest & guests by Director Sir, and of Director Sir by DSW",
        start: "17:15",
        end: "17:25",
        venue: "Football Ground",
      },
      {
        name: "Briefing of UDGAM by the UDGAM 2K26 President",
        start: "17:25",
        end: "17:30",
        venue: "Football Ground",
      },
      {
        name: "Inaugural Speech by Honourable Director Sir",
        start: "17:30",
        end: "17:35",
        venue: "Football Ground",
      },
      {
        name: "Student Performance: Richa & Group (Dance)",
        start: "17:35",
        end: "17:40",
        venue: "Football Ground",
      },
      {
        name: "Student Performance: Singing Competition Winner",
        start: "17:40",
        end: "17:45",
        venue: "Football Ground",
      },
      {
        name: "Richa Di Performance",
        start: "17:45",
        end: "17:55",
        venue: "Football Ground",
      },
      {
        name: "Student Performance: Dancing Competition Winner",
        start: "17:55",
        end: "18:00",
        venue: "Football Ground",
      },
      {
        name: "Student Performance: Shubham Das (Singing)",
        start: "18:00",
        end: "18:05",
        venue: "Football Ground",
      },
      {
        name: "Speech by the Guest of Honour",
        start: "18:05",
        end: "18:10",
        venue: "Football Ground",
      },
      {
        name: "Speech by the Honourable Chief Guest",
        start: "18:10",
        end: "18:15",
        venue: "Football Ground",
      },
      {
        name: "The Mirrorz (Band Performance)",
        start: "18:15",
        end: "20:15",
        venue: "Football Ground",
      },
      {
        name: "DJ",
        start: "20:15",
        end: "21:45",
        venue: "Football Ground",
      },
    ],
  },
];

export interface NightHighlight {
  name: string;
  tag: string;
  blurb: string;
  /** which animated artwork the card draws (no photos of people) */
  art: NightArt;
}

export type NightArt = "concert" | "band" | "kathak" | "folk" | "runway" | "dj";

// The main acts across all nights, shown on the Headliners tab. The first one is the headliner.
export const NIGHT_HIGHLIGHTS: NightHighlight[] = [
  {
    name: "Adnan's Live",
    tag: "Headliner",
    blurb: "The headline live set of Udgam 2K26. Lights down, phones up, voices loud.",
    art: "concert",
  },
  {
    name: "Mirrorz",
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
    name: "Dr. Manoj Rai & Reeyaz Band",
    tag: "Live Music",
    blurb: "Live music from Dr. Manoj Rai and Reeyaz Band to close the cultural night.",
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
