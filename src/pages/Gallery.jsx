import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Aperture, ArrowUpRight, ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import SplitText from "@/components/SplitText";
import Lightbox from "@/components/Lightbox";
import LeafDecor from "@/components/LeafDecor";
import { cn } from "@/lib/utils";
import { CATEGORIES, PHOTOS } from "@/data/photos";

// The archive is read like a printed index rather than browsed as a grid:
// a numbered list of every frame on one side, and a single large plate on the
// other that changes to whatever line you're reading. Narrow screens can't
// hold two columns, so there the plate is inlined into each row instead and
// the list becomes a full-bleed reel.
export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get("cat");
  const [category, setCategory] = useState(
    CATEGORIES.some((c) => c.id === initialCat) ? initialCat : "all"
  );
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeRow, setActiveRow] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const rowRefs = useRef([]);
  const frameRefs = useRef([]);
  const filterWrapRef = useRef(null);
  const archiveRef = useRef(null);
  const isFirstCategory = useRef(true);

  const filtered = useMemo(
    () => (category === "all" ? PHOTOS : PHOTOS.filter((p) => p.category === category)),
    [category]
  );

  // Whichever row is crossing the middle band of the viewport becomes the
  // active one, so the plate tracks reading position while scrolling.
  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, filtered.length);
    frameRefs.current = frameRefs.current.slice(0, filtered.length);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveRow(Number(entry.target.dataset.index));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    rowRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  // A category with far fewer photos than the one you were just reading can
  // produce a page much shorter than your current scroll position — filtering
  // "All" (136 photos) down to a small category while scrolled deep into the
  // list left nowhere for that scroll offset to go once the page shrank
  // underneath it, so the browser clamped it straight to the new bottom.
  //
  // This has to run as its own effect, *after* the shorter list has already
  // committed to the DOM — not synchronously inside the click handler. Doing
  // it in the handler meant calling `scrollIntoView` while the page was still
  // its old (tall) height; the clamp then happened moments later as React's
  // render landed, and that forced, unrelated scroll adjustment interrupted
  // the smooth-scroll animation already in flight, stranding it wherever the
  // clamp left off — the bottom. Running after commit means any clamping the
  // browser was going to do has already happened by the time this fires, so
  // the scroll below starts clean from wherever that left it, with nothing
  // left to interrupt it partway through.
  useEffect(() => {
    setActiveRow(0);
    if (isFirstCategory.current) {
      isFirstCategory.current = false;
      return;
    }
    // Instant rather than smooth: a smooth animation computes its target
    // once but keeps sampling the page as it plays, and any lazy-loaded
    // image below the fold shifting layout mid-scroll could tug the
    // animation off course the same way the original clamp did. Instant
    // reads the position once and is done, with no window for that.
    archiveRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [category]);

  // Mobile-only rack-focus reveal. Desktop tracks reading position with a
  // sticky plate that has room to breathe beside the list; below `lg` there's
  // no second column for it, so each row was just a flat static card — no
  // sense this is a *camera* archive rather than any other list.
  //
  // This replaces an earlier version that kept every nearby card's 3D tilt
  // continuously locked to scroll position — recomputed on every scroll tick
  // via direct style writes. Even windowed to a handful of rows and batched
  // through requestAnimationFrame, it was still real per-frame JS work
  // competing with the browser for the same main thread the fixed masthead
  // repaints on, and it showed: stutter in the cards, and a header that
  // visibly lagged behind the scroll. A one-shot reveal can't cause that
  // class of problem, because after it plays once there's nothing left
  // running — no listener, no per-frame recompute. Each card starts tilted
  // back, receded and soft, like a shot still finding focus, and settles
  // level, full-size and sharp the first time it scrolls into view; the
  // viewfinder brackets snap tight a beat later, like an AF box confirming
  // lock. The motion itself is plain CSS transitions (see `.gallery-frame`
  // in index.css) — this effect's only job is toggling one class per card,
  // once, via a single shared IntersectionObserver rather than ~136
  // individual ones.
  //
  // No matchMedia gate: these cards are `lg:hidden`, so on desktop they're
  // `display:none` and never satisfy `isIntersecting` regardless — observing
  // them there is free. That also sidesteps a real bug a width check would
  // introduce: mount on a wide screen (gate skips setup) then resize down to
  // mobile without a reload, and no observer would ever exist to reveal
  // anything. Leaving it running lets the same observer just start firing
  // once the cards actually become visible.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      frameRefs.current.forEach((el) => el?.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    frameRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  // Closes the mobile category dropdown on an outside tap or Escape. No
  // dimming backdrop element — that would need `position: fixed`, and the
  // roll-selector section above is `translateZ(0)` for the iOS compositing
  // fix, which makes it a containing block that a fixed descendant would be
  // trapped inside instead of covering the viewport. A plain document-level
  // listener sidesteps that entirely.
  useEffect(() => {
    if (!filterOpen) return undefined;
    function onPointerDown(e) {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setFilterOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  function selectCategory(id) {
    setCategory(id);
    setParams(id === "all" ? {} : { cat: id }, { replace: true });
  }

  function openPhoto(slug) {
    setLightboxIndex(PHOTOS.findIndex((p) => p.slug === slug));
  }

  const plate = filtered[activeRow] ?? filtered[0];
  const activeCategory = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];

  return (
    <div className="pt-28 sm:pt-32">
      {/* MASTHEAD */}
      <section className="relative overflow-hidden">
        <LeafDecor className="-right-28 -top-10 z-0" size={360} rotate={22} speed={0.2} opacity={0.35} />
        <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-6 lg:px-10">
          <Reveal>
            <span className="tag-label text-gold">The Archive</span>
          </Reveal>
          <h1 className="font-poster mt-4 text-[15vw] leading-[0.85] text-ivory sm:text-[9vw] lg:text-[6.5vw]">
            <SplitText text="Every Story" />
            <br />
            <SplitText text="We've Framed" delay={0.15} wordClassName="text-gradient-gold" />
          </h1>
          <Reveal delay={0.3} className="mt-6 max-w-sm text-sm text-ivory-dim">
            Read the index, or open any frame full-screen. Weddings, portraits
            and couple sessions from across Kerala.
          </Reveal>
        </div>
      </section>

      {/* ROLL SELECTOR */}
      {/* top offset tracks the masthead's height (104px), so the roll bar
          parks directly beneath it instead of sliding under or leaving a gap.
          `[transform:translateZ(0)]` forces its own compositing layer —
          `sticky` plus `backdrop-filter` can drift out of sync with scrolling
          on iOS. No `backdrop-blur` here any more, matching the masthead
          above: a `backdrop-filter` on a bar that's stuck on screen for most
          of the page's height means resampling everything scrolling underneath
          it on every frame, for the entire scroll — a real, continuous cost
          confirmed contributing to dropped frames during scroll on both a
          real phone and a resized desktop window. Bumped to the same 95%
          opacity as the masthead so it reads just as solid without it. */}
      <section className="sticky top-[104px] z-30 -mt-px border-y border-gold/10 bg-forest/95 [transform:translateZ(0)]">
        <div className="mx-auto max-w-7xl">
          {/* MOBILE — a collapsed trigger showing only the active category,
              expanding into a grid on tap. Replaces an earlier horizontally-
              scrolling strip: that was the only sideways-scrollable element
              on the site, nested inside a page that also scrolls vertically,
              and on iOS a swipe reaching its scroll edge could chain onto
              the page's own scroll and visibly unsettle the fixed masthead
              above it. A trigger + dropdown has nothing to swipe sideways at
              all, so there's nothing left to chain. */}
          <div ref={filterWrapRef} className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
              aria-expanded={filterOpen}
              className="flex w-full items-center gap-3 px-6 py-3.5 text-left"
            >
              <Aperture size={16} className="shrink-0 text-gold/70" strokeWidth={1.5} />
              <span className="font-mono truncate text-[11px] uppercase tracking-[0.16em] text-ivory">
                {activeCategory.label}
              </span>
              <span className="font-mono ml-auto shrink-0 text-[10px] text-ivory-dim/40">
                {String(filtered.length).padStart(2, "0")} Frames
              </span>
              <ChevronDown
                size={15}
                className={cn(
                  "shrink-0 text-gold/70 transition-transform duration-300 ease-out",
                  filterOpen && "rotate-180"
                )}
              />
            </button>

            {/* A grid rather than a list: nine categories fit in five short
                rows with nothing to scroll to reach. Each pill fades and
                lifts in with a slight stagger on open — the panel itself
                unfolds from the trigger via `scale-y` on the wrapper below,
                so this is a second, finer layer of motion on top of that,
                not a substitute for it. Plain CSS transitions throughout —
                no scroll listener, no per-frame work, nothing that can
                repeat the jank the previous scroll-linked effects caused. */}
            <div
              className={cn(
                "absolute inset-x-0 top-full origin-top border-b border-gold/10 bg-forest/95 backdrop-blur-xl transition-[transform,opacity] duration-300 ease-out",
                filterOpen ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-0 opacity-0"
              )}
            >
              <div className="grid grid-cols-2 gap-2 p-4">
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      selectCategory(cat.id);
                      setFilterOpen(false);
                    }}
                    style={filterOpen ? { transitionDelay: `${i * 25}ms` } : undefined}
                    className={cn(
                      "rounded-md px-3.5 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300 ease-out",
                      filterOpen ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                      category === cat.id
                        ? "bg-gold text-forest"
                        : "bg-forest-soft/50 text-ivory-dim hover:text-ivory"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP — unchanged: every label visible at once, wrapping
              rather than collapsing, since there's room for it here and it
              never had a scroll or sticky-drift problem to solve. */}
          <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-x-3 lg:gap-y-3 lg:px-10 lg:py-4">
            <Aperture size={16} className="shrink-0 text-gold/70" strokeWidth={1.5} />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                  category === cat.id ? "text-forest" : "text-ivory-dim hover:text-ivory"
                )}
              >
                {category === cat.id && (
                  <motion.span
                    layoutId="gallery-filter-pill"
                    className="glow-gold absolute inset-0 rounded-full bg-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{cat.label}</span>
              </button>
            ))}
            <span className="font-mono ml-auto text-xs text-ivory-dim/40">
              {String(filtered.length).padStart(2, "0")} Frames
            </span>
          </div>
        </div>
      </section>

      {/* SPLIT ARCHIVE */}
      {/* `scroll-mt` matches the fixed header + sticky roll bar (roughly
          148px stacked on mobile, ~166px on desktop) so scrolling here via
          `selectCategory` lands just below them instead of underneath. */}
      <section
        ref={archiveRef}
        className="mx-auto max-w-7xl scroll-mt-[150px] px-6 pb-32 pt-12 lg:scroll-mt-[190px] lg:px-10"
      >
        <div className="lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
          {/* PLATE — desktop only, follows the reading position */}
          <div className="hidden lg:sticky lg:top-[184px] lg:block">
            {/* sized off the viewport minus the masthead + roll bar + the meta
                row below, so the whole sticky block always fits on screen —
                including short laptop displays */}
            <div className="relative h-[calc(100vh-250px)] max-h-[640px] min-h-[360px] overflow-hidden rounded-sm bg-forest-deep">
              {plate && (
                <img
                  key={plate.slug}
                  src={plate.src}
                  alt={plate.alt}
                  className="animate-preview-in object-face h-full w-full object-cover"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent" />

              {/* viewfinder brackets */}
              <div className="pointer-events-none absolute inset-5">
                <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-gold/50" />
                <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-gold/50" />
                <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-gold/50" />
                <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-gold/50" />
              </div>

              {plate && (
                <div key={`cap-${plate.slug}`} className="animate-caption-in absolute inset-x-0 bottom-0 p-8">
                  <span className="tag-label text-gold">{plate.category}</span>
                  <p className="mt-2 font-heading text-3xl italic text-ivory">{plate.title}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-xs text-ivory-dim/50">
                Frame {String(activeRow + 1).padStart(2, "0")} of {String(filtered.length).padStart(2, "0")}
              </span>
              <div className="h-px flex-1 mx-5 bg-forest-line/60">
                <div
                  className="h-full bg-gradient-to-r from-gold-dark to-gold transition-[width] duration-500 ease-out"
                  style={{ width: `${((activeRow + 1) / Math.max(1, filtered.length)) * 100}%` }}
                />
              </div>
              {plate && (
                <button
                  type="button"
                  onClick={() => openPhoto(plate.slug)}
                  className="tag-label inline-flex items-center gap-1.5 text-gold transition-colors hover:text-gold-light"
                >
                  Open
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>
          </div>

          {/* INDEX */}
          <ol className="relative">
            {filtered.map((photo, i) => {
              const isActive = i === activeRow;
              return (
                <li
                  key={`${category}-${photo.slug}`}
                  ref={(el) => (rowRefs.current[i] = el)}
                  data-index={i}
                >
                  <button
                    type="button"
                    onClick={() => openPhoto(photo.slug)}
                    onMouseEnter={() => setActiveRow(i)}
                    onFocus={() => setActiveRow(i)}
                    className="group block w-full text-left"
                  >
                    {/* Narrow screens have no second column for the plate, so
                        each frame becomes the plate: full-bleed, near
                        full-height, captioned in place, and rack-focuses into
                        view the first time it scrolls on screen (see
                        `.gallery-frame` in index.css for the transition). */}
                    <div className="relative -mx-6 mb-10 lg:hidden" style={{ perspective: 1000 }}>
                      <div
                        ref={(el) => (frameRefs.current[i] = el)}
                        className="gallery-frame relative overflow-hidden"
                        style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
                      >
                        {/* Shown at the frame's own ratio, so nothing is
                            cropped and the subject stays composed exactly as
                            shot — a fixed height here pushed off-centre
                            subjects out of frame, since every photo places
                            them differently. */}
                        <img
                          src={photo.thumb}
                          alt={photo.alt}
                          loading={i < 2 ? "eager" : "lazy"}
                          style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
                          className="gallery-frame-photo w-full object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/20" />

                        {/* viewfinder brackets, matching the desktop plate —
                            here they double as an autofocus box, snapping
                            tight a beat after the photo settles rather than
                            sitting at a fixed opacity */}
                        <div className="gallery-frame-bracket pointer-events-none absolute inset-4">
                          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-gold/70" />
                          <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-gold/70" />
                          <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-gold/70" />
                          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-gold/70" />
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-7">
                          <span className="font-mono text-xs text-gold">
                            {String(i + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
                          </span>
                          <p className="mt-1.5 font-heading text-3xl italic leading-tight text-ivory">
                            {photo.title}
                          </p>
                          <span className="tag-label mt-1.5 block text-ivory-dim/70">{photo.category}</span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "hidden items-baseline gap-4 border-b py-4 transition-colors duration-300 lg:flex lg:py-5",
                        isActive ? "border-gold/40" : "border-forest-line/40"
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono w-7 shrink-0 text-xs transition-colors duration-300",
                          isActive ? "text-gold" : "text-ivory-dim/35"
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-heading min-w-0 flex-1 truncate text-xl italic transition-all duration-300 lg:text-2xl",
                          isActive ? "translate-x-1 text-gold" : "text-ivory"
                        )}
                      >
                        {photo.title}
                      </span>
                      <span
                        className={cn(
                          "tag-label hidden shrink-0 transition-colors duration-300 sm:block",
                          isActive ? "text-ivory-dim/80" : "text-ivory-dim/35"
                        )}
                      >
                        {photo.category}
                      </span>
                      <ArrowUpRight
                        size={15}
                        className={cn(
                          "shrink-0 transition-all duration-300",
                          isActive
                            ? "translate-x-0 text-gold opacity-100"
                            : "-translate-x-1 text-ivory-dim opacity-0"
                        )}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {filtered.length === 0 && (
          <p className="py-20 text-center text-ivory-dim">No photos in this category yet.</p>
        )}
      </section>

      <Lightbox
        photos={PHOTOS}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
