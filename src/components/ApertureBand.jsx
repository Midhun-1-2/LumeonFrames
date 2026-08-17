import { useRef } from "react";
import useInView from "@/hooks/useInView";

const BLADES = 6;
const C = 100; // centre of the 200x200 viewBox
const R = 92; // rim radius
// How far each blade swings back to open the iris. Negative is the direction
// that retracts the tips; the usable window is narrow — verified by sampling
// blade coverage on polar rings, 0deg is fully shut, -30deg clears the middle
// ~60% while the blades still fill the rim, and past about -35deg they swing
// off the disc entirely and disappear.
const OPEN_DEG = -30;

function polar(radius, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + radius * Math.cos(a), C + radius * Math.sin(a)];
}

// Each blade is a wedge hinged on the rim: it sweeps along the rim and closes
// to a point at the centre. With all six at rest the disc is solid; rotating
// each one about its own hinge pulls the tips outward and a hexagonal opening
// appears — the same mechanism as a real iris diaphragm.
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

export default function ApertureBand() {
  // Low threshold on purpose: this band is nearly a viewport tall, and a high
  // ratio can be unreachable on short screens, leaving the iris stuck shut.
  const [ref, inView] = useInView({ once: true, amount: 0.15 });
  const tiltRef = useRef(null);

  // Written straight to the node so the pointer never triggers a React render.
  function onMove(e) {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${py * -16}deg) rotateY(${px * 16}deg)`;
  }

  function onLeave() {
    const el = tiltRef.current;
    if (el) el.style.transform = "rotateX(0deg) rotateY(0deg)";
  }

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-gold/10 bg-ink py-24 lg:py-32"
      aria-label="Lens aperture"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[130px]" />

      <div
        className="relative mx-auto flex max-w-3xl flex-col items-center px-6"
        style={{ perspective: 1100 }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div
          ref={tiltRef}
          className="relative w-[min(78vw,340px)] transition-transform duration-300 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          <svg viewBox="0 0 200 200" className="w-full" role="img" aria-label="Camera iris opening">
            <defs>
              <radialGradient id="ab-glass" cx="38%" cy="30%" r="78%">
                <stop offset="0%" stopColor="#1d4a3d" />
                <stop offset="55%" stopColor="#0a201b" />
                <stop offset="100%" stopColor="#030907" />
              </radialGradient>
              <linearGradient id="ab-blade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1d3f36" />
                <stop offset="100%" stopColor="#0a201b" />
              </linearGradient>
              <clipPath id="ab-clip">
                <circle cx={C} cy={C} r={R} />
              </clipPath>
            </defs>

            {/* barrel tick marks, turning slowly */}
            <g className="origin-center animate-barrel-spin">
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

            {/* the glass behind the blades */}
            <circle cx={C} cy={C} r={R} fill="url(#ab-glass)" />
            <circle cx={C} cy={C} r={R - 26} fill="none" stroke="var(--color-gold)" strokeOpacity="0.14" />

            {/* specular highlight */}
            <ellipse cx="72" cy="62" rx="26" ry="15" fill="#f6f0e0" opacity="0.07" transform="rotate(-30 72 62)" />

            <g clipPath="url(#ab-clip)">
              {blades.map((b, i) => (
                <path
                  key={b.d}
                  d={b.d}
                  fill="url(#ab-blade)"
                  stroke="var(--color-gold)"
                  strokeOpacity="0.28"
                  strokeWidth="0.7"
                  style={{
                    transformBox: "view-box",
                    transformOrigin: b.origin,
                    transform: `rotate(${inView ? OPEN_DEG : 0}deg)`,
                    transition: "transform 1.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    transitionDelay: `${i * 70}ms`,
                  }}
                />
              ))}
            </g>

            <circle cx={C} cy={C} r={R} fill="none" stroke="var(--color-gold)" strokeOpacity="0.4" strokeWidth="1.5" />
          </svg>

          {/* sits in the opening the blades leave behind */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className="font-poster text-3xl leading-none text-gradient-gold transition-opacity duration-700 sm:text-4xl"
              style={{ opacity: inView ? 1 : 0, transitionDelay: "700ms" }}
            >
              f/1.4
            </span>
          </div>
        </div>

        <p
          className="mt-12 max-w-md text-center font-heading text-xl italic leading-snug text-ivory transition-all duration-700 sm:text-2xl"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "900ms",
          }}
        >
          Wide open, and letting every last bit of light in.
        </p>
        <span
          className="tag-label mt-4 text-gold transition-opacity duration-700"
          style={{ opacity: inView ? 1 : 0, transitionDelay: "1050ms" }}
        >
          Turning Emotions Into Frames
        </span>
      </div>
    </section>
  );
}
