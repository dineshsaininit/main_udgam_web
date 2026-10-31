import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { ChevronDown, Menu, MoonStar, Sun, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/schedule", label: "Schedule" },
  { to: "/winners", label: "Winners" },
  { to: "/gallery", label: "Gallery" },
  { to: "/team", label: "Team" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/merch", label: "Merch" },
  { to: "/about", label: "About Us" },
] as const;

const scheduleLinks = [
  { view: "day", label: "Day Schedule", hint: "Morning to evening", Icon: Sun },
  { view: "night", label: "Night Schedule", hint: "After dark", Icon: MoonStar },
] as const;

function NavPill({ isActive, label, children }: { isActive: boolean; label: string; children?: ReactNode }) {
  return (
    <>
      {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full btn-blossom" transition={{ type: "spring", bounce: 0.3 }} />}
      <motion.span whileHover={{ y: -2 }} className={`relative inline-flex items-center gap-1 ${isActive ? "text-primary-foreground" : ""}`}>
        {label}
        {children}
      </motion.span>
      <span className="absolute -top-1 left-1/2 -translate-x-1/2 scale-0 text-xs text-blossom-deep transition-transform group-hover:scale-100">✿</span>
    </>
  );
}

function ScheduleMenu() {
  const [open, setOpen] = useState(false);
  const isActive = useRouterState({ select: (s) => s.location.pathname === "/schedule" });
  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <Link to="/schedule" preload="intent" aria-haspopup="true" aria-expanded={open} className="group relative block rounded-full px-4 py-2 text-sm font-semibold text-secondary-foreground">
        <NavPill isActive={isActive} label="Schedule">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </NavPill>
      </Link>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3"
          >
            <div className="glass overflow-hidden rounded-2xl p-1.5">
              {scheduleLinks.map(({ view, label, hint, Icon }) => (
                <Link
                  key={view}
                  to="/schedule"
                  search={view === "night" ? { view: "night" } : {}}
                  preload="intent"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-secondary-foreground transition-colors hover:bg-secondary"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full btn-blossom">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-xs text-muted-foreground">{hint}</span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="glass flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-2.5">
        <Link to="/" className="font-display text-xl font-semibold text-gradient">Udgam ✿ 2K26</Link>
        <ul className="hidden gap-1 md:flex">
          {links.map((l) =>
            l.to === "/schedule" ? (
              <ScheduleMenu key={l.to} />
            ) : (
              <li key={l.to}>
                <Link to={l.to} preload="intent" activeOptions={{ exact: true }} className="group relative block rounded-full px-4 py-2 text-sm font-semibold text-secondary-foreground">
                  {({ isActive }) => <NavPill isActive={isActive} label={l.label} />}
                </Link>
              </li>
            ),
          )}
        </ul>
        <button className="md:hidden text-secondary-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="glass absolute top-16 w-[calc(100%-2rem)] rounded-3xl p-3 md:hidden">
            {links.map((l, i) => (
              <motion.li key={l.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                {l.to === "/schedule" ? (
                  scheduleLinks.map(({ view, label, Icon }) => (
                    <Link key={view} to="/schedule" search={view === "night" ? { view: "night" } : {}} preload="intent" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold text-secondary-foreground hover:bg-secondary">
                      <Icon className="h-4 w-4" /> {label}
                    </Link>
                  ))
                ) : (
                  <Link to={l.to} preload="intent" onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-semibold text-secondary-foreground hover:bg-secondary">{l.label}</Link>
                )}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
