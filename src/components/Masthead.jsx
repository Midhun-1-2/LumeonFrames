import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { jumpToTop } from "@/lib/scroll";
import ShutterMark from "@/components/ShutterMark";
import nevinAvatar from "@/assets/brand/nevin-avatar.webp";

// Replace with each photographer's real portfolio URL when available.
const MIDHUN_URL = null;
const NEVIN_URL = "https://nevin-portfolio.onrender.com/";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// `avatar` is optional: whoever has a photo gets it, and anyone who doesn't
// falls back to the lettered badge, so both tabs stay the same shape and size
// either way and the masthead never looks lopsided.
function PortfolioTab({ initial, name, href, avatar, align = "start" }) {
  const disabled = !href;
  return (
    <a
      href={href ?? "#"}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      onClick={(e) => disabled && e.preventDefault()}
      title={disabled ? `${name} — link coming soon` : `${name}'s portfolio`}
      aria-disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors",
        align === "end" && "flex-row-reverse",
        disabled ? "cursor-default opacity-40" : "cursor-pointer opacity-90 hover:bg-gold/10 hover:opacity-100"
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/30 font-mono text-[10px] text-gold">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            draggable={false}
            /* Square source in a square box, centred on the head at crop time,
               so no object-position bias belongs here — not even the site-wide
               object-face rule, which would shove the head off centre again. */
            className="h-full w-full select-none object-cover object-center"
          />
        ) : (
          initial
        )}
      </span>
      <span className="hidden font-sans text-[13px] tracking-wide text-ivory sm:inline">{name}</span>
    </a>
  );
}

export default function Masthead() {
  const headerRef = useRef(null);

  // Gallery's category bar sticks itself directly beneath this header, and
  // used to do that by guessing the header's height as a hardcoded pixel
  // value. That guess came from measuring this component in one environment
  // with one font-loading timeline — a real phone with a different system
  // font-size setting, a slower web-font load, or just a slightly different
  // font-substitution fallback renders this header at a different height,
  // and a fixed guess doesn't move with it. The bar below would then either
  // overlap it or leave a gap, and a bar overlapping a header reads exactly
  // like content getting cut off underneath it. Publishing the header's
  // *actual* rendered height as a CSS variable means anything anchored to it
  // tracks the real number instead of a guess, on whatever device renders it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;

    function publish() {
      document.documentElement.style.setProperty("--masthead-h", `${el.offsetHeight}px`);
    }

    publish();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", publish);
      return () => window.removeEventListener("resize", publish);
    }
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      // This used to fade between a translucent resting state and a more
      // opaque one past scrollY 20, tracked by a `scroll` listener. That
      // design was the source of three separate bugs surfacing over several
      // rounds: the blur radius snapping instead of easing (transition-colors
      // doesn't cover backdrop-filter), fixed-position drift on iOS under
      // backdrop-filter, and the `scrolled` flag simply never updating on a
      // programmatic scroll, which left the header stuck translucent while
      // scrolled content showed through it. All three traced back to the
      // same root: a background that depends on scroll state at all. Always
      // solid removes the category outright — there's no state to desync,
      // no property to mistransition, nothing behind it to show through.
      //
      // `backdrop-blur-xl` is gone too, for a related reason: at 95% opacity
      // there's only 5% of "what's behind it" left to blur, so it was buying
      // almost nothing visually — but `backdrop-filter` on a fixed element
      // has to resample the page behind it continuously as content scrolls
      // underneath, every frame, for as long as the page is scrolling. That
      // cost was confirmed reproducing on both a real phone and a plain
      // resized desktop window — not iOS-specific gesture physics, just the
      // page dropping frames under the combined compositing load, which
      // reads as the header "jumping" even though it never actually moves.
      className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-forest/95 [transform:translateZ(0)]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-8">
        <div className="flex justify-start">
          <PortfolioTab initial="M" name="Midhun" href={MIDHUN_URL} />
        </div>

        {/* Router won't re-run its navigation effect when the path is already
            "/", so scrolling has to be handled here for the click to do
            anything when the visitor is already on the home page. */}
        <Link
          to="/"
          onClick={jumpToTop}
          className="flex shrink-0 items-center gap-2.5 rounded-full px-3 py-1.5 transition-colors hover:bg-gold/10"
        >
          <ShutterMark size={28} className="shrink-0" spin={false} />
          {/* Two-line lockup. Bebas Neue reserves descender space it never
              uses, so its default line box centres the caps above the mark
              beside them; `leading-[0.78]` trims that slack so the stack's
              inked centre lands on the disc's centre (measured: 0.5px out). */}
          <span className="flex flex-col">
            <span className="font-poster block text-lg leading-[0.78] text-ivory sm:text-xl">
              Lumeon
            </span>
            {/* Tracked out so the sub-word measures the same width as
                "Lumeon" above it, which is what makes it read as a lockup
                rather than two stacked words. */}
            <span className="font-mono mt-[3px] block text-[8px] uppercase leading-none tracking-[0.34em] text-gold/80 sm:text-[9px] sm:tracking-[0.38em]">
              Frames
            </span>
          </span>
        </Link>

        <div className="flex justify-end">
          <PortfolioTab initial="N" name="Nevin" href={NEVIN_URL} avatar={nevinAvatar} align="end" />
        </div>
      </div>

      <nav className="border-t border-gold/10">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-2.5 sm:gap-10">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={jumpToTop}
              className={({ isActive }) =>
                cn(
                  "font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                  isActive ? "text-gold" : "text-ivory-dim hover:text-ivory"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
