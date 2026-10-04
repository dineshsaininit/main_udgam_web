import { motion } from "framer-motion";

function Flower({ className }: { className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M0 0 C -14 -10 -16 -32 -5 -40 L 0 -35 L 5 -40 C 16 -32 14 -10 0 0Z" fill="var(--blossom)" stroke="var(--blossom-deep)" strokeWidth="1.2" />
      ))}
      <circle r="7" fill="oklch(0.85 0.14 85)" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} transform={`rotate(${a}) translate(0 -11)`} r="1.8" fill="var(--blossom-deep)" />
      ))}
    </svg>
  );
}

export function BlossomLoader({ onDone }: { onDone: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <motion.div
        className="absolute"
        initial={{ x: "-45vw", y: "-40vh", scale: 0.08, rotate: -220 }}
        animate={{ x: [null, "10vw", "0vw", "0vw"], y: [null, "5vh", "0vh", "0vh"], scale: [null, 0.4, 0.6, 30], rotate: [null, 40, 0, 90] }}
        transition={{ duration: 3.2, times: [0, 0.45, 0.7, 1], ease: "easeInOut" }}
        onAnimationComplete={onDone}
      >
        <Flower className="h-[40vmin] w-[40vmin] drop-shadow-2xl" />
      </motion.div>
      <motion.div className="relative text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: [0, 1, 1, 0], y: 0 }} transition={{ duration: 2.6, times: [0, 0.3, 0.8, 1] }}>
        <p className="font-display text-5xl text-gradient md:text-7xl">Udgam</p>
        <p className="mt-2 tracking-[0.5em] text-muted-foreground">2K26</p>
      </motion.div>
    </motion.div>
  );
}
