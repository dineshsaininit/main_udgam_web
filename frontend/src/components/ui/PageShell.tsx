import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <motion.main initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative mx-auto min-h-screen max-w-5xl px-5 pb-24 pt-32">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span key={i} className="absolute text-2xl text-blossom" style={{ left: `${(i * 37) % 100}%`, top: "-5%" }}
            animate={{ y: ["0vh", "110vh"], x: [0, 40, -20], rotate: [0, 360] }}
            transition={{ duration: 10 + (i % 5) * 2, repeat: Infinity, delay: i * 0.8, ease: "linear" }}>✿</motion.span>
        ))}
      </div>
      <h1 className="text-5xl font-semibold text-gradient md:text-7xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-xl text-lg text-muted-foreground">{subtitle}</p>}
      <div className="mt-12">{children}</div>
    </motion.main>
  );
}

export function Card({ title, tag, children }: { title: string; tag?: string; children?: ReactNode }) {
  return (
    <motion.div whileHover={{ y: -6, rotateX: 4, rotateY: -4 }} transition={{ type: "spring", stiffness: 250 }} className="glass rounded-3xl p-6" style={{ transformPerspective: 800 }}>
      {tag && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">{tag}</span>}
      <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
      <div className="mt-2 text-muted-foreground">{children}</div>
    </motion.div>
  );
}
