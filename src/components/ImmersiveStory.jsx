import { useEffect, useRef, useState } from "react";
import { Aperture } from "lucide-react";

// Art direction rule: the `landscape` file must be a genuinely landscape-
// oriented photo (it fills wide/desktop screens), and `portrait` a genuinely
// portrait one, served to narrow/tall screens. Never one file for both — a
// browser centre-crop of a wide frame on a phone keeps about a third of its
// width, which is what cut the subjects out of it and is the whole reason
// the pairs exist.
//
// Where a chapter's subject was only shot wide, its `-tall` file is a 2:3
// slice recomposed from that same master, so both orientations are one frame
// seen two ways. Chapter one is the exception: both of its files are natively
// shot in their own orientation, so it pairs two different photographs that
// carry the same beat rather than two crops of one.
const STORY = [
  {
    // The one chapter whose two orientations are different photographs rather
    // than two crops of one master. Everywhere else the pairing keeps the same
    // subject, so the frame reads as one moment seen two ways; here each file
    // is natively shot in its own orientation, so neither needs cropping to
    // fit its panel — but they are also genuinely different pictures, of
    // different things.
    //
    // That is why the caption is about the act of looking rather than about
    // what is in the frame. A single caption has to carry both orientations,
    // and no line describing bare feet at a waterline would survive being
    // read over a rain-beaded fuel tank. Framed around the photographer's
    // decision to move in close, it fits either, because both are that
    // decision — which is also what makes them one chapter.
    landscape: "/images/gallery/portrait-swetha-05.webp", // 1920x1280
    portrait: "/images/gallery/auto-02.webp", // 1920x3418
    tag: "The Beginning",
    caption: "It starts with looking closer than anyone else would.",
  },
  {
    landscape: "/images/gallery/portrait-nithin-02.webp", // 1920x1280
    portrait: "/images/gallery/portrait-nithin-02-tall.webp", // 1280x1920
    tag: "The Quiet",
    caption: "Some moments only ask to be witnessed.",
  },
  {
    landscape: "/images/gallery/couple-04.webp", // 1920x840
    portrait: "/images/gallery/couple-04-tall.webp", // 1280x1920
    tag: "The Light",
    caption: "Afternoon light, and someone completely at ease in it.",
  },
  {
    landscape: "/images/gallery/auto-06.webp", // 1920x1276
    portrait: "/images/gallery/auto-06-tall.webp", // 1280x1920
    tag: "The Detail",
    caption: "And the last frame of the night, still warm.",
  },
];

const N = STORY.length;

// Smoothstep — turns a raw linear scroll fraction into an eased curve so
// each transition accelerates in and settles out instead of moving 1:1
// with the scrollbar.
function ease(t) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

const NARROW = "(max-width: 767px)";

