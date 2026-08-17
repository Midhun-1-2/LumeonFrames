import { motion } from "framer-motion";
import useInView from "@/hooks/useInView";

const DIRECTIONS = {
  up: { y: 28, x: 0 },
  down: { y: -28, x: 0 },
  left: { y: 0, x: 28 },
  right: { y: 0, x: -28 },
  none: { y: 0, x: 0 },
};

export default function Reveal({
  children,
  as: Tag = motion.div,
  direction = "up",
  delay = 0,
  duration = 0.7,
  className,
  once = true,
  amount = 0.25,
  ...props
}) {
  const offset = DIRECTIONS[direction] ?? DIRECTIONS.up;
  const [ref, inView] = useInView({ once, amount });

  return (
    <Tag
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, ...offset }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </Tag>
  );
}
