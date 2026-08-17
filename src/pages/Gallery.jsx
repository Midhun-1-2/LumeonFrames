import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Aperture, ArrowUpRight } from "lucide-react";
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
  const rowRefs = useRef([]);

  const filtered = useMemo(
    () => (category === "all" ? PHOTOS : PHOTOS.filter((p) => p.category === category)),
    [category]
  );

  // Whichever row is crossing the middle band of the viewport becomes the
  // active one, so the plate tracks reading position while scrolling.
  useEffect(() => {
    rowRefs.current = rowRefs.current.slice(0, filtered.length);
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

  useEffect(() => {
    setActiveRow(0);
  }, [category]);

  function selectCategory(id) {
    setCategory(id);
    setParams(id === "all" ? {} : { cat: id }, { replace: true });
  }

  function openPhoto(slug) {
    setLightboxIndex(PHOTOS.findIndex((p) => p.slug === slug));
  }

  const plate = filtered[activeRow] ?? filtered[0];

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
          parks directly beneath it instead of sliding under or leaving a gap */}
      <section className="sticky top-[104px] z-30 -mt-px border-y border-gold/10 bg-forest/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          {/* Nine labels used to wrap into a three-row block on narrow
              screens — a lot of vertical weight for a filter bar that's
              sticky and eating into the reading area below it. Below `lg`
              this becomes one row that scrolls sideways instead of stacking;
              `lg` keeps the original wrapping row exactly as it was, since
              it never had the problem. Both share the same button elements
              (only the wrapper classes differ) so there's one `layoutId` for
              the active-pill highlight, not two competing copies. */}
          <div
            className={cn(
              "no-scrollbar flex items-center gap-2 overflow-x-auto px-6 py-3",
              "[mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-28px),transparent)]",
              "lg:flex-wrap lg:gap-x-3 lg:gap-y-3 lg:overflow-visible lg:px-10 lg:py-4 lg:[mask-image:none]"
            )}
          >
            <Aperture size={16} className="hidden shrink-0 text-gold/70 lg:block" strokeWidth={1.5} />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  "relative shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                  "lg:px-4 lg:py-2 lg:text-[11px] lg:tracking-[0.18em]",
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
            <span className="font-mono hidden shrink-0 text-xs text-ivory-dim/40 lg:ml-auto lg:block">
              {String(filtered.length).padStart(2, "0")} Frames
            </span>
          </div>

          {/* frame count moves down here on mobile: inside the scroll strip
              it would scroll out of view instead of staying put like `ml-auto`
              keeps it on desktop */}
          <div className="flex justify-end px-6 pb-2.5 lg:hidden">
            <span className="font-mono text-[10px] text-ivory-dim/40">
              {String(filtered.length).padStart(2, "0")} Frames
            </span>
          </div>
        </div>
      </section>

      {/* SPLIT ARCHIVE */}
      <section className="mx-auto max-w-7xl px-6 pb-32 pt-12 lg:px-10">
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
                        full-height, captioned in place. */}
                    <div className="relative -mx-6 mb-8 overflow-hidden lg:hidden">
                      {/* Shown at the frame's own ratio, so nothing is cropped
                          and the subject stays composed exactly as shot — a
                          fixed height here pushed off-centre subjects out of
                          frame, since every photo places them differently. */}
                      <img
                        src={photo.thumb}
                        alt={photo.alt}
                        loading={i < 2 ? "eager" : "lazy"}
                        style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
                        className="w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/20" />

                      {/* viewfinder brackets, matching the desktop plate */}
                      <div className="pointer-events-none absolute inset-4">
                        <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-gold/50" />
                        <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-gold/50" />
                        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-gold/50" />
                        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-gold/50" />
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
