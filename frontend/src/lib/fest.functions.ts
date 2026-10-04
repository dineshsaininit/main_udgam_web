import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Backend API for Udgam 2K26 — stubbed data, ready to swap for a database.
const EVENTS = [
  { id: "headliner", title: "Headliner Night", category: "Music", day: 3, blurb: "A starlit concert under the blossoms." },
  { id: "hackathon", title: "Sakura Hack", category: "Tech", day: 1, blurb: "24 hours of building, petals optional." },
  { id: "dance", title: "Petal Dance-Off", category: "Culture", day: 2, blurb: "Crews battle in a ring of falling petals." },
  { id: "art", title: "Lantern Art Walk", category: "Art", day: 2, blurb: "Glowing installations through the grove." },
  { id: "workshop", title: "Makers' Workshops", category: "Tech", day: 1, blurb: "Hands-on sessions with industry mentors." },
  { id: "drama", title: "Whimsy Theatre", category: "Culture", day: 3, blurb: "Fairytale plays reimagined." },
];

const SCHEDULE = [
  { day: 1, label: "Day 1 · Bloom", items: ["Opening Ceremony", "Sakura Hack begins", "Makers' Workshops"] },
  { day: 2, label: "Day 2 · Breeze", items: ["Petal Dance-Off", "Lantern Art Walk", "Food Carnival"] },
  { day: 3, label: "Day 3 · Glow", items: ["Whimsy Theatre", "Prize Ceremony", "Headliner Night"] },
];

export const getEvents = createServerFn({ method: "GET" }).handler(async () => EVENTS);
export const getSchedule = createServerFn({ method: "GET" }).handler(async () => SCHEDULE);

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      name: z.string().trim().min(1).max(100),
      email: z.string().trim().email().max(255),
      message: z.string().trim().min(1).max(1000),
    }).parse(d),
  )
  .handler(async ({ data }) => ({ ok: true, received: data.name }));
