// Sponsor ring: logos sit on the border of a rectangle and the whole frame turns one slot per step
// (right along the bottom, up the right side, left across the top, down the left side), like the
// outer ring of a puzzle. The Udgam logo fills the middle; on phones (2 tiles across, no middle)
// it sits as a banner above the frame.
//
// The frame's shape is chosen from the sponsor count so nobody is shown twice. A rectangle's border
// always has an even number of slots, so with an odd count (or a narrow screen) one sponsor waits
// off-screen and swaps in at the bottom-left corner each turn.
//
// Tiles on a straight edge move in parallel and never touch; the two tiles meeting at a corner
// briefly shrink as they turn, so they slip past each other instead of overlapping.

import type { PageSponsor } from "./sponsorsData";

const RING = {
  stepEvery: 2000, // ms from the start of one step to the next
  slideFor: 800, // ms the frame takes to advance one slot
  cornerDip: 0.5, // how small corner tiles get mid-turn (0.5 = half size)
  maxRows: 6, // tallest frame allowed
  middleAspect: [1, 1.75] as const, // allowed width : height of the middle logo panel
  logoAspect: 1.6, // the Udgam logo's own width : height
  bannerAspect: 1.8, // phones: the logo banner is this many times wider than tall
  clockwise: false,
};

// Fallbacks for the CSS custom properties on .sp-ring, in case the stylesheet is not applied yet.
const DEFAULTS = { gap: 16, minW: 160, maxW: 320, minH: 128, maxH: 172, ratio: 0.65 };

interface Cell {
  x: number;
  y: number;
}

interface Tile {
  el: HTMLAnchorElement;
}

interface Frame {
  c: number;
  r: number;
  P: number;
  middle: boolean;
  tw: number;
  th: number;
  aspect: number;
  ok: boolean;
}

export interface SponsorRing {
  /** Pause or resume; returns true when now paused. */
  toggle(): boolean;
  destroy(): void;
}

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function fillTile(tile: Tile, s: PageSponsor) {
  const a = tile.el;
  a.className = `rtile${s.dark ? " rtile--dark" : ""}`;
  if (s.url) {
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  } else {
    a.removeAttribute("href");
    a.removeAttribute("target");
    a.removeAttribute("rel");
  }
  a.setAttribute("aria-label", s.url ? `${s.name}. Opens partner website` : s.name);

  const logo = document.createElement("span");
  logo.className = "rtile__logo";
  const img = document.createElement("img");
  img.src = s.logo;
  img.alt = `${s.name} logo`;
  img.loading = "lazy";
  img.decoding = "async";
  logo.append(img);

  const name = document.createElement("span");
  name.className = "rtile__name";
  name.textContent = s.name;

  a.replaceChildren(logo, name);
}

