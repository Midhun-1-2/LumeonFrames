import { Link } from "react-router-dom";
import { ArrowRight, Aperture, HeartHandshake, Sparkles, Camera } from "lucide-react";
import Reveal from "@/components/Reveal";
import Reveal3D from "@/components/Reveal3D";
import SplitText from "@/components/SplitText";
import TiltImage from "@/components/TiltImage";
import Magnetic from "@/components/Magnetic";
import LeafDecor from "@/components/LeafDecor";
import ApertureBand from "@/components/ApertureBand";

const PROCESS = [
  {
    icon: HeartHandshake,
    n: "01",
    title: "Consultation",
    desc: "We start with a conversation — your story, your people, the moments that matter most to you.",
  },
  {
    icon: Camera,
    n: "02",
    title: "The Shoot",
    desc: "Unobtrusive, patient, present. We chase real moments over rehearsed poses.",
  },
  {
    icon: Sparkles,
    n: "03",
    title: "The Edit",
    desc: "Every frame is hand-graded in our signature warm, cinematic tone before it reaches you.",
  },
  {
    icon: Aperture,
    n: "04",
    title: "Delivery",
    desc: "A curated gallery and fine-art prints, delivered — memories ready to be relived.",
  },
];

export default function About() {
  return (
    <div className="pt-28 sm:pt-32">
      {/* INTRO */}
      <section className="relative mx-auto grid max-w-7xl gap-14 overflow-hidden px-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
        <LeafDecor className="-left-32 -top-10 z-0" size={340} rotate={-20} speed={0.2} opacity={0.4} />
        <div className="relative lg:col-span-6">
          <Reveal>
            <span className="tag-label text-gold">About the Studio</span>
          </Reveal>
          <h1 className="font-poster mt-4 text-[15vw] leading-[0.85] text-ivory sm:text-[8vw] lg:text-[5.5vw]">
            <SplitText text="The Studio" />
            <br />
            <SplitText text="Behind the Frame" delay={0.15} wordClassName="text-gradient-gold" />
          </h1>
          <Reveal delay={0.35} className="mt-8 max-w-lg space-y-4 text-ivory-dim">
            <p>
              Lumeon Frames began with a simple frustration: too many wedding
              photographs looked staged, stiff, forgettable. We set out to
              build a studio around the opposite idea — that the truest
              photographs happen when no one&apos;s performing for the
              camera.
            </p>
            <p>
              Today we&apos;re a small collective of photographers and
              editors across Kerala, working weddings, portraits and love
              stories with the same instinct: watch closely, wait for the
              real moment, and frame it with care.
            </p>
          </Reveal>
          <Reveal delay={0.45} className="mt-8">
            <Magnetic>
              <Link
                to="/gallery"
                className="btn-gold group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-sans text-sm font-medium"
              >
                See Our Work
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>

        <Reveal3D axis="right" className="relative lg:col-span-5 lg:col-start-8">
          <TiltImage
            src="/images/about/about-02.webp"
            alt="A Lumeon Frames photographer at work"
            className="aspect-[4/5] w-full"
            imgClassName="object-face"
            eager
          />
        </Reveal3D>
      </section>

      {/* PHILOSOPHY */}
      <section className="mx-auto mt-28 max-w-4xl px-6 text-center lg:px-10">
        <Reveal>
          <span className="tag-label text-gold">Studio Philosophy</span>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-8 font-heading text-2xl italic leading-relaxed text-ivory sm:text-3xl">
            &ldquo;We don&apos;t create moments. We notice them, we wait for
            them, and when they happen — we make sure they last
            forever.&rdquo;
          </p>
        </Reveal>
      </section>

      {/* PROCESS TIMELINE */}
      <section className="relative mx-auto mt-28 max-w-7xl overflow-hidden px-6 pb-28 lg:px-10">
        <LeafDecor className="-right-32 bottom-0 z-0" size={380} rotate={160} speed={0.15} opacity={0.3} />
        <Reveal className="relative mb-16 flex items-baseline justify-between border-b border-forest-line/60 pb-6">
          <span className="tag-label text-gold">How We Work</span>
          <span className="font-poster text-3xl text-ivory sm:text-4xl">The Process</span>
        </Reveal>
        <div className="relative grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4" style={{ perspective: 1600 }}>
          <div className="divider-glow absolute left-0 right-0 top-6 hidden lg:block" />
          {PROCESS.map((item, i) => (
            <Reveal3D axis="up" delay={i * 0.1} key={item.title}>
              <div className="glow-ring relative z-10 flex size-12 items-center justify-center rounded-full border border-gold/30 bg-forest">
                <item.icon className="text-gold" size={20} strokeWidth={1.5} />
              </div>
              <span className="font-mono mt-5 block text-xs text-gold/50">{item.n}</span>
              <h3 className="mt-2 font-poster text-2xl text-ivory">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{item.desc}</p>
            </Reveal3D>
          ))}
        </div>
      </section>

      <ApertureBand />
    </div>
  );
}
