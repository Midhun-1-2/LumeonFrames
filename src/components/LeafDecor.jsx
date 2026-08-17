import { motion } from "framer-motion";
import useParallax from "@/hooks/useParallax";
import { cn } from "@/lib/utils";

// Original monstera-inspired leaf silhouette — single-path, so it tints cleanly via currentColor.
const LEAF_PATH =
  "M100 8C58 8 18 46 10 96c-6 40 10 78 40 104-6-24-4-46 8-64 4 24 20 42 42 50-10-20-10-40 0-58 10 22 30 36 54 38-16-16-22-34-18-54 18 12 40 14 60 4-22-6-36-20-40-40 22 8 44 4 60-10-22 0-38-10-46-28 20 2 38-6 50-22-20 4-36-4-44-20 16-2 28-12 34-26-16 6-30 2-38-10C168 22 136 8 100 8Z";

export default function LeafDecor({
  className,
  size = 420,
  rotate = 0,
  flip = false,
  speed = 0.15,
  color = "var(--color-forest-soft)",
  opacity = 0.5,
}) {
  const [ref, y] = useParallax({ speed });

  return (
    <div
      className={cn("pointer-events-none absolute", className)}
      style={{ transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})` }}
    >
      <motion.svg
        ref={ref}
        viewBox="0 0 200 260"
        width={size}
        height={size * 1.3}
        aria-hidden="true"
        style={{ y, color, opacity }}
      >
        <path d={LEAF_PATH} fill="currentColor" />
      </motion.svg>
    </div>
  );
}
