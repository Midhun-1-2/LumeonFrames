import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const active = index != null ? photos[index] : null;

  const go = useCallback(
    (dir) => {
      if (index == null) return;
      const next = (index + dir + photos.length) % photos.length;
      onNavigate(next);
    },
    [index, photos.length, onNavigate]
  );

  useEffect(() => {
    if (index == null) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, go]);

  if (!active) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 backdrop-blur-md"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="glass-pill absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full text-ivory transition-colors hover:border-gold hover:text-gold"
      >
        <X size={20} />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
        aria-label="Previous photo"
        className="glass-pill absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-ivory transition-colors hover:border-gold hover:text-gold sm:left-6"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
        aria-label="Next photo"
        className="glass-pill absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-ivory transition-colors hover:border-gold hover:text-gold sm:right-6"
      >
        <ChevronRight size={22} />
      </button>

      <figure
        key={active.slug}
        className="mx-auto flex max-h-[88vh] max-w-[92vw] flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={active.src}
          alt={active.alt}
          className="glow-gold max-h-[80vh] max-w-full rounded-[2px] object-contain shadow-2xl shadow-black/60"
        />
        <figcaption className="glass-pill flex items-center gap-3 rounded-full px-5 py-2.5 text-sm text-ivory-dim">
          <span className="font-heading italic text-lg text-ivory">{active.title}</span>
          <span className="h-1 w-1 rounded-full bg-gold" />
          <span className="tag-label text-gold">{active.category}</span>
        </figcaption>
      </figure>
    </div>,
    document.body
  );
}
