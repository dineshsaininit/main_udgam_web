import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BlossomLoader } from "@/components/ui/BlossomLoader";

const BlossomScene = lazy(() => import("@/components/3d/BlossomScene").then((m) => ({ default: m.BlossomScene })));

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Udgam 2K26 — Where Dreams Bloom" },
      { name: "description", content: "Step into a 3D cherry blossom forest and explore Udgam 2K26, our college fest." },
      { property: "og:title", content: "Udgam 2K26 — Where Dreams Bloom" },
      { property: "og:description", content: "A whimsical cherry blossom college fest experience." },
    ],
  }),
  component: Home,
});

const highlights = [
  { title: "Headliner Night", text: "A starlit concert beneath the canopy.", to: "/events" },
  { title: "Workshops", text: "Learn, build and bloom with mentors.", to: "/events" },
  { title: "Art Installations", text: "Lanterns, light and living art.", to: "/events" },
] as const;

function Home() {
  const progress = useRef(0);
  const [loading, setLoading] = useState(true);
  const [low, setLow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? window.scrollY / max : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnimatePresence>{loading && <BlossomLoader onDone={() => setLoading(false)} />}</AnimatePresence>
      <div className="fixed inset-0 -z-0">
        <Suspense fallback={null}><BlossomScene progress={progress} low={low} /></Suspense>
      </div>
      <button onClick={() => setLow(!low)} className="glass fixed bottom-5 right-5 z-40 rounded-full px-4 py-2 text-xs font-bold text-secondary-foreground">
        {low ? "Low quality ✓" : "High quality ✓"}
      </button>

      <main className="relative z-10">
        <section className="flex h-screen flex-col items-center justify-center px-5 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: loading ? 0 : 1 }} transition={{ delay: 0.2 }} className="tracking-[0.5em] text-secondary-foreground">COLLEGE FEST</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={loading ? {} : { opacity: 1, y: 0 }} transition={{ duration: 1 }} className="mt-3 text-7xl font-semibold text-gradient drop-shadow md:text-9xl">Udgam 2K26</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={loading ? {} : { opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 text-xl italic text-secondary-foreground font-display">Where dreams bloom.</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={loading ? {} : { opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-10 flex flex-wrap justify-center gap-3">
            <Cta to="/events" primary>Explore Events</Cta>
            <Cta to="/calendar">View Calendar</Cta>
            <Cta to="/merch">Get Merch</Cta>
          </motion.div>
          <motion.span animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 text-sm text-secondary-foreground">scroll into the grove ↓</motion.span>
        </section>

        <section className="flex h-screen items-center px-5">
          <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ amount: 0.5 }} className="glass max-w-md rounded-3xl p-8 md:ml-[10%]">
            <h2 className="text-4xl font-semibold text-gradient">Three days. One bloom.</h2>
            <p className="mt-3 text-muted-foreground">Music, tech, art and culture — wrapped in petals and starlight.</p>
          </motion.div>
        </section>

        <section className="flex min-h-screen items-center px-5">
          <div className="mx-auto grid w-full max-w-5xl gap-5 md:grid-cols-3">
            {highlights.map((h, i) => (
              <motion.div key={h.title} initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.7 }} viewport={{ amount: 0.4 }}>
                <Link to={h.to}>
                  <motion.div whileHover={{ y: -8, rotateX: 6, rotateY: -6 }} style={{ transformPerspective: 800 }} className="glass rounded-3xl p-7">
                    <span className="text-3xl text-blossom-deep">✿</span>
                    <h3 className="mt-2 text-2xl font-semibold">{h.title}</h3>
                    <p className="mt-2 text-muted-foreground">{h.text}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="flex h-screen flex-col items-center justify-center px-5 text-center">
          <motion.h2 initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-5xl font-semibold text-gradient md:text-7xl">See you in the canopy</motion.h2>
          <div className="mt-8"><Cta to="/about" primary>About Udgam</Cta></div>
        </section>
      </main>
    </>
  );
}

function Cta({ to, children, primary }: { to: "/events" | "/calendar" | "/merch" | "/about"; children: React.ReactNode; primary?: boolean }) {
  return (
    <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}>
      <Link to={to} className={`block rounded-full px-7 py-3 font-bold ${primary ? "btn-blossom" : "glass text-secondary-foreground"}`}>{children}</Link>
    </motion.div>
  );
}