export default function ImmersiveStory() {
  const containerRef = useRef(null);
  const panelRefs = useRef([]);
  const innerRefs = useRef([]);
  const bladeTopRef = useRef(null);
  const bladeBottomRef = useRef(null);
  const barRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  // Source selection is done here rather than with <picture><source media>.
  // The browser resolves a <picture> once, when the image begins loading, and
  // will happily keep serving the narrow-screen file to a desktop-width
  // viewport afterwards — which put a 2:3 portrait inside a 16:9 panel and
  // cropped the subjects' heads clean off. matchMedia re-evaluates reliably.
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(NARROW).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    // Track both the media-query event and a plain resize: the MQL `change`
    // event is the precise signal, but it can be missed in embedded/emulated
    // viewports, and serving the wrong orientation is exactly the bug this
    // replaced. React bails out when the value is unchanged, so the extra
    // resize check costs nothing.
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ticking = false;

    // Everything this writes is either `transform` or `opacity`, and that is
    // deliberate rather than incidental.
    //
    // The previous version drove the transition with an animated
    // `clip-path: circle()` iris plus `filter: blur()` / `grayscale()` on
    // full-viewport images, recomputed on every scroll event. Both of those
    // properties force the compositor to re-rasterise the layer from scratch
    // on every single frame — a blur additionally runs a separable
    // convolution over the whole viewport — so the section was asking the
    // main thread to redraw two full-screen images per frame for the entire
    // length of a four-screen scroll. That is the jank, and no amount of
    // scheduling fixes it, because the work itself is the problem.
    //
    // Transform and opacity are the two properties a compositor can animate
    // without redrawing anything: the layer is rasterised once and then just
    // re-positioned and re-blended on the GPU. The shutter, the depth, the
    // drift and the hand-off below are all built out of only those two, so
    // the per-frame cost is a handful of style writes rather than a
    // full-screen repaint.
    function paint() {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height - vh;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

      const raw = progress * N;
      const idx = Math.min(N - 1, Math.floor(raw));
      const local = raw - idx;

      for (let i = 0; i < panelRefs.current.length; i += 1) {
        const panel = panelRefs.current[i];
        const inner = innerRefs.current[i];
        if (!panel) continue;

        if (reduced) {
          panel.style.opacity = i === idx ? "1" : "0";
          panel.style.transform = "";
          if (inner) inner.style.transform = "";
          continue;
        }

        // Alternating horizontal drift, so consecutive chapters don't all
        // travel the same way and the sequence doesn't read as a slideshow.
        const sway = i % 2 === 0 ? 1 : -1;

        if (i === idx) {
          // Incoming frame rises into the gate and settles, then keeps
          // creeping for the rest of its dwell so it is never fully static
          // while its caption is being read. Chapter 0 skips the entrance —
          // it is what's already on screen when the section is reached.
          const enter = idx === 0 ? 1 : ease(Math.min(1, local / 0.4));
          const creep = ease(local);
          panel.style.opacity = "1";
          panel.style.transform =
            `translate3d(${(1 - enter) * sway * 2.5}%, ${(1 - enter) * 9}%, 0) ` +
            `scale(${(1.085 - enter * 0.085 + creep * 0.055).toFixed(4)})`;
          if (inner) {
            // Counter-motion inside the frame: the photo lags the panel it
            // sits in, which is what reads as depth rather than a slide.
            inner.style.transform = `translate3d(0, ${((1 - enter) * -4.5).toFixed(3)}%, 0)`;
          }
        } else if (i === idx - 1) {
          // Outgoing frame recedes behind the incoming one as the shutter
          // sweeps back open, rather than cross-dissolving in place.
          const out = ease(Math.min(1, local / 0.55));
          panel.style.opacity = String(1 - out);
          panel.style.transform =
            `translate3d(${out * sway * -2}%, ${out * -6.5}%, 0) ` +
            `scale(${(1.055 + out * 0.075).toFixed(4)})`;
          if (inner) inner.style.transform = `translate3d(0, ${(out * 3).toFixed(3)}%, 0)`;
        } else {
          panel.style.opacity = "0";
          panel.style.transform = "scale(1.085)";
          if (inner) inner.style.transform = "";
        }
      }

      // Shutter blades. Two solid bands hinged off the top and bottom edges,
      // scaled on Y only. At a chapter boundary they meet over the middle
      // (0.52 each, so they overlap rather than leaving a seam) and then
      // sweep back open across the first third of the new chapter's dwell —
      // the frame is literally revealed by a shutter rather than faded in.
      // `scaleY` on a solid colour is the cheapest possible way to draw this:
      // no repaint, just a re-composite.
      const blade = reduced || idx === 0 ? 0 : 0.52 * (1 - ease(Math.min(1, local / 0.3)));
      if (bladeTopRef.current) bladeTopRef.current.style.transform = `scaleY(${blade.toFixed(4)})`;
      if (bladeBottomRef.current) bladeBottomRef.current.style.transform = `scaleY(${blade.toFixed(4)})`;

      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;

      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    }

    // Coalesces a burst of scroll events into one paint per frame. A fling
    // can deliver scroll events faster than the screen refreshes, and each
    // one here does a `getBoundingClientRect` (a forced layout) before it
    // writes; without this the section pays for that read several times
    // between frames that nobody ever sees.
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        paint();
      });
    }

    // While the tab is hidden the browser stops delivering scroll events, so
    // these imperative styles go stale. Returning to the page (tab switch,
    // app switch, or a bfcache restore) would otherwise leave the sequence
    // frozen mid-transition — a half-open shutter stuck on screen until the
    // next manual scroll. These fire far less often than `scroll`, so they
    // call `paint` directly rather than going through the rAF gate.
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", paint);
    document.addEventListener("visibilitychange", paint);
    window.addEventListener("pageshow", paint);
    window.addEventListener("focus", paint);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", paint);
      document.removeEventListener("visibilitychange", paint);
      window.removeEventListener("pageshow", paint);
      window.removeEventListener("focus", paint);
    };
  }, [isNarrow]);

  function goTo(i) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = Math.max(1, rect.height - vh);
    const targetTop = window.scrollY + rect.top + (total * (i + 0.5)) / N;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${N * 100}vh` }}
      aria-label="Photo story"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        {/* No permanent `will-change` here: it would keep every full-screen
            panel promoted to its own GPU layer for the life of the page, which
            is a lot of compositor memory to re-rasterise when the tab is
            restored from the background. The `translate3d` written by `paint`
            promotes whichever panels are actually moving, only while they are
            moving, which is the part that matters. */}
        {STORY.map((item, i) => (
          <div
            key={item.tag}
            ref={(el) => (panelRefs.current[i] = el)}
            className="absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0, transform: "scale(1.085)" }}
          >
            <div ref={(el) => (innerRefs.current[i] = el)} className="absolute inset-0">
              <img
                src={isNarrow ? item.portrait : item.landscape}
                alt=""
                className="object-face h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/5" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/25 via-transparent to-ink/15" />
            </div>
          </div>
        ))}

        {/* Shutter blades — hinged off each edge, scaled on Y by `paint`.
            z-[15] puts them above the photos but below the viewfinder
            furniture, so the frame markings stay visible through the sweep. */}
        <div
          ref={bladeTopRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-full origin-top bg-ink"
          style={{ transform: "scaleY(0)" }}
        />
        <div
          ref={bladeBottomRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-full origin-bottom bg-ink"
          style={{ transform: "scaleY(0)" }}
        />

        {/* camera flash — plays once on every chapter change */}
        <div key={`flash-${active}`} className="animate-camera-flash pointer-events-none absolute inset-0 z-20 bg-ivory" />

        {/* viewfinder frame — static, ties the sequence back to the shutter mark */}
        <div className="pointer-events-none absolute inset-6 z-20 sm:inset-10">
          <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-gold/40" />
          <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-gold/40" />
          <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-gold/40" />
          <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-gold/40" />
        </div>

        {/* letterbox bars — permanent thin cinematic frame */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-3 bg-ink sm:h-4" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-3 bg-ink sm:h-4" />

        {/* progress rail with per-chapter tick marks. Driven by scaleX rather
            than width so it composites alongside everything else instead of
            laying out a box on every frame. */}
        <div className="absolute inset-x-0 top-3 z-20 h-[2px] bg-ivory/10 sm:top-4">
          <div
            ref={barRef}
            className="h-full origin-left bg-gradient-to-r from-gold-dark via-gold to-gold-light"
            style={{ width: "100%", transform: "scaleX(0)" }}
          />
          <div className="pointer-events-none absolute inset-0 flex">
            {STORY.map((item) => (
              <span key={item.tag} className="flex-1 border-r border-ink/60 last:border-r-0" />
            ))}
          </div>
        </div>

        {/* chapter counter + shutter icon, top left */}
        <div className="absolute left-6 top-9 z-20 flex items-center gap-3 sm:left-10 sm:top-11">
          <Aperture key={`icon-${active}`} className="animate-shutter-click text-gold" size={22} strokeWidth={1.5} />
          <span key={active} className="animate-tag-in font-poster block text-4xl text-ivory/90 sm:text-5xl">
            {String(active + 1).padStart(2, "0")}
            <span className="ml-1 text-lg text-ivory-dim/50 sm:text-xl">/ {String(N).padStart(2, "0")}</span>
          </span>
        </div>

        {/* caption */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-16 sm:px-16 sm:pb-20">
          <div key={active} className="animate-caption-in">
            <span className="tag-label text-gold">{STORY[active].tag}</span>
            <p className="mt-4 max-w-2xl font-heading text-3xl italic leading-snug text-ivory sm:text-5xl">
              {STORY[active].caption}
            </p>
          </div>
        </div>

        {/* chapter dots, clickable */}
        <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-4 sm:right-10 sm:flex">
          {STORY.map((item, i) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => goTo(i)}
              className="group flex items-center gap-3"
              aria-label={`Go to ${item.tag}`}
            >
              <span className="tag-label text-ivory-dim/0 transition-colors duration-300 group-hover:text-ivory-dim/70">
                {item.tag}
              </span>
              <span
                className="h-8 w-px transition-colors duration-500"
                style={{ backgroundColor: i === active ? "var(--color-gold)" : "rgba(246,240,224,0.2)" }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
