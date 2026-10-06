"use client";

import Image from "next/image";
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef } from "react";

import type { ReaderPage, ReadingDirection } from "./types";

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;
/** Movement (px) under which a pointer gesture counts as a tap. */
const TAP_SLOP = 10;

type Zoom = { scale: number; x: number; y: number };
const NO_ZOOM: Zoom = { scale: 1, x: 0, y: 0 };

type Gesture =
  | { kind: "none" }
  | { kind: "swipe"; startX: number; startY: number; startTime: number; dx: number; moved: boolean }
  | { kind: "pan"; startX: number; startY: number; origin: Zoom; moved: boolean }
  | { kind: "pinch"; startDistance: number; startMid: { x: number; y: number }; origin: Zoom };

type Props = {
  pages: ReaderPage[];
  /** Current page index; pages.length is the end-of-chapter screen. */
  page: number;
  onPageChange: (index: number) => void;
  direction: ReadingDirection;
  onExit: () => void;
  /** Tap in the middle of the page: toggle the reader chrome. */
  onToggleChrome: () => void;
  /** Mouse movement or navigation: show the chrome for a moment. */
  onActivity: () => void;
  end: ReactNode;
};

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Manga mode: one page at a time, right-to-left by default.
 * Navigation: tap/click the left or right third, swipe, arrow keys (following the reading
 * direction), PageUp/PageDown, Home/End; Esc goes back to the series.
 * Zoom: pinch, double-tap/double-click, ctrl+wheel (trackpad pinch), +/-/0 keys; drag to pan.
 * Gestures write transforms straight to the DOM so they run at the display's frame rate.
 */
