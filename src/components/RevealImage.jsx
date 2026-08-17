import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import useInView from "@/hooks/useInView";

const CLIP_FROM = {
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
  up: "inset(100% 0 0 0)",
  down: "inset(0 0 100% 0)",
};

export default function RevealImage({
  src,
  alt,
  className,
  imgClassName,
  direction = "left",
  delay = 0,
  duration = 1.1,
  eager = false,
  style,
}) {
  const [ref, inView] = useInView({ once: true, amount: 0.15 });
  const clipFrom = CLIP_FROM[direction];

  return (
    <div ref={ref} className={cn("overflow-hidden", className)} style={style}>
      <motion.img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className={cn("h-full w-full object-cover", imgClassName)}
        initial={{ clipPath: clipFrom, scale: 1.1 }}
        animate={{
          clipPath: inView ? "inset(0 0 0 0)" : clipFrom,
          scale: inView ? 1 : 1.1,
        }}
        transition={{ duration, delay, ease: [0.76, 0, 0.24, 1] }}
      />
    </div>
  );
}
