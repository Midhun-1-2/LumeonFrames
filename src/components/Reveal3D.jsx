import { motion } from "framer-motion";
import useInView from "@/hooks/useInView";

const AXES = {
  up: { rotateX: 28, rotateY: 0, y: 60 },
  left: { rotateX: 0, rotateY: -24, y: 0 },
  right: { rotateX: 0, rotateY: 24, y: 0 },
};

export default function Reveal3D({
  children,
  as: Tag = motion.div,
  axis = "up",
  delay = 0,
  duration = 0.9,
  className,
  once = true,
  amount = 0.25,
  ...props
}) {
  const rest = AXES[axis] ?? AXES.up;
  const [ref, inView] = useInView({ once, amount });

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, scale: 0.92, ...rest }}
      animate={
        inView
          ? { opacity: 1, scale: 1, rotateX: 0, rotateY: 0, y: 0 }
          : { opacity: 0, scale: 0.92, ...rest }
      }
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </Tag>
  );
}
