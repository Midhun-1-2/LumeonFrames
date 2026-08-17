import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-gold/10 bg-forest/95 backdrop-blur-xl" : "border-transparent bg-forest/70 backdrop-blur-md"
      )}
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
