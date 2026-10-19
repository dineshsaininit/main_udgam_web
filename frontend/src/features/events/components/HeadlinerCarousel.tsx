import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { cssVars } from "@/lib/css-vars";
import { prefersReducedMotion } from "../utils";
import { ArrowIcon } from "./eventIcons";

const AUTOPLAY_MS = 4600;
const SWIPE_THRESHOLD = 36;

/**
 * Premium Coverflow Carousel with silky-smooth 3D depth, responsive touch swipe,
 * and elegant indicator navigation.
 */
export default function HeadlinerCarousel<T>({
  items,
  renderItem,
  getKey,
  paused = false,
  label,
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey: (item: T) => string;
  paused?: boolean;
  label: string;
}) {
  const slides = items.length < 5 ? [...items, ...items] : items;
  const n = slides.length;
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [docHidden, setDocHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Smooth drag tracking
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => setReducedMotion(prefersReducedMotion()), []);

  const go = useCallback(
    (delta: number) => {
      setDragX(0);
      setActive((i) => (((i + delta) % n) + n) % n);
    },
    [n],
  );

  useEffect(() => {
    setActive(0);
  }, [items]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), {
      threshold: 0.35,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = !paused && !hovered && !focused && !isDragging && visible && !docHidden && !reducedMotion;
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [running, go, active]);

  const onPointerDown = (e: PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragStartRef.current || !isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    // If vertical scroll dominates, don't hijack horizontal drag
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dx) < 15) return;
    setDragX(dx);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    dragStartRef.current = null;
    setIsDragging(false);

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      go(dx < 0 ? 1 : -1);
    } else {
      setDragX(0);
    }
  };

  const onPointerCancel = () => {
    dragStartRef.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  const half = Math.floor(n / 2);
  const realIndex = active % items.length;

  return (
    <div
      className="ep-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <div
        ref={stageRef}
        className={`ep-carousel-stage ${isDragging ? "is-dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={cssVars({ "--drag-shift": `${dragX * 0.35}px` })}
      >
        {slides.map((item, i) => {
          let offset = (((i - active) % n) + n) % n;
          if (offset >= n - half) offset -= n;
          const pos = Math.max(-2, Math.min(2, offset));
          const isCenter = offset === 0;
          const isSide = Math.abs(offset) === 1;

          return (
            <div
              key={`${getKey(item)}-${i}`}
              className={`ep-slide ${isCenter ? "is-center" : ""} ${isSide ? "is-side" : ""}`}
              style={cssVars({ "--pos": pos })}
              aria-hidden={!isCenter}
              onClick={isSide ? () => go(offset) : undefined}
            >
              <div className="ep-slide-inner" inert={!isCenter}>
                {renderItem(item, i % items.length)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="ep-carousel-nav">
        <button
          type="button"
          className="ep-icon-btn ep-carousel-btn"
          onClick={() => go(-1)}
          aria-label="Previous headliner"
          title="Previous (←)"
        >
          <ArrowIcon className="ep-carousel-prev" />
        </button>

        <div className="ep-carousel-dots" role="tablist" aria-label="Choose headliner">
          {items.map((item, i) => (
            <button
              key={getKey(item)}
              type="button"
              role="tab"
              aria-selected={i === realIndex}
              aria-label={`Show headliner ${i + 1} of ${items.length}`}
              className={`ep-carousel-dot ${i === realIndex ? "is-active" : ""}`}
              onClick={() => go(i - realIndex)}
            >
              {i === realIndex && running && (
                <span
                  key={active}
                  className="ep-carousel-dot-fill"
                  style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ep-icon-btn ep-carousel-btn"
          onClick={() => go(1)}
          aria-label="Next headliner"
          title="Next (→)"
        >
          <ArrowIcon />
        </button>
      </div>
    </div>
  );
}
