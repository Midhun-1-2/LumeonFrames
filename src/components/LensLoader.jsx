import { useEffect, useState } from "react";

// Blade geometry is the same one verified for ApertureBand: six wedges hinged
// on the rim, each rotated about its own hinge. 0deg is fully shut; -30deg is
// as wide as they go before they swing off the disc and vanish.
const BLADES = 6;
const C = 100; // centre of the 200x200 viewBox
const R = 92; // rim radius
const OPEN_DEG = -30;

function polar(radius, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + radius * Math.cos(a), C + radius * Math.sin(a)];
}

const blades = Array.from({ length: BLADES }, (_, i) => {
  const angle = (360 / BLADES) * i;
  const [px, py] = polar(R, angle);
  const [qx, qy] = polar(R, angle + 118);
  return {
    d: `M ${px.toFixed(2)} ${py.toFixed(2)} A ${R} ${R} 0 0 1 ${qx.toFixed(2)} ${qy.toFixed(2)} L ${C} ${C} Z`,
    origin: `${px.toFixed(2)}px ${py.toFixed(2)}px`,
  };
});

const TICKS = Array.from({ length: 48 }, (_, i) => i * (360 / 48));

// Narrow to wide, so index 0 is the shut state and the last is wide open.
const STOPS = ["f/22", "f/16", "f/11", "f/8", "f/5.6", "f/4", "f/2.8", "f/2", "f/1.4"];
const WIDEST = STOPS.length - 1;

const MAX_BLUR = 24; // px of background blur at full aperture

const OPEN_MS = 1250;
const HOLD_MS = 260;
const CLOSE_MS = 1000;
const FADE_MS = 450;
const SEQ_MS = 60 + OPEN_MS + HOLD_MS + CLOSE_MS;
// Hard ceiling on the whole thing. A tab loaded in the background has its
// timers clamped to roughly 1Hz, which stretches the sequence badly; this
// guarantees the site is never sitting behind a loader that is still counting.
const DEADLINE_MS = 6000;

const EASE_OPEN = "cubic-bezier(0.16, 1, 0.3, 1)"; // glides open
const EASE_SHUT = "cubic-bezier(0.7, 0, 0.84, 0)"; // snaps shut, like a shutter

// Same art-direction rule as the rest of the site: a genuinely landscape file
// on wide screens, a genuinely portrait one on narrow. Both are cropped from
// the same frame and keep the cat's eye, so the subject never leaves the shot.
const NARROW = "(max-width: 767px)";
const BG_WIDE = "/images/loader/lens-wide.webp";
const BG_TALL = "/images/loader/lens-tall.webp";

