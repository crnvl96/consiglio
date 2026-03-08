import classnames from "classnames";

type SlotRingProps = {
  slots: number;
  connected: number;
};

export function SlotRing({ slots, connected }: SlotRingProps) {
  const radius = slots <= 2 ? 64 : 80;

  return (
    <div className="relative mx-auto" style={{ width: radius * 2 + 40, height: radius * 2 + 40 }}>
      <ul className="absolute inset-0" role="list" aria-label="Slot indicators">
        {Array.from({ length: slots }, (_, i) => {
          const active = i < connected;
          const angle = (2 * Math.PI * i) / slots - Math.PI / 2;
          const cx = radius * Math.cos(angle);
          const cy = radius * Math.sin(angle);

          return (
            <li
              key={i}
              role="listitem"
              data-active={active}
              className={classnames(
                "absolute flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500",
                active
                  ? "animate-slot-in border-accent/60 bg-accent/15 text-accent shadow-[0_0_12px_var(--color-accent)/0.3]"
                  : "border-border-muted/30 bg-bg-dark/40 text-fg-muted/30",
              )}
              style={{
                left: `calc(50% + ${cx}px - 1.25rem)`,
                top: `calc(50% + ${cy}px - 1.25rem)`,
                animationDelay: active ? `${i * 80}ms` : undefined,
              }}
            >
              <span className="text-xs font-semibold select-none">{i + 1}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