export function MangaView({
  pages,
  page,
  onPageChange,
  direction,
  onExit,
  onToggleChrome,
  onActivity,
  end,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement | null>(null);
  const zoom = useRef<Zoom>(NO_ZOOM);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture>({ kind: "none" });
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);
  const tapTimer = useRef<number | undefined>(undefined);

  const last = pages.length; // index of the end screen
  // Where the next page sits: on the left when reading right-to-left.
  const nextSide = direction === "rtl" ? -1 : 1;

  /* ----------------------------------------------------------------- zoom */

  const applyZoom = useCallback((next: Zoom, animate = false) => {
    const stage = stageRef.current;
    if (stage) {
      // Keep the page covering the stage: no panning past its edges.
      const { width, height } = stage.getBoundingClientRect();
      next = {
        scale: next.scale,
        x: Math.min(0, Math.max(width - width * next.scale, next.x)),
        y: Math.min(0, Math.max(height - height * next.scale, next.y)),
      };
    }
    zoom.current = next;
    const el = zoomRef.current;
    if (el) {
      el.style.transition = animate ? "" : "none";
      el.style.transform =
        next.scale === 1 ? "" : `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`;
    }
    stageRef.current?.toggleAttribute("data-zoomed", next.scale > 1);
  }, []);

  /** Zooms to `scale` keeping the stage point (fx, fy) under the finger / cursor. */
  const zoomAt = useCallback(
    (scale: number, fx: number, fy: number, from: Zoom = zoom.current, animate = true) => {
      const s = Math.min(MAX_SCALE, Math.max(1, scale));
      const ratio = s / from.scale;
      applyZoom(
        s === 1 ? NO_ZOOM : { scale: s, x: fx - (fx - from.x) * ratio, y: fy - (fy - from.y) * ratio },
        animate,
      );
    },
    [applyZoom],
  );

  const zoomFromCenter = useCallback(
    (scale: number) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (rect) zoomAt(scale, rect.width / 2, rect.height / 2);
    },
    [zoomAt],
  );

  /* ----------------------------------------------------------- navigation */

  const goTo = useCallback(
    (index: number) => {
      const target = Math.min(last, Math.max(0, index));
      if (target === page) return;
      onPageChange(target);
      onActivity();
    },
    [last, onActivity, onPageChange, page],
  );

  // Whatever turned the page (gesture, key, chrome button), the new page starts unzoomed.
  useLayoutEffect(() => {
    stageRef.current?.querySelectorAll<HTMLElement>("[data-zoom]").forEach((el) => {
      el.style.transform = "";
    });
    zoom.current = NO_ZOOM;
    stageRef.current?.removeAttribute("data-zoomed");
  }, [page]);

  /** Moves the page track by `dx` px while a swipe is in progress (no transition). */
  const dragTrack = (dx: number | null) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = dx === null ? "" : "none";
    track.style.transform = dx === null ? "" : `translate3d(${dx}px, 0, 0)`;
  };

  /* -------------------------------------------------------------- keyboard */

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      const onControl = target.closest("a, button");

      const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
      const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
      let handled = true;
      switch (event.key) {
        case forward:
        case "PageDown":
          goTo(page + 1);
          break;
        case backward:
        case "PageUp":
          goTo(page - 1);
          break;
        case " ":
          if (onControl) handled = false;
          else goTo(page + (event.shiftKey ? -1 : 1));
          break;
        case "Home":
          goTo(0);
          break;
        case "End":
          goTo(last);
          break;
        case "+":
        case "=":
          zoomFromCenter(zoom.current.scale * 1.5);
          break;
        case "-":
          zoomFromCenter(zoom.current.scale / 1.5);
          break;
        case "0":
          applyZoom(NO_ZOOM, true);
          break;
        case "Escape":
          if (zoom.current.scale > 1) applyZoom(NO_ZOOM, true);
          else onExit();
          break;
        default:
          handled = false;
      }
      if (handled) event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyZoom, direction, goTo, last, onExit, page, zoomFromCenter]);

  /* ----------------------------------------------------------------- wheel */

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Non-passive so trackpad pinch (ctrl+wheel) zooms the page instead of the whole site.
    const onWheel = (event: WheelEvent) => {
      const rect = stage.getBoundingClientRect();
      if (event.ctrlKey) {
        event.preventDefault();
        zoomAt(zoom.current.scale * Math.exp(-event.deltaY / 100), event.clientX - rect.left, event.clientY - rect.top, zoom.current, false);
      } else if (zoom.current.scale > 1) {
        event.preventDefault();
        applyZoom({ ...zoom.current, x: zoom.current.x - event.deltaX, y: zoom.current.y - event.deltaY });
      }
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [applyZoom, zoomAt]);

  useEffect(() => () => window.clearTimeout(tapTimer.current), []);

  /* -------------------------------------------------------------- pointers */

  const local = (event: React.PointerEvent) => {
    const rect = stageRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handleTap = (x: number, y: number) => {
    const width = stageRef.current?.clientWidth ?? 1;
    const now = performance.now();
    const previous = lastTap.current;

    if (previous && now - previous.time < DOUBLE_TAP_MS && distance(previous, { x, y }) < 40) {
      window.clearTimeout(tapTimer.current);
      lastTap.current = null;
      if (zoom.current.scale > 1) applyZoom(NO_ZOOM, true);
      else zoomAt(DOUBLE_TAP_SCALE, x, y);
      return;
    }

    const zone = x < width / 3 ? "left" : x > (width * 2) / 3 ? "right" : "center";
    if (zone !== "center" && zoom.current.scale === 1) {
      // Side zones turn the page at once (no double-tap wait), following the reading direction.
      lastTap.current = null;
      goTo(page + (zone === "left" ? -nextSide : nextSide));
      return;
    }
    // Middle of the page (or zoomed in): wait to tell a single tap from a double tap.
    lastTap.current = { time: now, x, y };
    window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(onToggleChrome, DOUBLE_TAP_MS);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("a, button")) return;
    const point = local(event);
    pointers.current.set(event.pointerId, point);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      if (gesture.current.kind === "swipe") dragTrack(null);
      gesture.current = {
        kind: "pinch",
        startDistance: Math.max(1, distance(a, b)),
        startMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        origin: zoom.current,
      };
    } else if (pointers.current.size === 1) {
      gesture.current =
        zoom.current.scale > 1
          ? { kind: "pan", startX: point.x, startY: point.y, origin: zoom.current, moved: false }
          : { kind: "swipe", startX: point.x, startY: point.y, startTime: performance.now(), dx: 0, moved: false };
    }
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") onActivity();
    if (!pointers.current.has(event.pointerId)) return;
    const point = local(event);
    pointers.current.set(event.pointerId, point);
    const g = gesture.current;

    if (g.kind === "pinch" && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const scale = Math.min(MAX_SCALE, Math.max(1, (g.origin.scale * distance(a, b)) / g.startDistance));
      const ratio = scale / g.origin.scale;
      // Zoom around the starting midpoint and follow the fingers as they move.
      applyZoom({
        scale,
        x: mid.x - (g.startMid.x - g.origin.x) * ratio,
        y: mid.y - (g.startMid.y - g.origin.y) * ratio,
      });
    } else if (g.kind === "pan") {
      const dx = point.x - g.startX;
      const dy = point.y - g.startY;
      if (!g.moved && Math.hypot(dx, dy) < TAP_SLOP) return;
      if (!g.moved) stageRef.current?.setPointerCapture(event.pointerId);
      g.moved = true;
      applyZoom({ scale: g.origin.scale, x: g.origin.x + dx, y: g.origin.y + dy });
    } else if (g.kind === "swipe") {
      const dx = point.x - g.startX;
      if (!g.moved && Math.hypot(dx, point.y - g.startY) < TAP_SLOP) return;
      if (!g.moved) stageRef.current?.setPointerCapture(event.pointerId);
      g.moved = true;
      // Rubber-band when there is no page in that direction.
      const target = page + (dx > 0 ? -nextSide : nextSide);
      g.dx = target < 0 || target > last ? dx * 0.25 : dx;
      dragTrack(g.dx);
    }
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (!pointers.current.delete(event.pointerId)) return;
    const g = gesture.current;
    const point = local(event);

    if (g.kind === "pinch") {
      if (pointers.current.size === 1) {
        // One finger left: keep panning from where the pinch ended.
        const [rest] = [...pointers.current.values()];
        gesture.current = { kind: "pan", startX: rest.x, startY: rest.y, origin: zoom.current, moved: true };
      } else if (pointers.current.size === 0) {
        gesture.current = { kind: "none" };
        if (zoom.current.scale < 1.05) applyZoom(NO_ZOOM, true);
      }
      return;
    }
    if (pointers.current.size > 0) return;
    gesture.current = { kind: "none" };
    if (event.type === "pointercancel") {
      dragTrack(null);
      return;
    }

    if (g.kind === "swipe" && g.moved) {
      const width = stageRef.current?.clientWidth ?? 1;
      const velocity = g.dx / Math.max(1, performance.now() - g.startTime);
      dragTrack(null);
      if (Math.abs(g.dx) > Math.min(80, width * 0.15) || Math.abs(velocity) > 0.5) {
        goTo(page + (g.dx > 0 ? -nextSide : nextSide));
      }
    } else if ((g.kind === "swipe" || g.kind === "pan") && !g.moved) {
      handleTap(point.x, point.y);
    }
  };

  /* ---------------------------------------------------------------- render */

  // Current page, the one before and the two after: neighbours are loaded ahead of time.
  const visible = [page - 1, page, page + 1, page + 2].filter((i) => i >= 0 && i <= last);

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="visionneuse de pages"
      aria-label="Pages du chapitre"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="absolute inset-0 cursor-pointer touch-none select-none overflow-hidden data-zoomed:cursor-grab data-zoomed:active:cursor-grabbing"
    >
      <div ref={trackRef} className="absolute inset-0 motion-safe:transition-transform motion-safe:duration-300 ease-out">
        {visible.map((i) => {
          const offset = (i - page) * nextSide;
          const current = i === page;
          const p = pages[i];
          return (
            <div
              key={i}
              aria-hidden={!current}
              inert={!current}
              style={{ transform: `translate3d(${offset * 100}%, 0, 0)` }}
              className={`absolute inset-0 ease-out motion-safe:transition-[transform,opacity] motion-safe:duration-300 ${current ? "opacity-100" : "opacity-40"}`}
            >
              {p ? (
                <div
                  ref={current ? zoomRef : undefined}
                  data-zoom
                  className="absolute inset-0 origin-top-left ease-out will-change-transform motion-safe:transition-transform motion-safe:duration-200"
                >
                  <Image
                    src={p.image}
                    alt={p.alt}
                    fill
                    preload={i === 0}
                    loading="eager"
                    placeholder="blur"
                    draggable={false}
                    sizes={`(min-aspect-ratio: ${p.image.width}/${p.image.height}) ${Math.ceil((p.image.width / p.image.height) * 100)}vh, 100vw`}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center bg-ink-950 bg-screentone py-20">
                  {end}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
