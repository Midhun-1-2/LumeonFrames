import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, Aperture, HeartHandshake, Users } from "lucide-react";

import Reveal from "@/components/Reveal";
import Reveal3D from "@/components/Reveal3D";
import SplitText from "@/components/SplitText";
import RevealImage from "@/components/RevealImage";
import TiltImage from "@/components/TiltImage";
import Magnetic from "@/components/Magnetic";
import LeafDecor from "@/components/LeafDecor";
import ImmersiveStory from "@/components/ImmersiveStory";
import Marquee from "@/components/Marquee";
import Lightbox from "@/components/Lightbox";
import { PHOTOS } from "@/data/photos";

// Curated so no single person/couple appears twice anywhere on this page —
// hero, the story sequence, services, this bento, and the CTA band each draw
// from a disjoint set of subjects, not just a disjoint set of files.
const BENTO_SLUGS = [
  "portrait-honey-01",
  "portrait-diya-02",
  "portrait-gayathri-05",
  "portrait-arya-01",
  "portrait-arushi-01",
];

const TESTIMONIALS = [
  {
    quote:
      "Every photo felt like a memory we'd already had, not one being taken. Lumeon Frames didn't just document our wedding — they understood it.",
    name: "Aparna & Vishnu",
    role: "Wedding, Trivandrum",
  },
  {
    quote:
      "Effortless, patient, and endlessly creative behind the lens. I've never felt more like myself in front of a camera.",
    name: "Diya",
    role: "Portrait Session",
  },
  {
    quote:
      "From the save-the-date to the final album, the whole experience felt like art direction, not just photography.",
    name: "Aiswarya & Karthik",
    role: "Engagement Shoot",
  },
];

const SERVICES = [
  {
    icon: HeartHandshake,
    id: "wedding",
    label: "Weddings",
    desc: "Rituals, vows and the unscripted joy in between — captured whole.",
    image: "/images/gallery-thumb/portrait-liza-01.webp",
  },
  {
    icon: Aperture,
    id: "portrait",
    label: "Portraits",
    desc: "Editorial light and honest expression, one frame at a time.",
    image: "/images/gallery-thumb/portrait-arjun-01.webp",
  },
  {
    icon: Users,
    id: "engagement",
    label: "Engagements",
    desc: "Save-the-dates and pre-wedding sessions, out where you feel at home.",
    image: "/images/gallery-thumb/portrait-lianne-01.webp",
  },
];

function Spotlight() {
  const ref = useRef(null);
  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="absolute inset-0 z-[5] opacity-0 transition-opacity duration-500 sm:opacity-100"
      style={{
        background: "radial-gradient(480px circle at var(--mx, 50%) var(--my, 50%), rgba(212,165,38,0.14), transparent 70%)",
      }}
    />
  );
}

