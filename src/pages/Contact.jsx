import { useState } from "react";
import { Mail, MapPin, Phone, CheckCircle2, Send } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import Reveal from "@/components/Reveal";
import Reveal3D from "@/components/Reveal3D";
import SplitText from "@/components/SplitText";
import Magnetic from "@/components/Magnetic";
import LeafDecor from "@/components/LeafDecor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EVENT_TYPES = ["Wedding", "Engagement / Save the Date", "Portrait Session", "Couple Shoot", "Other"];

const INFO = [
  { icon: Mail, label: "Email", value: "hello@lumeonframes.com" },
  { icon: Phone, label: "Phone", value: "+91 96335 93242" },
  { icon: Phone, label: "Phone", value: "+91 70120 67660" },
  { icon: MapPin, label: "Studio", value: "Poojapura, Trivandrum, Kerala" },
];

const fieldClass =
  "w-full rounded-none border-0 border-b border-forest-deep/20 bg-transparent px-0 py-3 text-lg text-forest-deep placeholder:text-forest-deep/35 focus-visible:border-gold-dark focus-visible:ring-0";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="relative overflow-hidden pt-28 pb-28 sm:pt-32">
      <LeafDecor className="-right-32 top-24 z-0" size={420} rotate={20} speed={0.2} opacity={0.35} />
      <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-gold/10 blur-[130px]" />

      <section className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="pb-10">
          <Reveal>
            <span className="tag-label text-gold">Get In Touch</span>
          </Reveal>
          <h1 className="font-poster mt-4 max-w-3xl text-[15vw] leading-[0.85] text-ivory sm:text-[8vw] lg:text-[5.5vw]">
            <SplitText text="Let's Talk About" />
            <br />
            <SplitText text="Your Story" delay={0.15} wordClassName="text-gradient-gold" />
          </h1>
          <Reveal delay={0.35} className="mt-6 max-w-md text-ivory-dim">
            Share a few details about your day or session, and we&apos;ll get
            back within 48 hours with availability and packages.
          </Reveal>
        </div>

        <div className="grid gap-10 py-10 lg:grid-cols-12 lg:gap-8" style={{ perspective: 1600 }}>
          {/* FORM CARD */}
          <Reveal3D axis="left" className="lg:col-span-7">
            <div className="card-ivory h-full rounded-sm p-8 shadow-2xl shadow-black/40 sm:p-10">
              {submitted ? (
                <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-5 text-gold-dark" size={48} strokeWidth={1.5} />
                  <h3 className="font-poster text-3xl text-forest-deep">Message Received</h3>
                  <p className="mt-3 max-w-sm text-forest-deep/70">
                    Thank you for reaching out — our team will be in touch
                    within 48 hours to talk through your story.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-8 rounded-full border border-gold-dark/40 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.2em] text-gold-dark transition-colors hover:bg-gold-dark hover:text-ivory"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-8 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="tag-label text-forest-deep/50">
                      01 — Full Name
                    </Label>
                    <Input id="name" required placeholder="Your name" className={fieldClass} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="tag-label text-forest-deep/50">
                      02 — Email
                    </Label>
                    <Input id="email" type="email" required placeholder="you@email.com" className={fieldClass} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date" className="tag-label text-forest-deep/50">
                      03 — Event Date
                    </Label>
                    <Input id="date" type="date" className={fieldClass} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="eventType" className="tag-label text-forest-deep/50">
                      04 — Session Type
                    </Label>
                    <select
                      id="eventType"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="h-11 border-0 border-b border-forest-deep/20 bg-transparent text-lg text-forest-deep outline-none focus-visible:border-gold-dark"
                    >
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="message" className="tag-label text-forest-deep/50">
                      05 — Tell Us Your Story
                    </Label>
                    <Textarea
                      id="message"
                      required
                      rows={4}
                      placeholder="Venue, timeline, vibe — anything you'd like us to know."
                      className={fieldClass + " resize-none"}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Magnetic>
                      <button
                        type="submit"
                        className="btn-gold group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-sans text-sm font-medium"
                      >
                        Send Enquiry
                        <Send size={14} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </Magnetic>
                  </div>
                </form>
              )}
            </div>
          </Reveal3D>

          {/* INFO SIDE */}
          <Reveal3D axis="right" className="lg:col-span-5">
            <div className="flex h-full flex-col justify-between">
              <div>
                <span className="tag-label text-gold">Studio Info</span>
                <h3 className="mt-4 font-heading text-2xl italic text-ivory">
                  Available for weddings &amp; sessions worldwide
                </h3>
                <p className="mt-3 text-sm text-ivory-dim">
                  Based in Poojapura, Trivandrum, traveling anywhere your story takes us.
                </p>

                <ul className="mt-10 space-y-6">
                  {INFO.map((item) => (
                    <li key={item.value} className="flex items-start gap-4 border-b border-forest-line/40 pb-5">
                      <item.icon size={16} className="mt-1 shrink-0 text-gold" />
                      <div>
                        <p className="tag-label text-gold/70">{item.label}</p>
                        <p className="mt-0.5 text-ivory">{item.value}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 flex items-center gap-4">
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
                <p className="text-sm text-ivory-dim">@lumeonframes</p>
              </div>
            </div>
          </Reveal3D>
        </div>
      </section>
    </div>
  );
}