// A wide aperture throws the background out of focus and a narrow one brings it
// back, so the blur here is not decoration — it is the same `openness` value
// that swings the blades. The f-stop scale is a strip translated by that value
// too, rather than a counter on its own timer: sharing one transition means
// the number, the opening and the defocus cannot drift apart.
export default function LensLoader() {
  // Grouped in one object so the value, its duration and its easing always
  // commit in the same render — split across three states, React could apply
  // the new angle while the previous leg's duration was still in effect.
  const [sweep, setSweep] = useState({ openness: 0, dur: OPEN_MS, ease: EASE_OPEN });
  const [seqDone, setSeqDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [pageReady, setPageReady] = useState(
    () => typeof document !== "undefined" && document.readyState === "complete"
  );
  const [skip] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  // matchMedia rather than <picture>: a <picture> resolves once when the image
  // starts loading and will keep serving the narrow-screen file at desktop
  // widths afterwards, which is exactly the bug this pattern replaced elsewhere.
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(NARROW).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Only the leg changes are scheduled here; CSS interpolates everything else.
  useEffect(() => {
    if (skip) {
      setGone(true);
      return undefined;
    }

    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    // A beat's grace so the first paint lands on the shut state — without it
    // the browser can collapse start and end into one style resolution and
    // skip the transition entirely.
    at(60, () => setSweep({ openness: 1, dur: OPEN_MS, ease: EASE_OPEN }));
    at(60 + OPEN_MS + HOLD_MS, () => setSweep({ openness: 0, dur: CLOSE_MS, ease: EASE_SHUT }));
    at(SEQ_MS, () => setSeqDone(true));

    return () => timers.forEach(clearTimeout);
  }, [skip]);

  useEffect(() => {
    if (pageReady) return undefined;
    const done = () => setPageReady(true);
    window.addEventListener("load", done);
    return () => window.removeEventListener("load", done);
  }, [pageReady]);

  // Leaves once the iris has shut and the page behind it is ready, or when the
  // deadline expires — whichever comes first. `leaving` is deliberately not a
  // dependency: adding it would re-run this on its own state change and the
  // cleanup would cancel the unmount timer it had just scheduled.
  useEffect(() => {
    if (gone) return undefined;
    const ready = seqDone && pageReady;
    const t = setTimeout(
      () => {
        setLeaving(true);
        setTimeout(() => setGone(true), FADE_MS);
      },
      ready ? 0 : DEADLINE_MS
    );
    return () => clearTimeout(t);
  }, [seqDone, pageReady, gone]);

  useEffect(() => {
    if (gone) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [gone]);

  if (skip || gone) return null;

  const { openness, dur, ease } = sweep;
  const motion = `${dur}ms ${ease}`;

  return (
    <div
      role="status"
      aria-live="polite"
      data-openness={openness}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink"
      style={{ opacity: leaving ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out` }}
    >
      <span className="sr-only">Loading Lumeon Frames</span>

      {/* Scaled past the edges because blur samples the transparent area
          outside the element, which would otherwise show as a soft dark frame. */}
      <img
        src={isNarrow ? BG_TALL : BG_WIDE}
        alt=""
        fetchPriority="high"
        data-loader-bg
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: `blur(${(openness * MAX_BLUR).toFixed(2)}px)`,
          transform: `scale(${(1.08 + openness * 0.07).toFixed(3)})`,
          transition: `filter ${motion}, transform ${motion}`,
        }}
      />
      {/* Constant tint: focus alone is tied to the aperture, so stopping down
          reads purely as the background resolving, not as it lighting up. */}
      <div className="pointer-events-none absolute inset-0 bg-ink/55" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />

      <div className="relative flex flex-col items-center px-6">
        <div className="relative w-[min(58vw,240px)]">
          <svg viewBox="0 0 200 200" className="w-full" aria-hidden="true">
            <defs>
              <radialGradient id="ll-glass" cx="38%" cy="30%" r="78%">
                <stop offset="0%" stopColor="#1d4a3d" />
                <stop offset="55%" stopColor="#0a201b" />
                <stop offset="100%" stopColor="#030907" />
              </radialGradient>
              <linearGradient id="ll-blade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1d3f36" />
                <stop offset="100%" stopColor="#0a201b" />
              </linearGradient>
              <clipPath id="ll-clip">
                <circle cx={C} cy={C} r={R} />
              </clipPath>
            </defs>

            <g className="animate-loader-ring origin-center">
              {TICKS.map((deg, i) => {
                const [x1, y1] = polar(99, deg);
                const [x2, y2] = polar(i % 4 === 0 ? 91 : 95, deg);
                return (
                  <line
                    key={deg}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--color-gold)"
                    strokeOpacity={i % 4 === 0 ? 0.55 : 0.22}
                    strokeWidth={i % 4 === 0 ? 1.4 : 0.8}
                  />
                );
              })}
            </g>

            {/* the opening the blades leave behind shows glass, not the page —
                the aperture stays a lens rather than becoming a window */}
            <circle cx={C} cy={C} r={R} fill="url(#ll-glass)" />
            <circle cx={C} cy={C} r={R - 26} fill="none" stroke="var(--color-gold)" strokeOpacity="0.14" />
            <ellipse cx="72" cy="62" rx="26" ry="15" fill="#f6f0e0" opacity="0.07" transform="rotate(-30 72 62)" />

            <g clipPath="url(#ll-clip)">
              {blades.map((b, i) => (
                <path
                  key={b.d}
                  data-blade={i}
                  d={b.d}
                  fill="url(#ll-blade)"
                  stroke="var(--color-gold)"
                  strokeOpacity="0.28"
                  strokeWidth="0.7"
                  style={{
                    transformBox: "view-box",
                    transformOrigin: b.origin,
                    transform: `rotate(${(OPEN_DEG * openness).toFixed(2)}deg)`,
                    transition: `transform ${motion}`,
                  }}
                />
              ))}
            </g>

            <circle cx={C} cy={C} r={R} fill="none" stroke="var(--color-gold)" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>
        </div>

        {/* f-stop scale: a strip of real stops slid by the same `openness`, so
            it reads like the engraved ring on a lens barrel turning. */}
        <div
          data-fstop
          className="font-poster mt-8 h-[1em] overflow-hidden text-3xl leading-none sm:text-4xl"
        >
          <div
            style={{
              transform: `translateY(${(-openness * WIDEST).toFixed(4)}em)`,
              transition: `transform ${motion}`,
            }}
          >
            {STOPS.map((s) => (
              <span key={s} className="block h-[1em] leading-none text-gradient-gold">
                {s}
              </span>
            ))}
          </div>
        </div>

        <span className="tag-label mt-3 text-ivory-dim/60">Lumeon Frames</span>
      </div>
    </div>
  );
}
