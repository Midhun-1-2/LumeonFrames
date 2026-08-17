import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import ShutterMark from "@/components/ShutterMark";
import InstagramIcon from "@/components/icons/InstagramIcon";
import Magnetic from "@/components/Magnetic";
import LeafDecor from "@/components/LeafDecor";

const EXPLORE = [
  { n: "01", label: "Home", to: "/" },
  { n: "02", label: "Gallery", to: "/gallery" },
  { n: "03", label: "About", to: "/about" },
  { n: "04", label: "Contact", to: "/contact" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gold/10 bg-ink px-6 pt-24 pb-8 lg:px-10">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
      <LeafDecor className="-left-24 bottom-0 z-0" size={320} rotate={-30} speed={0.1} opacity={0.25} />

      <div className="relative mx-auto max-w-7xl">
        <Link to="/" className="group inline-flex items-center gap-4">
          <ShutterMark size={44} className="opacity-90 sm:size-14" />
          <span className="font-poster text-6xl leading-none text-ivory sm:text-8xl">
            Lumeon <span className="text-gradient-gold">Frames</span>
          </span>
        </Link>
        <p className="mt-5 max-w-md font-heading text-lg italic text-ivory-dim">
          Turning emotions into frames — timeless wedding, portrait &amp;
          couple photography.
        </p>
      </div>

      <div className="divider-glow relative mx-auto mt-14 max-w-7xl" />

      <div className="relative mx-auto mt-12 grid max-w-7xl gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="flex items-center gap-4">
          <Magnetic>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="glow-ring flex size-11 items-center justify-center rounded-full border border-gold/25 text-gold transition-colors hover:bg-gold hover:text-forest"
              aria-label="Instagram"
            >
              <InstagramIcon size={17} />
            </a>
          </Magnetic>
        </div>

        <div>
          <span className="tag-label text-gold">Explore</span>
          <ul className="mt-5 space-y-2">
            {EXPLORE.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="group flex items-baseline gap-3 text-sm text-ivory-dim transition-colors hover:text-ivory"
                >
                  <span className="font-mono text-xs text-gold/40">{item.n}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="tag-label text-gold">Studio</span>
          <ul className="mt-5 space-y-3 text-sm text-ivory-dim">
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-gold/60" />
              Poojapura, Trivandrum, Kerala
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="shrink-0 text-gold/60" />
              hello@lumeonframes.com
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="shrink-0 text-gold/60" />
              +91 96335 93242
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="shrink-0 text-gold/60" />
              +91 70120 67660
            </li>
          </ul>
        </div>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-forest-line/50 pt-6 text-xs text-ivory-dim/60 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Lumeon Frames. All rights reserved.</p>
        <p className="tag-label">Turning Emotions Into Frames</p>
      </div>
    </footer>
  );
}
