// The original export sits on a 938x829 canvas with the aperture disc offset
// down-right of centre and 140px of dead space on the left. Rendered into a
// square box that squashed the circle into an ellipse and pushed the mark low
// against any text beside it. This is the same artwork cropped square to the
// disc's own bounds, so `size` now describes the visible mark.
import iconMark from "@/assets/brand/icon-mark-square.webp";
import { cn } from "@/lib/utils";
import useMounted from "@/hooks/useMounted";

export default function ShutterMark({ size = 40, spin = true, className }) {
  const mounted = useMounted();
  return (
    <img
      src={iconMark}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn(
        "select-none transition-all duration-700 ease-out",
        mounted ? "rotate-0 scale-100 opacity-100" : "-rotate-[35deg] scale-75 opacity-0",
        spin && "hover:rotate-90",
        className
      )}
      style={{ width: size, height: size, transitionProperty: "transform, opacity" }}
    />
  );
}