function ServiceCard({ item, delay }) {
  return (
    <Reveal3D axis="up" delay={delay} className="group">
      <Link
        to={`/gallery?cat=${item.id}`}
        className="card-ivory block overflow-hidden rounded-sm shadow-2xl shadow-black/40 transition-transform duration-500 hover:-translate-y-2"
      >
        {/* 4:5, not 4:3 — the source photos are 2:3 portraits, and the wider
            box was cropping away everything above the shoulders */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={item.image}
            alt=""
            className="object-face h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/50 via-transparent to-transparent" />
        </div>
        <div className="p-6 sm:p-7">
          <item.icon className="text-gold-dark" size={22} strokeWidth={1.5} />
          <h3 className="mt-4 font-heading text-2xl text-forest-deep">{item.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-forest-deep/70">{item.desc}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gold-dark">
            Explore
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal3D>
  );
}

export default function Home() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [f0, f1, f2, f3, f4] = BENTO_SLUGS.map((slug) => PHOTOS.find((p) => p.slug === slug));

  return (
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <img
          src="/images/gallery/couple-04.webp"
          alt="A woman in a red dress resting beneath a tree in the hills"
          className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-transparent" />
        <Spotlight />

        <LeafDecor className="-left-24 -top-16 z-[6]" size={340} rotate={-18} speed={0.25} color="var(--color-forest-soft)" opacity={0.55} />
        <LeafDecor className="-right-20 top-1/3 z-[6]" size={280} rotate={140} flip speed={0.4} color="var(--color-forest-line)" opacity={0.4} />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-40 sm:pb-24 lg:px-10">
          <Reveal>
            <span className="tag-label text-gold">Fine-Art Wedding &amp; Portrait Studio — Trivandrum</span>
          </Reveal>
          <h1 className="font-poster mt-4 text-[16vw] text-ivory sm:text-[10vw] lg:text-[7.5vw]">
            <SplitText text="Turning Emotions" delay={0.12} />
            <br />
            <SplitText text="Into Frames" delay={0.3} wordClassName="text-gradient-gold" />
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
            <Reveal delay={0.6} className="max-w-sm text-ivory-dim">
              <p>
                A Kerala-based studio crafting cinematic wedding, portrait
                &amp; couple photography — honest, unhurried, timeless.
              </p>
            </Reveal>
            <Reveal delay={0.7} className="flex flex-wrap items-center gap-6">
              <Magnetic>
                <Link to="/gallery" className="btn-gold group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-sans text-sm font-medium">
                  View the Archive
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <Link to="/contact" className="tag-label text-ivory-dim transition-colors hover:text-gold">
                Enquire About a Session
              </Link>
            </Reveal>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 mx-auto mb-6 hidden items-center gap-2 text-ivory-dim/60 sm:flex"
        >
          <ArrowDown size={14} />
          <span className="tag-label">Scroll</span>
        </motion.div>
      </section>

      <ImmersiveStory />

      <Marquee />

      {/* SERVICES */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <LeafDecor className="-right-32 top-10 z-0" size={460} rotate={30} speed={0.2} opacity={0.35} />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="tag-label text-gold">What We Capture</span>
            <h2 className="mt-3 font-poster text-5xl text-ivory sm:text-6xl">Three Ways We Tell Your Story</h2>
          </Reveal>
          <div className="mt-16 grid gap-6 sm:grid-cols-3 sm:gap-8" style={{ perspective: 1600 }}>
            {SERVICES.map((item, i) => (
              <ServiceCard item={item} delay={i * 0.12} key={item.label} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED BENTO */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="tag-label text-gold">Studio Philosophy</span>
          <p className="mt-6 font-heading text-3xl italic leading-snug text-ivory sm:text-4xl">
            &ldquo;We don&apos;t create moments. We notice them, we wait for
            them, and when they happen — we make sure they last
            forever.&rdquo;
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4" style={{ perspective: 1800 }}>
          {f0 && (
            <Reveal3D axis="left" className="col-span-2 row-span-2">
              <button
                type="button"
                onClick={() => setLightboxIndex(PHOTOS.findIndex((p) => p.slug === f0.slug))}
                className="group block h-full w-full overflow-hidden rounded-sm border-2 border-transparent transition-colors duration-300 hover:border-gold"
              >
                <RevealImage src={f0.src} alt={f0.alt} direction="left" className="aspect-square h-full lg:aspect-auto" imgClassName="object-face" />
              </button>
            </Reveal3D>
          )}
          {f1 && (
            <Reveal3D axis="up" delay={0.08}>
              <button
                type="button"
                onClick={() => setLightboxIndex(PHOTOS.findIndex((p) => p.slug === f1.slug))}
                className="group block w-full overflow-hidden rounded-sm border-2 border-transparent transition-colors duration-300 hover:border-gold"
              >
                <RevealImage src={f1.src} alt={f1.alt} direction="up" className="aspect-[3/4]" imgClassName="object-face" />
              </button>
            </Reveal3D>
          )}
          {f2 && (
            <Reveal3D axis="up" delay={0.16}>
              <button
                type="button"
                onClick={() => setLightboxIndex(PHOTOS.findIndex((p) => p.slug === f2.slug))}
                className="group block w-full overflow-hidden rounded-sm border-2 border-transparent transition-colors duration-300 hover:border-gold"
              >
                <RevealImage src={f2.src} alt={f2.alt} direction="up" className="aspect-[3/4]" imgClassName="object-face" />
              </button>
            </Reveal3D>
          )}
          {f3 && (
            <Reveal3D axis="right" delay={0.24} className="col-span-2 sm:col-span-1">
              <button
                type="button"
                onClick={() => setLightboxIndex(PHOTOS.findIndex((p) => p.slug === f3.slug))}
                className="group block w-full overflow-hidden rounded-sm border-2 border-transparent transition-colors duration-300 hover:border-gold"
              >
                <RevealImage src={f3.src} alt={f3.alt} direction="down" className="aspect-[3/4]" imgClassName="object-face" />
              </button>
            </Reveal3D>
          )}
          {f4 && (
            <Reveal3D axis="right" delay={0.32} className="col-span-2 sm:col-span-1">
              <button
                type="button"
                onClick={() => setLightboxIndex(PHOTOS.findIndex((p) => p.slug === f4.slug))}
                className="group block w-full overflow-hidden rounded-sm border-2 border-transparent transition-colors duration-300 hover:border-gold"
              >
                <RevealImage src={f4.src} alt={f4.alt} direction="down" className="aspect-[3/4]" imgClassName="object-face" />
              </button>
            </Reveal3D>
          )}
        </div>

        <Reveal className="mt-14 flex justify-center" delay={0.2}>
          <Magnetic>
            <Link
              to="/gallery"
              className="group inline-flex items-center gap-2 rounded-full border border-gold/30 px-7 py-3.5 font-sans text-sm text-ivory transition-colors hover:border-gold hover:text-gold"
            >
              Explore the Full Gallery
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Magnetic>
        </Reveal>
      </section>

      {/* THE STUDIO */}
      <section className="relative overflow-hidden border-t border-gold/10 bg-ink py-20 lg:py-28">
        <LeafDecor className="-left-40 top-1/2 z-0 -translate-y-1/2" size={420} rotate={-12} speed={0.18} opacity={0.4} />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
          <Reveal3D axis="left" className="lg:col-span-5">
            <TiltImage
              src="/images/gallery/portrait-vaishnav-01.webp"
              alt="Golden-hour portrait from a Lumeon Frames session"
              className="aspect-[4/5] w-full"
              imgClassName="object-face"
            />
          </Reveal3D>

          <div className="lg:col-span-6 lg:col-start-7">
            <span className="tag-label text-gold">The Studio</span>
            <h2 className="font-poster mt-4 text-5xl text-ivory sm:text-6xl">
              Every Frame Holds a Feeling
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ivory-dim">
                Lumeon Frames was built on a simple belief — that the best
                photographs aren&apos;t posed, they&apos;re noticed. We spend
                our sessions watching for the in-between moments: a held
                breath before the vows, a laugh mid-sentence, a hand reaching
                for another. Then we frame it, forever.
              </p>
            </Reveal>

            <Reveal delay={0.3} className="mt-10 border-t border-forest-line/60 pt-8">
              <Link
                to="/about"
                className="tag-label inline-flex items-center gap-2 text-gold transition-colors hover:text-gold-light"
              >
                Learn Our Story
                <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <Reveal className="mx-auto mb-12 max-w-7xl px-6 text-center lg:px-10">
          <span className="tag-label text-gold">In Their Words</span>
        </Reveal>
        <div className="mx-auto grid max-w-7xl gap-6 px-6 sm:grid-cols-3 lg:px-10" style={{ perspective: 1600 }}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal3D axis={i === 0 ? "left" : i === 2 ? "right" : "up"} delay={i * 0.1} key={t.name}>
              <div className="glass-panel h-full rounded-sm p-8">
                <p className="font-heading text-lg italic leading-snug text-ivory">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="tag-label mt-6 text-gold">
                  {t.name} <span className="text-ivory-dim/50">— {t.role}</span>
                </p>
              </div>
            </Reveal3D>
          ))}
        </div>
      </section>

      {/* CTA — a wide landscape with no subject near the top, so it is centred
          rather than face-biased; a 30% crop would leave only empty sky */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <img
          src="/images/gallery/places-07.webp"
          alt=""
          className="animate-ken-burns absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/50" />
        <LeafDecor className="-right-24 -bottom-10 z-[1]" size={380} rotate={200} speed={0.3} opacity={0.3} />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <span className="tag-label text-gold">Begin Your Story</span>
          </Reveal>
          <h2 className="font-poster mt-6 text-6xl text-ivory sm:text-8xl">
            <SplitText text="Let's Create" delay={0.1} />
            <br />
            <SplitText text="Something Timeless" delay={0.25} wordClassName="text-gradient-gold" />
          </h2>
          <Reveal delay={0.4} className="mt-10">
            <Magnetic>
              <Link
                to="/contact"
                className="btn-gold group inline-flex items-center gap-2 rounded-full px-8 py-4 font-sans text-base font-medium"
              >
                Start the Conversation
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
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
