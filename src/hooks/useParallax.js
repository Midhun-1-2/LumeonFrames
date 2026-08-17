import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

// Imperative scroll-linked value — updates via .set() outside React render,
// so it never depends on a mount-time animation (the pattern proven unreliable
// in this app; see Reveal/SplitText for the safe alternative for one-shot reveals).
export default function useParallax({ speed = 0.2, clamp = 400 } = {}) {
  const ref = useRef(null);
  const raw = useMotionValue(0);
  const y = useSpring(raw, { damping: 30, stiffness: 90, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let ticking = false;

    function apply() {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (vh - rect.top) / (vh + rect.height);
      const offset = Math.max(-clamp, Math.min(clamp, (progress - 0.5) * 2 * clamp * speed));
      raw.set(offset);
    }

    // Batches scroll ticks through requestAnimationFrame, so a burst of
    // 'scroll' events — which can fire far more often than the screen
    // repaints during a fling — collapses into one `getBoundingClientRect`
    // read per frame instead of one per event. Every `LeafDecor` on the page
    // mounts its own copy of this hook (a page can have several, and the
    // Footer's is present on every route), so an un-throttled version here
    // means that many forced-layout reads competing on the main thread on
    // every scroll tick, simultaneously — a smaller-scale version of exactly
    // the jank a per-scroll-tick effect caused elsewhere in this app.
    //
    // An earlier version called `apply` straight from the scroll handler to
    // avoid rAF, on the reasoning that a callback scheduled in a backgrounded
    // tab might stall silently. In practice browsers flush pending rAF
    // callbacks once a tab regains visibility rather than dropping them, and
    // the recovery listeners below call `apply` directly regardless of rAF —
    // so the value is corrected immediately on return even if a frame was
    // skipped while hidden.
    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        apply();
      });
    }

    // While the tab is hidden the browser stops firing scroll work, so any
    // value computed here goes stale. If the user scrolled (or the browser
    // restored a scroll position) before leaving, coming back would otherwise
    // show a frozen, out-of-date offset until the next manual scroll — so
    // re-sync on every way the page can come back into view. These fire far
    // less often than 'scroll', so they call `apply` directly rather than
    // going through the rAF batch — there's nothing to coalesce.
    apply();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", apply);
    document.addEventListener("visibilitychange", apply);
    window.addEventListener("pageshow", apply);
    window.addEventListener("focus", apply);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", apply);
      document.removeEventListener("visibilitychange", apply);
      window.removeEventListener("pageshow", apply);
      window.removeEventListener("focus", apply);
    };
  }, [speed, clamp, raw]);

  return [ref, y];
}
