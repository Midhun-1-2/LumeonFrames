import { useEffect, useRef, useState } from "react";
import { Aperture } from "lucide-react";

// Art direction rule: the `landscape` file must be a genuinely landscape-
// oriented photo (it fills wide/desktop screens), and `portrait` must be a
// genuinely portrait one of the SAME person, served to narrow/tall screens.
//
// The library only holds eight landscape-orientation files, covering four
// subjects (one of which is an unrelated macro shot). Those subjects are
// spread across the hero, this sequence and the closing banner without any
// face appearing twice — which is what caps this at two chapters. Adding more
// landscape photos is all it takes to extend it.
const STORY = [
  {
    // This couple was only ever shot wide, so the narrow-screen frame is a 2:3
    // slice cut from the same master and centred on them — same moment, same
    // people, just recomposed rather than centre-cropped by the browser.
    landscape: "/images/gallery/engagement-04.webp", // 1920x1280
    portrait: "/images/gallery/engagement-04-tall.webp", // 1280x1920
    tag: "The Vows",
    caption: "Every ceremony begins with a held breath.",
  },
  {
    // Also shot only in landscape — narrow screens get a 2:3 slice recomposed
    // from the same master rather than a browser centre-crop.
    landscape: "/images/gallery/portrait-nithin-01.webp", // 1920x1280
    portrait: "/images/gallery/portrait-nithin-01-tall.webp", // 1280x1920
    tag: "The Quiet",
    caption: "Some moments only ask to be witnessed.",
  },
  {
    landscape: "/images/gallery/portrait-swetha-05.webp", // 1920x1280
    portrait: "/images/gallery/portrait-swetha-04.webp", // 1920x2880
    tag: "The Shore",
    caption: "Where land meets water, and light finds its way in.",
  },
  {
    landscape: "/images/gallery/wedding-03.webp", // 1920x1280
    portrait: "/images/gallery/wedding-06.webp", // 1920x2880
    tag: "Forever",
    caption: "And then — forever, framed.",
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
    function update() {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height - vh;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

      const raw = progress * N;
      const idx = Math.min(N - 1, Math.floor(raw));
      const local = raw - idx;

      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;

        if (i === idx) {
          // Incoming frame: a camera-iris wipe opens from center over the
          // first half of its dwell, while the photo racks into focus
          // (starts soft, sharpens) — then settles into a slow eased
          // Ken Burns creep for the rest of the scroll distance. Chapter 0
          // has nothing to open over (it's what's already on screen at
          // page load), so it skips the iris and focus pull entirely.
          const iris = idx === 0 ? 1 : ease(Math.min(1, local / 0.45));
          const focus = idx === 0 ? 1 : ease(Math.min(1, local / 0.32));
          const zoom = ease(local);
          const drift = (ease(local) - 0.5) * 3;

          panel.style.clipPath = idx === 0 ? "" : `circle(${iris * 120}% at 50% 50%)`;
          panel.style.opacity = "1";
          panel.style.filter = focus < 1 ? `blur(${(1 - focus) * 7}px)` : "";
          panel.style.transform = `scale(${1.05 + zoom * 0.09}) translate3d(${drift}%, 0, 0)`;
        } else if (i === idx - 1) {
          // Outgoing frame: sits underneath the iris, fading, softening and
          // gently desaturating as it's covered less and less.
          const out = ease(Math.min(1, local / 0.6));
          panel.style.clipPath = "";
          panel.style.opacity = String(1 - out);
          panel.style.filter = out > 0.02 ? `blur(${out * 7}px) grayscale(${out * 35}%)` : "";
          panel.style.transform = `scale(${1.14 + out * 0.05})`;
        } else {
          panel.style.clipPath = "";
          panel.style.opacity = "0";
          panel.style.filter = "";
          panel.style.transform = "scale(1.05)";
        }
      });

      if (barRef.current) {
        barRef.current.style.width = `${progress * 100}%`;
      }

      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    }

    // While the tab is hidden the browser stops delivering scroll events, so
    // these imperative styles go stale. Returning to the page (tab switch,
    // app switch, or a bfcache restore) would otherwise leave the sequence
    // frozen mid-transition — a half-faded, half-blurred panel stuck on screen
    // until the next manual scroll. Re-sync on every way the page can come
    // back into view; update() is cheap enough to run unconditionally.
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pageshow", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pageshow", update);
      window.removeEventListener("focus", update);
    };
  }, []);

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
            restored from the background. */}
        {STORY.map((item, i) => (
          <div
            key={item.tag}
            ref={(el) => (panelRefs.current[i] = el)}
            className="absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0, transform: "scale(1.05)" }}
          >
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
        ))}

        {/* camera flash — plays once on every chapter change */}
        <div key={`flash-${active}`} className="animate-camera-flash pointer-events-none absolute inset-0 z-20 bg-ivory" />

        {/* viewfinder frame — static, ties the sequence back to the shutter mark */}
        <div className="pointer-events-none absolute inset-6 z-10 sm:inset-10">
          <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-gold/40" />
          <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-gold/40" />
          <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-gold/40" />
          <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-gold/40" />
        </div>

        {/* letterbox bars — permanent thin cinematic frame */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-3 bg-ink sm:h-4" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-3 bg-ink sm:h-4" />

        {/* progress rail with per-chapter tick marks */}
        <div className="absolute inset-x-0 top-3 z-10 h-[2px] bg-ivory/10 sm:top-4">
          <div ref={barRef} className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light" style={{ width: "0%" }} />
          <div className="pointer-events-none absolute inset-0 flex">
            {STORY.map((item) => (
              <span key={item.tag} className="flex-1 border-r border-ink/60 last:border-r-0" />
            ))}
          </div>
        </div>

        {/* chapter counter + shutter icon, top left */}
        <div className="absolute left-6 top-9 z-10 flex items-center gap-3 sm:left-10 sm:top-11">
          <Aperture key={`icon-${active}`} className="animate-shutter-click text-gold" size={22} strokeWidth={1.5} />
          <span key={active} className="animate-tag-in font-poster block text-4xl text-ivory/90 sm:text-5xl">
            {String(active + 1).padStart(2, "0")}
            <span className="ml-1 text-lg text-ivory-dim/50 sm:text-xl">/ {String(N).padStart(2, "0")}</span>
          </span>
        </div>

        {/* caption */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-16 sm:px-16 sm:pb-20">
          <div key={active} className="animate-caption-in">
            <span className="tag-label text-gold">{STORY[active].tag}</span>
            <p className="mt-4 max-w-2xl font-heading text-3xl italic leading-snug text-ivory sm:text-5xl">
              {STORY[active].caption}
            </p>
          </div>
        </div>

        {/* chapter dots, clickable */}
        <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-4 sm:right-10 sm:flex">
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
