import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import useInView from "@/hooks/useInView";

export default function SplitText({
  text,
  as: Tag = "span",
  className,
  wordClassName,
  delay = 0,
  stagger = 0.045,
  once = true,
}) {
  const words = text.split(" ");
  const [ref, inView] = useInView({ once, amount: 0.6 });

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className={cn(
            "inline-block overflow-hidden pb-[0.15em] align-bottom",
            i < words.length - 1 && "mr-[0.25em]"
          )}
        >
          <motion.span
            className={cn("inline-block", wordClassName)}
            initial={{ y: "115%" }}
            animate={{ y: inView ? "0%" : "115%" }}
            transition={{ duration: 0.75, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