export function createSponsorRing(
  ring: HTMLElement,
  center: HTMLElement,
  items: PageSponsor[],
): SponsorRing | null {
  const n = items.length;
  if (!n) return null;
  const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let cells: Cell[] = [];
  let dips: boolean[] = [];
  const tiles: Tile[] = [];
  let slots = 0;
  let step = 0;
  let nextItem = 0;
  let lastSig = "";
  let clock = 0;
  let lastTs: number | null = null;
  let stepStart = 0;
  let lastDrawn = -1;
  let rafId = 0;
  let destroyed = false;
  const timers = new Set<number>();
  const hold = { paused: false, hover: false, touchUntil: 0 };

  function chooseFrame(
    w: number,
    gap: number,
    lim: { minW: number; maxW: number; minH: number; maxH: number; ratio: number },
  ): Frame {
    const [minA, maxA] = RING.middleAspect;
    const maxCols = Math.max(2, Math.floor((w + gap) / (lim.minW + gap)));
    const cands: { c: number; r: number; P: number; middle: boolean }[] = [];
    for (let r = 2; r <= RING.maxRows; r++) {
      for (let c = 2; c <= maxCols; c++) {
        const P = 2 * (c + r) - 4;
        if (P > n && P > 4) continue;
        cands.push({ c, r, P, middle: c >= 3 && r >= 3 });
      }
    }
    if (!cands.length) cands.push({ c: 2, r: 2, P: 4, middle: false });
    const bestP = Math.max(...cands.map((k) => k.P));
    const sized: Frame[] = cands
      .filter((k) => k.P === bestP)
      .map((k) => {
        let tw = Math.min(lim.maxW, Math.floor((w - (k.c - 1) * gap) / k.c));
        let th = Math.min(lim.maxH, Math.max(lim.minH, tw * lim.ratio));
        let aspect = 0;
        let ok = false;
        if (k.middle) {
          const mw = (t: number) => (k.c - 2) * t + (k.c - 3) * gap;
          const mh = (h: number) => (k.r - 2) * h + (k.r - 3) * gap;
          // tile height that gives the middle a width : height of A
          const hFor = (t: number, A: number) => (mw(t) / A - (k.r - 3) * gap) / (k.r - 2);
          if (mw(tw) / mh(th) > maxA) {
            // too wide a strip: taller tiles first, then narrower tiles (the frame stays centred)
            th = Math.min(lim.maxH, hFor(tw, maxA));
            if (mw(tw) / mh(th) > maxA) {
              const t = Math.floor((maxA * mh(th) - (k.c - 3) * gap) / (k.c - 2));
              if (t >= lim.minW) tw = t;
            }
          } else if (mw(tw) / mh(th) < minA) {
            th = Math.max(lim.minH, hFor(tw, minA));
          }
          th = Math.round(th);
          aspect = mw(tw) / mh(th);
          ok = aspect >= minA - 0.02 && aspect <= maxA + 0.02;
        }
        return { ...k, tw, th: Math.round(th), aspect, ok };
      });
    const near = (k: Frame) => Math.abs(k.aspect - RING.logoAspect);
    sized.sort(
      (a, b) =>
        Number(b.middle && b.ok) - Number(a.middle && a.ok) ||
        Number(b.middle) - Number(a.middle) ||
        b.tw * b.th - a.tw * a.th ||
        near(a) - near(b),
    );
    return sized[0]!;
  }

  function draw(f: number) {
    if (f === lastDrawn) return;
    lastDrawn = f;
    const dipBy = (1 - RING.cornerDip) * Math.sin(Math.PI * f);
    for (let k = 0; k < slots; k++) {
      const from = (k + step) % slots;
      const a = cells[from]!;
      const b = cells[(from + 1) % slots]!;
      const x = a.x + (b.x - a.x) * f;
      const y = a.y + (b.y - a.y) * f;
      const s = dips[from] ? 1 - dipBy : 1;
      const el = tiles[k]!.el;
      // --sp-lift / --sp-zoom come from the hover style, applied around the tile's own centre
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(var(--sp-lift, 0px)) scale(${s.toFixed(3)}) scale(var(--sp-zoom, 1))`;
      el.classList.toggle("is-moving", f > 0 && f < 1);
    }
  }

  function layout() {
    if (destroyed) return;
    const cs = getComputedStyle(ring);
    const num = (name: string, fallback: number) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) && v > 0 ? v : fallback;
    };
    const gap = num("--ring-gap", DEFAULTS.gap);
    const lim = {
      minW: num("--tile-min-w", DEFAULTS.minW),
      maxW: num("--tile-max-w", DEFAULTS.maxW),
      minH: num("--tile-min-h", DEFAULTS.minH),
      maxH: num("--tile-max-h", DEFAULTS.maxH),
      ratio: num("--tile-ratio", DEFAULTS.ratio),
    };
    const w = ring.clientWidth;
    if (!w) return;

    const { c: cols, r: rows, middle, tw, th } = chooseFrame(w, gap, lim);

    // our own height change re-triggers the ResizeObserver; skip when nothing changed
    const sig = [w, cols, rows, tw, th, gap].join(",");
    if (sig === lastSig) return;
    lastSig = sig;

    ring.style.setProperty("--tile-w", `${tw}px`);
    ring.style.setProperty("--tile-h", `${th}px`);
    // narrow tiles (phones): names may wrap onto two lines instead of being cut off
    ring.classList.toggle("sp-ring--compact", tw < 200);
    const frameW = cols * tw + (cols - 1) * gap;
    const ox = Math.round((w - frameW) / 2);
    const bannerH = middle
      ? 0
      : Math.round(Math.min(220, Math.max(110, frameW / RING.bannerAspect)));
    const top0 = bannerH ? bannerH + gap : 0;
    ring.style.height = `${top0 + rows * th + (rows - 1) * gap}px`;
    const at = (c: number, r: number): Cell => ({
      x: ox + c * (tw + gap),
      y: top0 + r * (th + gap),
    });

    // slot order = direction of travel; consecutive cells are always neighbours
    cells = [];
    for (let c = 0; c < cols; c++) cells.push(at(c, rows - 1)); // bottom edge, left to right
    for (let r = rows - 2; r >= 1; r--) cells.push(at(cols - 1, r)); // right edge, upwards
    for (let c = cols - 1; c >= 0; c--) cells.push(at(c, 0)); // top edge, right to left
    for (let r = 1; r <= rows - 2; r++) cells.push(at(0, r)); // left edge, downwards
    if (RING.clockwise) cells.reverse();
    slots = cells.length;

    // a move out of slot i shrinks if it turns a corner (the only moves that could collide)
    const dir = (i: number) => {
      const a = cells[(i + slots) % slots]!;
      const b = cells[(i + 1 + slots) % slots]!;
      return `${Math.sign(b.x - a.x)},${Math.sign(b.y - a.y)}`;
    };
    dips = cells.map((_, i) => dir(i) !== dir(i - 1) || dir(i) !== dir(i + 1));

    center.classList.toggle("sp-ring__center--banner", !middle);
    Object.assign(
      center.style,
      middle
        ? {
            left: `${ox + tw + gap}px`,
            top: `${th + gap}px`,
            width: `${(cols - 2) * tw + (cols - 3) * gap}px`,
            height: `${(rows - 2) * th + (rows - 3) * gap}px`,
          }
        : { left: `${ox}px`, top: "0px", width: `${frameW}px`, height: `${bannerH}px` },
    );

    // one tile per slot: no empty slot
    while (tiles.length < slots) {
      const el = document.createElement("a");
      el.setAttribute("role", "listitem");
      tiles.push({ el });
      ring.append(el);
    }
    while (tiles.length > slots) tiles.pop()!.el.remove();

    // With more sponsors than slots, slot 0 (where newcomers enter) holds the newest and the slot
    // before it the oldest, so the sponsor swapped out has always been on show longest and no
    // sponsor is ever shown twice.
    const extra = n > slots;
    tiles.forEach((t, k) => fillTile(t, items[extra ? slots - 1 - k : k % n]!));
    nextItem = extra ? slots : 0;

    step = 0;
    stepStart = clock + (RING.stepEvery - RING.slideFor);
    lastDrawn = -1;
    draw(0);
    ring.classList.add("is-ready");
  }

  function swap(tile: Tile, s: PageSponsor) {
    tile.el.classList.add("is-swapping");
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (destroyed) return;
      fillTile(tile, s);
      tile.el.classList.remove("is-swapping");
    }, 220);
    timers.add(id);
  }

  function finishStep() {
    step = (step + 1) % slots;
    if (n > slots) {
      // the tile now on the bottom-left corner takes the next sponsor in line
      swap(tiles[(slots - step) % slots]!, items[nextItem % n]!);
      nextItem++;
    }
    stepStart += RING.stepEvery;
    lastDrawn = -1;
    draw(0);
  }

  function frame(ts: number) {
    if (destroyed) return;
    const held = hold.paused || hold.hover || Date.now() < hold.touchUntil;
    // a slide in progress always finishes, so a held frame rests with every tile in its slot
    const sliding = clock >= stepStart && clock < stepStart + RING.slideFor;
    if (lastTs !== null && (!held || sliding)) clock += Math.min(64, ts - lastTs);
    lastTs = ts;
    if (slots && clock >= stepStart) {
      const p = Math.min(1, (clock - stepStart) / RING.slideFor);
      draw(easeInOut(p));
      if (p >= 1) finishStep();
    }
    rafId = requestAnimationFrame(frame);
  }

  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "touch") hold.hover = true;
  };
  const onLeave = () => {
    hold.hover = false;
  };
  const onFocus = () => {
    hold.hover = true;
  };
  const onTouch = () => {
    hold.touchUntil = Date.now() + 1500;
  };

  layout();
  const observer = new ResizeObserver(layout);
  observer.observe(ring);
  // re-measure once fonts and the page stylesheet have settled
  for (const ms of [250, 1000]) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      layout();
    }, ms);
    timers.add(id);
  }
  document.fonts?.ready.then(layout).catch(() => undefined);
  if (animate) rafId = requestAnimationFrame(frame);

  ring.addEventListener("pointerenter", onEnter);
  ring.addEventListener("pointerleave", onLeave);
  ring.addEventListener("focusin", onFocus);
  ring.addEventListener("focusout", onLeave);
  ring.addEventListener("touchstart", onTouch, { passive: true });

  return {
    toggle() {
      hold.paused = !hold.paused;
      return hold.paused;
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
      ring.removeEventListener("pointerenter", onEnter);
      ring.removeEventListener("pointerleave", onLeave);
      ring.removeEventListener("focusin", onFocus);
      ring.removeEventListener("focusout", onLeave);
      ring.removeEventListener("touchstart", onTouch);
      tiles.forEach((t) => t.el.remove());
      tiles.length = 0;
      ring.classList.remove("is-ready", "sp-ring--compact");
    },
  };
}
