import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TiltImage({ src, alt, className, imgClassName, max = 8, eager = false }) {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { damping: 22, stiffness: 180 });
  const springY = useSpring(rotateY, { damping: 22, stiffness: 180 });

  function onMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * max * 2);
    rotateX.set(py * -max * 2);
  }

  function onMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div style={{ perspective: 1400 }} className={className}>
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full overflow-hidden rounded-[2px]"
      >
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          className={cn("h-full w-full object-cover", imgClassName)}
          style={{ transform: "translateZ(0)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent" />
      </motion.div>
    </div>
  );
}
