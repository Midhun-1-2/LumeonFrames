export default function Marquee({
  items = ["Weddings", "Portraits", "Couples", "Editorials", "Engagements"],
}) {
  return (
    <div className="group relative overflow-hidden border-y border-gold/10 bg-ink py-4">
      <div className="animate-marquee flex w-max items-center gap-10 group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-10" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className="font-poster flex items-center gap-10 text-3xl text-ivory-dim/40 sm:text-4xl"
              >
                {item}
                <span className="size-1.5 rounded-full bg-gold/50" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
