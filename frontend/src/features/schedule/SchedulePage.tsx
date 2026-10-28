import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Clock, MapPin, MoonStar, Music2, Sparkles, Sun, Sunrise, Sunset } from "lucide-react";
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type PointerEvent,
} from "react";

import mountainImg from "@/assets/distant_mountains_sikkim.webp";
import treeImg from "@/assets/tree1.webp";
import { NightArt } from "./NightArt";
import {
  DAY_SCHEDULE,
  FEST_DAYS,
  NIGHT_HIGHLIGHTS,
  dayStartMs,
  festDayAt,
  formatDuration,
  formatTime,
  periodOf,
  sortedEvents,
  spanOf,
  type NightHighlight,
  type Period,
  type ScheduleEvent,
  type ScheduleView,
} from "./scheduleData";

const PERIODS: Record<
  Period,
  { label: string; hint: string; Icon: ComponentType<{ className?: string }> }
> = {
  morning: { label: "Morning", hint: "Fresh starts before noon", Icon: Sunrise },
  afternoon: { label: "Afternoon", hint: "The midday rush", Icon: Sun },
  evening: { label: "Evening", hint: "Golden hour on campus", Icon: Sunset },
  night: { label: "Night", hint: "After dark", Icon: MoonStar },
};

const NIGHT_SCENE_MINUTES = 21 * 60;

const istDate = (date: string) => new Date(`${date}T12:00:00+05:30`);
const weekday = (date: string) =>
  istDate(date).toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" });
const longDate = (date: string) =>
  istDate(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  });
const shortDate = (date: string) =>
  istDate(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });

/**
 * Phones and tablets: skip the blur in page transitions, which repaints the whole panel
 * every frame. Client-only, so the first render matches the server.
 */
