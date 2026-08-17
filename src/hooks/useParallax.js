import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

// Imperative scroll-linked value — updates via .set() outside React render,
// so it never depends on a mount-time animation (the pattern proven unreliable
// in this app; see Reveal/SplitText for the safe alternative for one-shot reveals).
// Deliberately avoids requestAnimationFrame throttling: rAF callbacks can stall
// indefinitely in a backgrounded/non-composited tab, silently freezing the effect.
export default function useParallax({ speed = 0.2, clamp = 400 } = {}) {
  const ref = useRef(null);
  const raw = useMotionValue(0);
  const y = useSpring(raw, { damping: 30, stiffness: 90, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (vh - rect.top) / (vh + rect.height);
      const offset = Math.max(-clamp, Math.min(clamp, (progress - 0.5) * 2 * clamp * speed));
      raw.set(offset);
    }

    // While the tab is hidden the browser stops firing scroll work, so any
    // value computed here goes stale. If the user scrolled (or the browser
    // restored a scroll position) before leaving, coming back would otherwise
    // show a frozen, out-of-date offset until the next manual scroll — so
    // re-sync on every way the page can come back into view. Unconditional on
    // purpose: update() is a single getBoundingClientRect, far cheaper than
    // the risk of a visibilityState check wrongly skipping the recovery.
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pageshow", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pageshow", update);
      window.removeEventListener("focus", update);
    };
  }, [speed, clamp, raw]);

  return [ref, y];
}
