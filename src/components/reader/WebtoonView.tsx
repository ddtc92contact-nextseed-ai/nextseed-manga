"use client";

import Image from "next/image";
import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef } from "react";

import type { ReaderPage } from "./types";

/** Pages ahead of the current one that load eagerly, so scrolling never reaches a blank page. */
const PRELOAD_AHEAD = 3;

type Props = {
  pages: ReaderPage[];
  /** Index of the page under the middle of the viewport (pages.length = end of chapter). */
  page: number;
  /** Page to scroll to when the view mounts (e.g. when switching from manga mode). */
  initialPage: number;
  onPageChange: (index: number) => void;
  /** Called when the scroll direction changes: hide the chrome going down, show it going up. */
  onScrollDirection: (direction: "up" | "down") => void;
  onTap: () => void;
  /** Progress bar fill, updated directly (no re-render) on every scrolled frame. */
  progressRef: RefObject<HTMLElement | null>;
  end: ReactNode;
};

/** Webtoon mode: every page stacked vertically, without gaps, read with the native page scroll. */
export function WebtoonView({
  pages,
  page,
  initialPage,
  onPageChange,
  onScrollDirection,
  onTap,
  progressRef,
  end,
}: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const initial = useRef(initialPage);

  // Coming from manga mode: land on the page that was open. A plain load keeps the browser's
  // own scroll restoration.
  useLayoutEffect(() => {
    const index = initial.current;
    if (index <= 0) return;
    const target = index >= pages.length ? endRef.current : document.getElementById(`page-${index + 1}`);
    target?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [pages.length]);

  // Current page = the one crossing the horizontal middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onPageChange(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    listRef.current?.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    if (endRef.current) observer.observe(endRef.current);
    return () => observer.disconnect();
  }, [onPageChange]);

  // Scroll progress + direction, throttled to one update per frame.
  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    let lastDirection: "up" | "down" | undefined;

    const update = () => {
      frame = 0;
      const list = listRef.current;
      if (!list) return;
      const y = window.scrollY;
      // 0 at the top of the page, 1 once the last page's bottom edge is on screen.
      const bottom = list.getBoundingClientRect().bottom + y;
      const progress = Math.min(1, Math.max(0, y / Math.max(1, bottom - window.innerHeight)));
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;

      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      const direction = delta > 0 && y > 64 ? "down" : "up";
      lastY = y;
      if (direction !== lastDirection) {
        lastDirection = direction;
        onScrollDirection(direction);
      }
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onScrollDirection, progressRef]);

  return (
    <div className="pt-14">
      <ol
        ref={listRef}
        aria-label="Pages du chapitre"
        onClick={onTap}
        className="mx-auto flex max-w-3xl list-none flex-col"
      >
        {pages.map((p, i) => (
          <li key={p.number} id={`page-${p.number}`} data-index={i}>
            <Image
              src={p.image}
              alt={p.alt}
              preload={i === 0}
              loading={i <= page + PRELOAD_AHEAD ? "eager" : "lazy"}
              placeholder="blur"
              draggable={false}
              sizes="(min-width: 768px) 768px, 100vw"
              className="block h-auto w-full select-none"
            />
          </li>
        ))}
      </ol>
      <div ref={endRef} data-index={pages.length} className="pb-36 pt-section">
        {end}
      </div>
    </div>
  );
}
