"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChapterEnd } from "./ChapterEnd";
import { MangaView } from "./MangaView";
import { usePreference } from "./prefs";
import { type ReaderData, readingDirections, readingModes } from "./types";
import { WebtoonView } from "./WebtoonView";

/** How long the chrome stays up after the last mouse move / navigation in manga mode. */
const CHROME_IDLE_MS = 2500;

const modeLabel = { webtoon: "Webtoon", manga: "Manga" } as const;

/**
 * Chapter reader: webtoon (vertical scroll) or manga (page by page) mode, with a minimal chrome
 * that hides while reading and comes back on tap, upward scroll or mouse movement.
 * The mode is remembered per series; the reading direction (manga mode) is remembered globally.
 */
export function ChapterReader({ series, chapter, previous, next }: ReaderData) {
  const router = useRouter();
  const [mode, setMode] = usePreference(
    `nextseed:reader-mode:${series.slug}`,
    readingModes,
    series.readingMode,
  );
  const [direction, setDirection] = usePreference("nextseed:reader-direction", readingDirections, "rtl");
  const [page, setPage] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);

  const total = chapter.pages.length;
  const atEnd = page >= total;
  const rtl = mode === "manga" && direction === "rtl";

  /* ----------------------------------------------------------------- chrome */

  const scheduleHide = useCallback(() => {
    const tick = () => {
      // Never pull the chrome away from under the cursor or the keyboard focus.
      if (chromeRef.current?.querySelector(":hover, :focus-visible")) {
        hideTimer.current = window.setTimeout(tick, CHROME_IDLE_MS);
      } else {
        setChromeVisible(false);
      }
    };
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(tick, CHROME_IDLE_MS);
  }, []);

  const showChrome = useCallback(() => {
    setChromeVisible(true);
    if (mode === "manga") scheduleHide();
  }, [mode, scheduleHide]);

  const toggleChrome = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    setChromeVisible((visible) => !visible);
  }, []);

  const onScrollDirection = useCallback((dir: "up" | "down") => {
    window.clearTimeout(hideTimer.current);
    setChromeVisible(dir === "up");
  }, []);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // Desktop: bring the chrome back when the mouse nears the top or bottom edge (webtoon mode;
  // in manga mode any movement over the page does it).
  useEffect(() => {
    if (mode !== "webtoon") return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (event.clientY < 72 || event.clientY > window.innerHeight - 88) setChromeVisible(true);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mode]);

  // Manga mode is a full-screen layer: lock the page scroll behind it.
  useEffect(() => {
    if (mode !== "manga") return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousOverflow;
    };
  }, [mode]);

  // Manga progress follows the page; webtoon progress follows the scroll (set by WebtoonView).
  useEffect(() => {
    if (mode === "manga" && progressRef.current) {
      progressRef.current.style.transform = `scaleX(${Math.min(1, (page + 1) / total)})`;
    }
  }, [mode, page, total]);

  const switchMode = (next: typeof mode) => {
    if (next === mode) return;
    setMode(next);
    setChromeVisible(true);
    window.clearTimeout(hideTimer.current);
  };

  const exit = useCallback(() => router.push(series.href), [router, series.href]);

  const end = <ChapterEnd series={series} chapter={chapter} next={next} />;
  const visible = chromeVisible || atEnd;
  const counter = atEnd ? "End" : `${page + 1} / ${total}`;

  /* ----------------------------------------------------------------- render */

  return (
    <div id="reader" data-mode={mode} className="min-h-dvh bg-ink-950">
      {mode === "webtoon" ? (
        <WebtoonView
          pages={chapter.pages}
          page={page}
          initialPage={page}
          onPageChange={setPage}
          onScrollDirection={onScrollDirection}
          onTap={toggleChrome}
          progressRef={progressRef}
          end={end}
        />
      ) : (
        <div className="fixed inset-0 z-40 bg-ink-950">
          <MangaView
            pages={chapter.pages}
            page={page}
            onPageChange={setPage}
            direction={direction}
            onExit={exit}
            onToggleChrome={toggleChrome}
            onActivity={showChrome}
            end={end}
          />
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {atEnd ? `End of chapter ${chapter.number}` : `Page ${page + 1} of ${total}`}
      </p>

      <div ref={chromeRef} onFocus={showChrome}>
        <header
          className={`fixed inset-x-0 top-0 z-50 border-b border-ink-700 bg-ink-950/90 backdrop-blur-md ease-out motion-safe:transition-transform motion-safe:duration-300 ${visible ? "" : "-translate-y-full"}`}
        >
          <div className="mx-auto flex h-14 max-w-site items-center gap-3 px-gutter lg:px-gutter-lg">
            <Link
              href={series.href}
              aria-label={`Back to ${series.title}`}
              className="-ml-2 flex size-11 shrink-0 items-center justify-center text-xl text-paper-muted transition-colors hover:text-accent"
            >
              <span aria-hidden="true">←</span>
            </Link>
            <h1 className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-xs font-semibold uppercase tracking-wider text-paper-faint">
                {series.title}
              </span>
              <span className="block truncate font-display text-sm sm:text-base">
                Ch. {chapter.number} · {chapter.title}
              </span>
            </h1>
            <div role="group" aria-label="Reading mode" className="flex shrink-0 border-2 border-paper">
              {readingModes.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => switchMode(m)}
                  className={`min-h-9 px-2.5 text-xs font-semibold uppercase tracking-wider transition-colors sm:px-3 ${
                    mode === m ? "bg-paper text-ink-950" : "text-paper-muted hover:text-paper"
                  }`}
                >
                  {modeLabel[m]}
                </button>
              ))}
            </div>
          </div>
        </header>

        <nav
          aria-label="Reader"
          className={`fixed inset-x-0 bottom-0 z-50 border-t border-ink-700 bg-ink-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md ease-out motion-safe:transition-transform motion-safe:duration-300 ${visible ? "" : "translate-y-full"}`}
        >
          <div aria-hidden="true" className="h-1 bg-ink-700">
            <div
              ref={progressRef}
              className={`h-full scale-x-0 bg-accent motion-safe:transition-transform motion-safe:duration-150 ${rtl ? "origin-right" : "origin-left"}`}
            />
          </div>
          <div className="mx-auto grid h-14 max-w-site grid-cols-[1fr_auto_1fr] items-center gap-2 px-gutter lg:px-gutter-lg">
            <div className="flex justify-start">
              <ChapterLink target={previous} label="Previous chapter" prefix="←" />
            </div>

            <div className="flex items-center gap-1">
              {mode === "manga" && (
                <PageButton
                  label={rtl ? "Next page" : "Previous page"}
                  disabled={rtl ? atEnd : page === 0}
                  onClick={() => setPage((p) => Math.min(total, Math.max(0, p + (rtl ? 1 : -1))))}
                >
                  ‹
                </PageButton>
              )}
              <span className="min-w-16 text-center text-sm font-semibold tabular-nums text-paper-muted">
                {counter}
              </span>
              {mode === "manga" && (
                <PageButton
                  label={rtl ? "Previous page" : "Next page"}
                  disabled={rtl ? page === 0 : atEnd}
                  onClick={() => setPage((p) => Math.min(total, Math.max(0, p + (rtl ? -1 : 1))))}
                >
                  ›
                </PageButton>
              )}
              {mode === "manga" && (
                <button
                  type="button"
                  onClick={() => setDirection(direction === "rtl" ? "ltr" : "rtl")}
                  aria-label={`Reading direction: ${direction === "rtl" ? "right to left" : "left to right"}. Switch.`}
                  title="Switch reading direction"
                  className="ml-1 min-h-9 border border-ink-600 px-2 text-xs font-semibold uppercase tracking-wider text-paper-muted transition-colors hover:border-paper hover:text-paper"
                >
                  {direction === "rtl" ? "RTL" : "LTR"}
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <ChapterLink target={next} label="Next chapter" suffix="→" />
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

function ChapterLink({
  target,
  label,
  prefix,
  suffix,
}: {
  target?: ReaderData["next"];
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  const content = (
    <>
      {prefix && <span aria-hidden="true">{prefix}</span>}
      <span>
        <span className="sm:hidden">Ch. {target?.number ?? "—"}</span>
        <span className="hidden sm:inline">{target ? `Ch. ${target.number}` : label}</span>
      </span>
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </>
  );
  const classes = "flex min-h-11 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider";
  if (!target) {
    return (
      <span aria-hidden="true" className={`${classes} invisible`}>
        {content}
      </span>
    );
  }
  return (
    <Link
      href={target.href}
      aria-label={`${label}: chapter ${target.number}, ${target.title}`}
      title={target.title}
      className={`${classes} text-paper-muted transition-colors hover:text-accent`}
    >
      {content}
    </Link>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center text-2xl text-paper-muted transition-colors hover:text-accent disabled:opacity-30 disabled:hover:text-paper-muted"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