function useLite(): boolean {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (max-width: 768px)");
    const update = () => setLite(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return lite;
}

/** Wall-clock time, client-only so the server render never disagrees with the browser. */
function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export default function SchedulePage({
  view,
  day,
}: {
  view: ScheduleView;
  day: number | undefined;
}) {
  const navigate = useNavigate();
  const now = useNow();
  const lite = useLite();
  const blur = (px: number) => (lite ? {} : { filter: `blur(${px}px)` });
  const festDay = FEST_DAYS.find((d) => d.day === (day ?? 0)) ?? FEST_DAYS[0]!;
  const events = useMemo(() => sortedEvents(DAY_SCHEDULE[festDay.day] ?? []), [festDay.day]);

  // Land on today's fest day when the link didn't name one.
  const autoPicked = useRef(false);
  useEffect(() => {
    if (autoPicked.current || day !== undefined || now === null) return;
    autoPicked.current = true;
    const today = festDayAt(now);
    if (today !== undefined && today !== 0) {
      navigate({
        to: "/schedule",
        search: (prev) => ({ ...prev, day: today }),
        replace: true,
        resetScroll: false,
      });
    }
  }, [day, now, navigate]);

  const firstMinutes = events.length ? spanOf(events[0]!)[0] : NIGHT_SCENE_MINUTES;
  const [sceneMinutes, setSceneMinutes] = useState(firstMinutes);
  useEffect(() => setSceneMinutes(firstMinutes), [festDay.day, firstMinutes]);
  const period = view === "night" ? "night" : periodOf(sceneMinutes);

  const prevDay = useRef(festDay.day);
  const direction = festDay.day >= prevDay.current ? 1 : -1;
  useEffect(() => {
    prevDay.current = festDay.day;
  }, [festDay.day]);

  const bodyRef = useRef<HTMLDivElement>(null);
  const go = (next: { view?: ScheduleView; day?: number }) => {
    navigate({ to: "/schedule", search: (prev) => ({ ...prev, ...next }), resetScroll: false });
    const el = bodyRef.current;
    if (el && el.getBoundingClientRect().top < 0)
      el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className={`sch is-${view}`} data-period={period}>
      <Sky period={period} minutes={sceneMinutes} stage={view === "night"} />

      <section className="sch-hero">
        <motion.p
          className="sch-overline"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          ✿ Udgam 2K26 · {shortDate(FEST_DAYS[0]!.date)} – {shortDate(FEST_DAYS.at(-1)!.date)}
        </motion.p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20, ...blur(8) }}
            animate={{ opacity: 1, y: 0, ...blur(0) }}
            exit={{ opacity: 0, y: -16, ...blur(8) }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="sch-title">{view === "day" ? "Day Schedule" : "Udgam Nights"}</h1>
            <p className="sch-lede">
              {view === "day"
                ? "Four days, every slot. Scroll through a day and watch the Sikkim sky follow the clock."
                : "When the sun sets over the hills, the main stage wakes up. Here's who's taking it."}
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="sch-switch"
          role="tablist"
          aria-label="Schedule type"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {(["day", "night"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              className="sch-switch__btn"
              onClick={() => go({ view: v })}
            >
              {view === v && (
                <motion.span
                  layoutId="sch-switch-pill"
                  className="sch-switch__pill"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <span className="sch-switch__label">
                {v === "day" ? <Sun className="sch-icon" /> : <MoonStar className="sch-icon" />}
                {v === "day" ? "Day" : "Night"}
              </span>
            </button>
          ))}
        </motion.div>
      </section>

      <AnimatePresence mode="wait" initial={false}>
        {view === "day" ? (
          <motion.div
            key="day"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="sch-days" aria-label="Festival days">
              <div className="sch-days__track" role="tablist">
                {FEST_DAYS.map((d) => {
                  const active = d.day === festDay.day;
                  const isToday = now !== null && festDayAt(now) === d.day;
                  return (
                    <button
                      key={d.day}
                      role="tab"
                      aria-selected={active}
                      className="sch-days__btn"
                      onClick={() => go({ day: d.day })}
                    >
                      {active && (
                        <motion.span
                          layoutId="sch-day-pill"
                          className="sch-days__pill"
                          transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                        />
                      )}
                      <span className="sch-days__label">
                        <strong>Day {d.day}</strong>
                        <small>
                          {weekday(d.date)} · {shortDate(d.date)}
                        </small>
                      </span>
                      {isToday && <span className="sch-days__today">Today</span>}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div ref={bodyRef} className="sch-body">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={festDay.day}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({ opacity: 0, x: dir * 60, ...blur(6) }),
                    center: { opacity: 1, x: 0, ...blur(0) },
                    exit: (dir: number) => ({ opacity: 0, x: dir * -60, ...blur(6) }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                >
                  <DayPanel
                    date={festDay.date}
                    dayNumber={festDay.day}
                    events={events}
                    now={now}
                    sceneMinutes={sceneMinutes}
                    onScene={setSceneMinutes}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <SceneChip period={period} minutes={sceneMinutes} />
          </motion.div>
        ) : (
          <motion.div
            key="night"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <NightsShowcase />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function DayPanel({
  date,
  dayNumber,
  events,
  now,
  sceneMinutes,
  onScene,
}: {
  date: string;
  dayNumber: number;
  events: ScheduleEvent[];
  now: number | null;
  sceneMinutes: number;
  onScene: (minutes: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // The card crossing the middle band of the viewport sets the sky's time.
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          setActiveIndex(Number(el.dataset["index"]));
          onScene(Number(el.dataset["start"]));
        }
      },
      { rootMargin: "-42% 0px -48% 0px" },
    );
    root.querySelectorAll("[data-sch-event]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [events, onScene]);

  const groups = useMemo(() => {
    const out: { period: Period; items: { event: ScheduleEvent; index: number }[] }[] = [];
    events.forEach((event, index) => {
      const period = periodOf(spanOf(event)[0]);
      const last = out.at(-1);
      if (last?.period === period) last.items.push({ event, index });
      else out.push({ period, items: [{ event, index }] });
    });
    return out;
  }, [events]);

  const base = dayStartMs(date);
  const first = spanOf(events[0]!)[0];
  const last = Math.max(...events.map((e) => spanOf(e)[1]));

  return (
    <>
      <header className="sch-dayhead">
        <span className="sch-dayhead__num" aria-hidden>
          {dayNumber}
        </span>
        <div>
          <h2>Day {dayNumber}</h2>
          <p>{longDate(date)}</p>
          <div className="sch-dayhead__meta">
            <span>
              <Sparkles className="sch-icon" /> {events.length} events
            </span>
            <span>
              <Clock className="sch-icon" /> {formatTime(first)} – {formatTime(last)}
            </span>
          </div>
        </div>
      </header>

      <DayStrip events={events} sceneMinutes={sceneMinutes} dayNumber={dayNumber} />

      <div ref={listRef} className="sch-timeline">
        {groups.map((group) => {
          const { label, hint, Icon } = PERIODS[group.period];
          return (
            <section key={`${group.period}-${group.items[0]!.index}`} className="sch-period">
              <motion.header
                className="sch-period__head"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5 }}
              >
                <span className="sch-period__dot">
                  <Icon className="sch-icon" />
                </span>
                <div>
                  <h3>{label}</h3>
                  <p>{hint}</p>
                </div>
              </motion.header>

              <ol className="sch-cards">
                {group.items.map(({ event, index }) => {
                  const [start, end] = spanOf(event);
                  const startMs = base + start * 60_000;
                  const endMs = base + end * 60_000;
                  const status =
                    now === null
                      ? "upcoming"
                      : now >= endMs
                        ? "done"
                        : now >= startMs
                          ? "live"
                          : "upcoming";
                  return (
                    <motion.li
                      key={`${event.name}-${event.start}`}
                      id={`sch-ev-${dayNumber}-${index}`}
                      data-sch-event
                      data-index={index}
                      data-start={start}
                      className={`sch-card ${index === activeIndex ? "is-active" : ""} is-${status}`}
                      initial={{ opacity: 0, y: 36, scale: 0.97 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="sch-card__time">
                        <strong>{formatTime(start)}</strong>
                        <span>to {formatTime(end)}</span>
                        <em>{formatDuration(end - start)}</em>
                      </div>
                      <div className="sch-card__body">
                        <h4>{event.name}</h4>
                        <p>
                          <MapPin className="sch-icon" /> {event.venue}
                        </p>
                      </div>
                      {status === "live" && (
                        <span className="sch-card__badge is-live">
                          <i /> Live now
                        </span>
                      )}
                      {status === "done" && <span className="sch-card__badge">Wrapped</span>}
                    </motion.li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </>
  );
}

/** A mini Gantt of the whole day; overlapping events stack into lanes. */
function DayStrip({
  events,
  sceneMinutes,
  dayNumber,
}: {
  events: ScheduleEvent[];
  sceneMinutes: number;
  dayNumber: number;
}) {
  const spans = events.map(spanOf);
  const lo = Math.floor(Math.min(...spans.map((s) => s[0])) / 60) * 60;
  const hi = Math.ceil(Math.max(...spans.map((s) => s[1])) / 60) * 60;
  const pct = (m: number) => ((m - lo) / (hi - lo)) * 100;

  const laneEnds: number[] = [];
  const lanes = spans.map(([s, e]) => {
    let lane = laneEnds.findIndex((end) => end <= s);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = e;
    return lane;
  });

  const hours: number[] = [];
  const step = hi - lo > 8 * 60 ? 120 : 60;
  for (let m = lo; m <= hi; m += step) hours.push(m);

  const jump = (index: number) =>
    document
      .getElementById(`sch-ev-${dayNumber}-${index}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="sch-strip" style={{ "--lanes": laneEnds.length } as CSSProperties}>
      <div className="sch-strip__track">
        {spans.map(([s, e], i) => (
          <button
            key={i}
            className={`sch-strip__bar tone-${periodOf(s)}`}
            style={{
              left: `${pct(s)}%`,
              width: `${pct(e) - pct(s)}%`,
              top: `calc(${lanes[i]} * (var(--bar-h) + 4px))`,
            }}
            onClick={() => jump(i)}
            title={`${events[i]?.name} · ${formatTime(s)}`}
            aria-label={`Jump to ${events[i]?.name}`}
          />
        ))}
        <span
          className="sch-strip__now"
          style={{ left: `${Math.min(100, Math.max(0, pct(sceneMinutes)))}%` }}
        />
      </div>
      <div className="sch-strip__hours" aria-hidden>
        {hours.map((m) => (
          <span key={m} style={{ left: `${pct(m)}%` }}>
            {formatTime(m).replace(":00", "")}
          </span>
        ))}
      </div>
    </div>
  );
}

function SceneChip({ period, minutes }: { period: Period; minutes: number }) {
  const { label, Icon } = PERIODS[period];
  return (
    <div className="sch-chip" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={period}
          className="sch-chip__icon"
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.35 }}
        >
          <Icon className="sch-icon" />
        </motion.span>
      </AnimatePresence>
      <span>
        {label} · {formatTime(minutes)}
      </span>
    </div>
  );
}

// ── Nights ─────────────────────────────────────────────────────────

function NightsShowcase() {
  const [headliner, ...acts] = NIGHT_HIGHLIGHTS;
  return (
    <section className="sch-nights" aria-label="Night highlights">
      <motion.div
        className="sch-marquee"
        aria-hidden
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        <div className="sch-marquee__track">
          {[0, 1].map((copy) =>
            NIGHT_HIGHLIGHTS.map((act) => (
              <span key={`${copy}-${act.name}`}>
                {act.name}
                <i>✿</i>
              </span>
            )),
          )}
        </div>
      </motion.div>

      {headliner && <NightCard act={headliner} index={0} featured />}

      <ul className="sch-nights__grid">
        {acts.map((act, i) => (
          <NightCard key={act.name} act={act} index={i + 1} />
        ))}
      </ul>

      <motion.p
        className="sch-nights__note"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <MapPin className="sch-icon" /> All nights at the Football Ground · Line-up subject to
        change
      </motion.p>
    </section>
  );
}

function NightCard({
  act,
  index,
  featured = false,
}: {
  act: NightHighlight;
  index: number;
  featured?: boolean;
}) {
  const reduce = useReducedMotion();
  // Off-screen artwork stops animating so only the cards you can see cost anything.
  const mediaRef = useRef<HTMLDivElement>(null);
  const onScreen = useInView(mediaRef, { margin: "120px 0px" });
  const tilt = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
    e.currentTarget.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
    e.currentTarget.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
  };
  const reset = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const Tag = featured ? motion.article : motion.li;
  return (
    <Tag
      className={`sch-act ${featured ? "is-featured" : ""} act-${index}`}
      initial={{ opacity: 0, y: 50, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.7,
        delay: featured ? 0.2 : (index % 3) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      onPointerMove={tilt}
      onPointerLeave={reset}
    >
      <div ref={mediaRef} className={`sch-act__media ${onScreen ? "" : "is-paused"}`}>
        <NightArt kind={act.art} />
      </div>
      <div className="sch-act__shade" />
      <div className="sch-act__shine" />
      <div className="sch-act__content">
        <span className="sch-act__tag">
          {featured ? <Sparkles className="sch-icon" /> : <Music2 className="sch-icon" />}
          {act.tag}
        </span>
        <h3>{act.name}</h3>
        <p>{act.blurb}</p>
        {featured && (
          <span className="sch-eq" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        )}
      </div>
    </Tag>
  );
}

// ── Sky ────────────────────────────────────────────────────────────

// Deterministic integer PRNG so server and client render the same sky.
let seed = 20261029;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const STARS = Array.from({ length: 70 }, () => ({
  left: (rand() * 100).toFixed(2),
  top: (rand() * 55).toFixed(2),
  size: (1 + rand() * 2.2).toFixed(2),
}));
const FIREFLIES = Array.from({ length: 14 }, () => ({
  left: (rand() * 100).toFixed(2),
  top: (60 + rand() * 32).toFixed(2),
  delay: (rand() * 6).toFixed(2),
  duration: (5 + rand() * 6).toFixed(2),
}));
const PETALS = Array.from({ length: 16 }, () => ({
  left: (rand() * 100).toFixed(2),
  delay: (rand() * 14).toFixed(2),
  duration: (12 + rand() * 10).toFixed(2),
  size: (0.7 + rand() * 0.9).toFixed(2),
}));

/** The site's painted Sikkim range, re-lit for the time of day, framed by blossom trees. */
function Sky({ period, minutes, stage }: { period: Period; minutes: number; stage: boolean }) {
  const reduce = useReducedMotion();
  // The sun rides an arc from 6 AM (left horizon) to 8 PM (right horizon).
  const t = Math.min(1, Math.max(0, (minutes / 60 - 6) / 14));
  const sunX = 6 + t * 88;
  const sunY = period === "night" ? 80 : 62 - Math.sin(Math.PI * t) * 50;

  return (
    <div className={`sch-sky ${reduce ? "is-still" : ""}`} aria-hidden>
      <img className="sch-land" src={mountainImg} alt="" decoding="async" />
      {(["morning", "afternoon", "evening", "night"] as const).map((p) => (
        <div key={p} className={`sch-tint tint-${p} ${p === period ? "is-on" : ""}`} />
      ))}

      <SkyStars />

      {/* moved with transform (not left/top) so the glide stays on the GPU */}
      <div
        className="sch-sun"
        style={{ transform: `translate3d(calc(${sunX}vw - 50%), calc(${sunY}vh - 50%), 0)` }}
      />
      <div className="sch-moon" />

      {stage && (
        <div className="sch-beams">
          <span />
          <span />
          <span />
        </div>
      )}

      <img className="sch-tree is-left" src={treeImg} alt="" decoding="async" />
      <img className="sch-tree is-right" src={treeImg} alt="" decoding="async" />

      <SkyCritters />
    </div>
  );
}

// The particle layers never change, so they render once instead of on every scene update.
// Stars twinkle in three groups rather than one animation per star.
const SkyStars = memo(function SkyStars() {
  return (
    <div className="sch-stars">
      {[0, 1, 2].map((g) => (
        <div key={g} className="sch-stars__group">
          {STARS.filter((_, i) => i % 3 === g).map((s, i) => (
            <span
              key={i}
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
              }}
            />
          ))}
        </div>
      ))}
      <span className="sch-shooting" />
    </div>
  );
});

const SkyCritters = memo(function SkyCritters() {
  return (
    <>
      <div className="sch-flies">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            style={{
              left: `${f.left}%`,
              top: `${f.top}%`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="sch-petals">
        {PETALS.map((p, i) => (
          <span
            key={i}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              fontSize: `${p.size}rem`,
            }}
          >
            ✿
          </span>
        ))}
      </div>
    </>
  );
});
